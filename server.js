require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Configuración básica ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave-por-defecto-cambiar',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 } // 8 horas
}));

// Carpeta pública de la tienda (catálogo, checkout, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Archivos de diseño del panel de admin (CSS y JS del panel, no la API)
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Carpeta de imágenes de identidad (logo, banners, hero)
const brandingDir = path.join(__dirname, 'public', 'branding');
if (!fs.existsSync(brandingDir)) fs.mkdirSync(brandingDir, { recursive: true });
app.use('/branding', express.static(brandingDir));

// Carpeta de imágenes subidas por el admin
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ---------- Subida de imágenes ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `img_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  }
});
const upload = multer({ storage });

const brandingStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, brandingDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `brand_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  }
});
const uploadBranding = multer({ storage: brandingStorage });

const tmpDir = path.join(__dirname, 'data', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
const uploadTmp = multer({ dest: tmpDir });

// ---------- Middleware de seguridad del admin ----------
// Esto es lo que reemplaza el "usuario/clave en el código": la validación
// ocurre aquí, en el servidor, nunca en el navegador del visitante.
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'No autorizado' });
}

// ---------- LOGIN ADMIN ----------
app.post('/api/admin/login', (req, res) => {
  const { usuario, clave } = req.body;
  if (usuario === process.env.ADMIN_USER && clave === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Usuario o clave incorrectos' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ================= PRODUCTOS =================

// Público: solo productos activos
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE activo = 1 ORDER BY destacado DESC, fecha_creacion DESC').all();
  res.json(rows.map(formatProduct));
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ? AND activo = 1').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(formatProduct(row));
});

// Admin: todos los productos (incluye inactivos)
app.get('/api/admin/products', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY fecha_creacion DESC').all();
  res.json(rows.map(formatProduct));
});

app.post('/api/admin/products', requireAdmin, upload.array('imagenes', 6), (req, res) => {
  const { nombre, descripcion, categoria, precio_venta, precio_oferta, precio_proveedor, sku_droppi, unidades_disponibles, etiqueta, variantes, beneficios, activo, destacado } = req.body;
  const imagenes = (req.files || []).map(f => `/uploads/${f.filename}`);
  const stmt = db.prepare(`
    INSERT INTO products (nombre, descripcion, categoria, precio_venta, precio_oferta, precio_proveedor, sku_droppi, unidades_disponibles, etiqueta, variantes, beneficios, imagenes, activo, destacado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    nombre, descripcion || '', categoria || '', parseFloat(precio_venta) || 0,
    precio_oferta ? parseFloat(precio_oferta) : null,
    parseFloat(precio_proveedor) || 0, sku_droppi || '',
    parseInt(unidades_disponibles) || 0, etiqueta || '',
    variantes || '[]', beneficios || '[]',
    JSON.stringify(imagenes), activo === 'false' ? 0 : 1, destacado === 'true' ? 1 : 0
  );
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/admin/products/:id', requireAdmin, upload.array('imagenes', 6), (req, res) => {
  const id = req.params.id;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  const { nombre, descripcion, categoria, precio_venta, precio_oferta, precio_proveedor, sku_droppi, unidades_disponibles, etiqueta, variantes, beneficios, activo, destacado, imagenes_existentes } = req.body;

  let imagenes = imagenes_existentes ? JSON.parse(imagenes_existentes) : JSON.parse(existing.imagenes || '[]');
  const nuevas = (req.files || []).map(f => `/uploads/${f.filename}`);
  imagenes = imagenes.concat(nuevas);

  db.prepare(`
    UPDATE products SET nombre=?, descripcion=?, categoria=?, precio_venta=?, precio_oferta=?, precio_proveedor=?,
    sku_droppi=?, unidades_disponibles=?, etiqueta=?, variantes=?, beneficios=?, imagenes=?, activo=?, destacado=? WHERE id=?
  `).run(
    nombre, descripcion || '', categoria || '', parseFloat(precio_venta) || 0,
    precio_oferta ? parseFloat(precio_oferta) : null,
    parseFloat(precio_proveedor) || 0, sku_droppi || '',
    parseInt(unidades_disponibles) || 0, etiqueta || '',
    variantes || '[]', beneficios || '[]',
    JSON.stringify(imagenes), activo === 'false' ? 0 : 1, destacado === 'true' ? 1 : 0, id
  );
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

function formatProduct(row) {
  const resumenResenas = db.prepare(`
    SELECT COUNT(*) c, COALESCE(AVG(calificacion), 0) prom FROM reviews WHERE product_id = ? AND aprobado = 1
  `).get(row.id);
  return {
    ...row,
    imagenes: JSON.parse(row.imagenes || '[]'),
    variantes: JSON.parse(row.variantes || '[]'),
    beneficios: JSON.parse(row.beneficios || '[]'),
    resena_promedio: Math.round(resumenResenas.prom * 10) / 10,
    resena_total: resumenResenas.c
  };
}

// ---------- Importar / exportar productos en lote (CSV) ----------
// Esto es ADEMÁS de la carga manual (+ Nuevo producto), no la reemplaza.

const CSV_COLUMNAS = ['nombre', 'descripcion', 'categoria', 'precio_venta', 'precio_oferta', 'precio_proveedor', 'sku_droppi', 'unidades_disponibles', 'etiqueta', 'beneficios', 'variantes'];

function parseCSV(text) {
  // Quita el BOM si viene (Excel lo agrega al guardar en CSV)
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if (!lines.length) return [];

  // Excel en configuración regional de Colombia/Latam guarda "CSV" con punto y coma,
  // no con coma, aunque el nombre del formato diga "delimitado por comas".
  // Detectamos automáticamente cuál separador usa este archivo.
  const primeraLinea = lines[0];
  const separador = (primeraLinea.split(';').length > primeraLinea.split(',').length) ? ';' : ',';

  const parseLine = (line) => {
    const result = [];
    let cur = '', enComillas = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (enComillas && line[i + 1] === '"') { cur += '"'; i++; }
        else enComillas = !enComillas;
      } else if (ch === separador && !enComillas) {
        result.push(cur); cur = '';
      } else cur += ch;
    }
    result.push(cur);
    return result;
  };
  const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
    return row;
  });
}

// Convierte "Batería 20h|Resistente al agua|Garantía 6 meses" en la lista de beneficios
function parseBeneficiosCSV(texto) {
  if (!texto) return [];
  return texto.split('|').map(b => b.trim()).filter(Boolean);
}

// Convierte "Color:Rojo,Azul,Verde;Talla:S,M,L" en los grupos de variantes
function parseVariantesCSV(texto) {
  if (!texto) return [];
  return texto.split(';').map(grupoTexto => {
    const [grupo, opcionesTexto] = grupoTexto.split(':');
    if (!grupo || !opcionesTexto) return null;
    return { grupo: grupo.trim(), opciones: opcionesTexto.split(',').map(o => o.trim()).filter(Boolean) };
  }).filter(g => g && g.opciones.length);
}

// Plantilla descargable para que el admin la llene en Excel
app.get('/api/admin/products/import-template', requireAdmin, (req, res) => {
  const ejemplo = [
    'Audífonos Bluetooth X1', 'Audífonos inalámbricos con cancelación de ruido', 'Tecnología',
    '89000', '65000', '45000', 'DRP-1234', '10', 'Nuevo',
    'Batería 20h|Resistente al agua|Garantía 6 meses',
    'Color:Rojo,Azul,Negro'
  ];
  const csv = CSV_COLUMNAS.join(',') + '\n' + ejemplo.map(v => `"${v}"`).join(',') + '\n';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="plantilla_productos.csv"');
  res.send('\uFEFF' + csv);
});

app.post('/api/admin/products/import', requireAdmin, uploadTmp.single('csv'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });
  const buffer = fs.readFileSync(req.file.path);

  // Excel en Windows suele guardar el "CSV" en la codificación ANSI del sistema
  // (Windows-1252), no en UTF-8. Si al leerlo como UTF-8 aparecen caracteres
  // de reemplazo (los símbolos "�"), es señal de eso, y lo volvemos a leer en latin1.
  let text = buffer.toString('utf-8');
  if (text.includes('\uFFFD')) {
    text = buffer.toString('latin1');
  }

  const filas = parseCSV(text);

  let creados = 0, actualizados = 0, errores = [];
  const buscarPorSku = db.prepare('SELECT id FROM products WHERE sku_droppi = ? AND sku_droppi != \'\'');
  const insertar = db.prepare(`
    INSERT INTO products (nombre, descripcion, categoria, precio_venta, precio_oferta, precio_proveedor, sku_droppi, unidades_disponibles, etiqueta, beneficios, variantes, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  const actualizar = db.prepare(`
    UPDATE products SET nombre=?, descripcion=?, categoria=?, precio_venta=?, precio_oferta=?, precio_proveedor=?, unidades_disponibles=?, etiqueta=?, beneficios=?, variantes=? WHERE id=?
  `);

  filas.forEach((fila, idx) => {
    if (!fila.nombre || !fila.precio_venta) {
      errores.push(`Fila ${idx + 2}: falta nombre o precio_venta, se omitió.`);
      return;
    }
    const datos = [
      fila.nombre, fila.descripcion || '', fila.categoria || '',
      parseFloat(fila.precio_venta) || 0,
      fila.precio_oferta ? parseFloat(fila.precio_oferta) : null,
      parseFloat(fila.precio_proveedor) || 0,
      parseInt(fila.unidades_disponibles) || 0,
      fila.etiqueta || '',
      JSON.stringify(parseBeneficiosCSV(fila.beneficios)),
      JSON.stringify(parseVariantesCSV(fila.variantes))
    ];
    const existente = fila.sku_droppi ? buscarPorSku.get(fila.sku_droppi) : null;
    if (existente) {
      actualizar.run(datos[0], datos[1], datos[2], datos[3], datos[4], datos[5], datos[6], datos[7], datos[8], datos[9], existente.id);
      actualizados++;
    } else {
      insertar.run(datos[0], datos[1], datos[2], datos[3], datos[4], datos[5], fila.sku_droppi || '', datos[6], datos[7], datos[8], datos[9]);
      creados++;
    }
  });

  fs.unlinkSync(req.file.path);
  res.json({ ok: true, creados, actualizados, errores });
});

// ================= RESEÑAS DE PRODUCTO =================

// Público: solo reseñas ya aprobadas
app.get('/api/products/:id/reviews', (req, res) => {
  const rows = db.prepare('SELECT id, nombre, calificacion, comentario, fecha FROM reviews WHERE product_id = ? AND aprobado = 1 ORDER BY fecha DESC').all(req.params.id);
  res.json(rows);
});

// Público: dejar una reseña nueva (queda pendiente de aprobación)
app.post('/api/products/:id/reviews', (req, res) => {
  const { nombre, calificacion, comentario } = req.body;
  const cal = parseInt(calificacion);
  if (!nombre || !cal || cal < 1 || cal > 5) {
    return res.status(400).json({ error: 'Faltan datos válidos (nombre y calificación de 1 a 5)' });
  }
  db.prepare('INSERT INTO reviews (product_id, nombre, calificacion, comentario, aprobado) VALUES (?, ?, ?, ?, 0)')
    .run(req.params.id, nombre, cal, comentario || '');
  res.json({ ok: true, mensaje: 'Gracias, tu comentario quedará visible una vez sea revisado.' });
});

// Admin: ver todas las reseñas (para moderar)
app.get('/api/admin/reviews', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT reviews.*, products.nombre as nombre_producto
    FROM reviews JOIN products ON products.id = reviews.product_id
    ORDER BY reviews.aprobado ASC, reviews.fecha DESC
  `).all();
  res.json(rows);
});

app.put('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE reviews SET aprobado = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ================= CÓDIGOS DE DESCUENTO =================

app.get('/api/admin/discounts', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM discount_codes ORDER BY id DESC').all());
});

app.post('/api/admin/discounts', requireAdmin, (req, res) => {
  const { codigo, porcentaje } = req.body;
  if (!codigo || !porcentaje) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const info = db.prepare('INSERT INTO discount_codes (codigo, porcentaje, activo) VALUES (?, ?, 1)')
      .run(codigo.trim().toUpperCase(), parseFloat(porcentaje));
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Ese código ya existe' });
  }
});

app.put('/api/admin/discounts/:id', requireAdmin, (req, res) => {
  const { activo, porcentaje } = req.body;
  const existing = db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  db.prepare('UPDATE discount_codes SET activo=?, porcentaje=? WHERE id=?').run(
    activo !== undefined ? (activo ? 1 : 0) : existing.activo,
    porcentaje !== undefined ? parseFloat(porcentaje) : existing.porcentaje,
    req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/admin/discounts/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM discount_codes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Público: aplicar un código de descuento (valida el bloqueo global de 5 minutos)
app.post('/api/apply-discount', (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Escribe un código' });

  const code = db.prepare('SELECT * FROM discount_codes WHERE codigo = ? AND activo = 1').get(codigo.trim().toUpperCase());
  if (!code) return res.status(404).json({ error: 'Código inválido o inactivo' });

  if (code.ultimo_uso) {
    const segundosDesdeUso = (Date.now() - new Date(code.ultimo_uso.replace(' ', 'T')).getTime()) / 1000;
    if (segundosDesdeUso < 300) {
      const restante = Math.ceil(300 - segundosDesdeUso);
      return res.status(429).json({ error: `Este código ya se usó hace poco. Intenta de nuevo en ${Math.ceil(restante / 60)} min.` });
    }
  }

  db.prepare("UPDATE discount_codes SET ultimo_uso = datetime('now','localtime') WHERE id = ?").run(code.id);
  res.json({ ok: true, codigo: code.codigo, porcentaje: code.porcentaje });
});

// ================= MENÚS EMERGENTES (Cómo funciona / Testimonios / Política / etc.) =================

app.get('/api/popups', (req, res) => {
  const popups = db.prepare('SELECT * FROM popups WHERE activo = 1 ORDER BY orden ASC').all();
  const items = db.prepare('SELECT * FROM popup_items ORDER BY orden ASC').all();
  res.json(popups.map(p => ({ ...p, items: items.filter(i => i.popup_id === p.id) })));
});

app.get('/api/admin/popups', requireAdmin, (req, res) => {
  const popups = db.prepare('SELECT * FROM popups ORDER BY orden ASC').all();
  const items = db.prepare('SELECT * FROM popup_items ORDER BY orden ASC').all();
  res.json(popups.map(p => ({ ...p, items: items.filter(i => i.popup_id === p.id) })));
});

app.post('/api/admin/popups', requireAdmin, (req, res) => {
  const { titulo_menu, tipo, contenido_texto } = req.body;
  if (!titulo_menu || !tipo) return res.status(400).json({ error: 'Faltan datos' });
  const maxOrden = db.prepare('SELECT COALESCE(MAX(orden), -1) m FROM popups').get().m;
  const info = db.prepare('INSERT INTO popups (titulo_menu, tipo, contenido_texto, activo, orden) VALUES (?, ?, ?, 1, ?)')
    .run(titulo_menu, tipo, contenido_texto || '', maxOrden + 1);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/admin/popups/:id', requireAdmin, (req, res) => {
  const { titulo_menu, contenido_texto, activo, orden } = req.body;
  const existing = db.prepare('SELECT * FROM popups WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  db.prepare('UPDATE popups SET titulo_menu=?, contenido_texto=?, activo=?, orden=? WHERE id=?').run(
    titulo_menu ?? existing.titulo_menu,
    contenido_texto ?? existing.contenido_texto,
    activo !== undefined ? (activo ? 1 : 0) : existing.activo,
    orden !== undefined ? orden : existing.orden,
    req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/admin/popups/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM popup_items WHERE popup_id = ?').run(req.params.id);
  db.prepare('DELETE FROM popups WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/admin/popups/:id/items', requireAdmin, uploadBranding.single('imagen'), (req, res) => {
  const { titulo, texto, icono, animacion, animacion_texto } = req.body;
  const maxOrden = db.prepare('SELECT COALESCE(MAX(orden), -1) m FROM popup_items WHERE popup_id = ?').get(req.params.id).m;
  const imagen = req.file ? `/branding/${req.file.filename}` : '';
  const info = db.prepare(`
    INSERT INTO popup_items (popup_id, titulo, texto, imagen, icono, animacion, animacion_texto, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, titulo || '', texto || '', imagen, icono || '', animacion || 'none', animacion_texto || 'none', maxOrden + 1);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/admin/popups/items/:itemId', requireAdmin, uploadBranding.single('imagen'), (req, res) => {
  const existing = db.prepare('SELECT * FROM popup_items WHERE id = ?').get(req.params.itemId);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const { titulo, texto, icono, animacion, animacion_texto } = req.body;
  const imagen = req.file ? `/branding/${req.file.filename}` : existing.imagen;
  db.prepare('UPDATE popup_items SET titulo=?, texto=?, imagen=?, icono=?, animacion=?, animacion_texto=? WHERE id=?').run(
    titulo ?? existing.titulo, texto ?? existing.texto, imagen,
    icono ?? existing.icono, animacion ?? existing.animacion, animacion_texto ?? existing.animacion_texto, req.params.itemId
  );
  res.json({ ok: true });
});

app.delete('/api/admin/popups/items/:itemId', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM popup_items WHERE id = ?').run(req.params.itemId);
  res.json({ ok: true });
});

// ================= PEDIDOS =================

// Público: crear pedido (checkout sin login)
app.post('/api/orders', (req, res) => {
  const { nombre_cliente, telefono, direccion, ciudad, departamento, notas_cliente, items, codigo_descuento } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  const obligatorios = getSettings().campos_obligatorios || {};
  const valores = { nombre_cliente, telefono, direccion, ciudad, departamento, notas_cliente };
  const ETIQUETAS_CAMPO = {
    nombre_cliente: 'Nombre completo', telefono: 'Teléfono', direccion: 'Dirección',
    ciudad: 'Ciudad', departamento: 'Departamento', notas_cliente: 'Notas'
  };
  for (const campo of Object.keys(ETIQUETAS_CAMPO)) {
    if (obligatorios[campo] && !valores[campo]) {
      return res.status(400).json({ error: `El campo "${ETIQUETAS_CAMPO[campo]}" es obligatorio` });
    }
  }
  // Nombre, teléfono y dirección siempre son indispensables para poder entregar el pedido,
  // sin importar cómo se configuren los campos obligatorios.
  if (!nombre_cliente || !telefono || !direccion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para el envío' });
  }

  let total = 0;
  const productosValidados = [];
  for (const item of items) {
    const prod = db.prepare('SELECT * FROM products WHERE id = ? AND activo = 1').get(item.product_id);
    if (!prod) continue;
    const cantidad = parseInt(item.cantidad) || 1;
    const precioUnit = (prod.precio_oferta && prod.precio_oferta > 0 && prod.precio_oferta < prod.precio_venta) ? prod.precio_oferta : prod.precio_venta;
    const subtotal = precioUnit * cantidad;
    total += subtotal;
    productosValidados.push({
      product_id: prod.id, nombre_producto: prod.nombre, sku_droppi: prod.sku_droppi,
      cantidad, precio_unitario: precioUnit, subtotal, variante: item.variante || ''
    });
  }

  if (!productosValidados.length) return res.status(400).json({ error: 'No hay productos válidos en el pedido' });

  // Código de descuento (opcional) — se revalida aquí por si el código cambió de estado
  let descuentoValor = 0;
  let codigoAplicado = '';
  if (codigo_descuento) {
    const code = db.prepare('SELECT * FROM discount_codes WHERE codigo = ? AND activo = 1').get(String(codigo_descuento).trim().toUpperCase());
    if (code) {
      descuentoValor = Math.round(total * (code.porcentaje / 100));
      codigoAplicado = code.codigo;
    }
  }
  const totalConDescuento = total - descuentoValor;

  const insertOrder = db.prepare(`
    INSERT INTO orders (nombre_cliente, telefono, direccion, ciudad, departamento, notas_cliente, precio_total, estado, descuento_codigo, descuento_valor)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?)
  `);
  const info = insertOrder.run(nombre_cliente, telefono, direccion, ciudad || '', departamento || '', notas_cliente || '', totalConDescuento, codigoAplicado, descuentoValor);
  const orderId = info.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, nombre_producto, sku_droppi, cantidad, precio_unitario, subtotal, variante)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const descontarStock = db.prepare(`
    UPDATE products SET unidades_disponibles = MAX(0, unidades_disponibles - ?) WHERE id = ?
  `);
  for (const p of productosValidados) {
    insertItem.run(orderId, p.product_id, p.nombre_producto, p.sku_droppi, p.cantidad, p.precio_unitario, p.subtotal, p.variante);
    descontarStock.run(p.cantidad, p.product_id);
  }

  res.json({ ok: true, id_pedido: orderId, total: totalConDescuento, descuento: descuentoValor });
});

// Admin: listar pedidos con sus items
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const items = db.prepare('SELECT * FROM order_items').all();
  const withItems = orders.map(o => ({
    ...o,
    items: items.filter(i => i.order_id === o.id)
  }));
  res.json(withItems);
});

app.put('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const { estado, transportadora, numero_guia, referencia_droppi, necesita_contacto, notas_internas } = req.body;
  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' });

  const ESTADOS_QUE_LIBERAN_STOCK = ['Cancelado', 'Devuelto'];
  const nuevoEstado = estado ?? existing.estado;
  const estabaLiberado = ESTADOS_QUE_LIBERAN_STOCK.includes(existing.estado);
  const quedaLiberado = ESTADOS_QUE_LIBERAN_STOCK.includes(nuevoEstado);

  if (!estabaLiberado && quedaLiberado) {
    // Se cancela o se marca como devuelto: devolvemos las unidades al inventario
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
    const restaurar = db.prepare('UPDATE products SET unidades_disponibles = unidades_disponibles + ? WHERE id = ?');
    items.forEach(i => { if (i.product_id) restaurar.run(i.cantidad, i.product_id); });
  } else if (estabaLiberado && !quedaLiberado) {
    // Se reactiva un pedido que estaba cancelado/devuelto: volvemos a descontar el stock
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
    const descontar = db.prepare('UPDATE products SET unidades_disponibles = MAX(0, unidades_disponibles - ?) WHERE id = ?');
    items.forEach(i => { if (i.product_id) descontar.run(i.cantidad, i.product_id); });
  }

  db.prepare(`
    UPDATE orders SET estado=?, transportadora=?, numero_guia=?, referencia_droppi=?, necesita_contacto=?, notas_internas=? WHERE id=?
  `).run(
    nuevoEstado,
    transportadora ?? existing.transportadora,
    numero_guia ?? existing.numero_guia,
    referencia_droppi ?? existing.referencia_droppi,
    necesita_contacto !== undefined ? (necesita_contacto ? 1 : 0) : existing.necesita_contacto,
    notas_internas ?? existing.notas_internas,
    req.params.id
  );
  res.json({ ok: true });
});

// Público: rastreo de pedido sin necesidad de cuenta (número de pedido + teléfono)
app.get('/api/track', (req, res) => {
  const { id, telefono } = req.query;
  if (!id || !telefono) return res.status(400).json({ error: 'Faltan datos' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order || order.telefono.replace(/\s+/g, '') !== String(telefono).replace(/\s+/g, '')) {
    return res.status(404).json({ error: 'No encontramos un pedido con esos datos. Verifica el número de pedido y el teléfono.' });
  }

  const items = db.prepare('SELECT nombre_producto, cantidad, variante FROM order_items WHERE order_id = ?').all(id);
  res.json({
    id: order.id,
    fecha_hora: order.fecha_hora,
    estado: order.estado,
    transportadora: order.transportadora || '',
    numero_guia: order.numero_guia || '',
    ciudad: order.ciudad,
    precio_total: order.precio_total,
    items
  });
});

// Exportar pedidos a CSV (se abre directo en Excel)
app.get('/api/admin/orders/export', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const items = db.prepare('SELECT * FROM order_items').all();

  let csv = 'ID Pedido,Fecha,Cliente,Telefono,Direccion,Ciudad,Departamento,Productos,Descuento,Total,Estado,Transportadora,Guia,Referencia Droppi,Notas\n';
  for (const o of orders) {
    const its = items.filter(i => i.order_id === o.id)
      .map(i => `${i.nombre_producto}${i.variante ? ' [' + i.variante + ']' : ''} (${i.sku_droppi || 's/n'}) x${i.cantidad}`)
      .join(' | ');
    const row = [
      o.id, o.fecha_hora, o.nombre_cliente, o.telefono, o.direccion, o.ciudad, o.departamento,
      its, o.descuento_valor || 0, o.precio_total, o.estado, o.transportadora || '', o.numero_guia || '', o.referencia_droppi || '', o.notas_internas || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    csv += row + '\n';
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="pedidos_${Date.now()}.csv"`);
  res.send('\uFEFF' + csv); // BOM para que Excel lea bien las tildes
});

// ================= MÉTRICAS =================
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  const totalPedidos = db.prepare('SELECT COUNT(*) c FROM orders').get().c;
  const ventasTotales = db.prepare("SELECT COALESCE(SUM(precio_total),0) s FROM orders WHERE estado != 'Cancelado'").get().s;
  const porEstado = db.prepare('SELECT estado, COUNT(*) c FROM orders GROUP BY estado').all();
  const pendientesContacto = db.prepare('SELECT COUNT(*) c FROM orders WHERE necesita_contacto = 1').get().c;

  const hoy = new Date().toISOString().slice(0, 10);
  const pedidosHoy = db.prepare("SELECT COUNT(*) c FROM orders WHERE fecha_hora LIKE ?").get(`${hoy}%`).c;
  const ventasHoy = db.prepare("SELECT COALESCE(SUM(precio_total),0) s FROM orders WHERE fecha_hora LIKE ? AND estado != 'Cancelado'").get(`${hoy}%`).s;

  const masVendidos = db.prepare(`
    SELECT nombre_producto, SUM(cantidad) total_vendido
    FROM order_items GROUP BY nombre_producto ORDER BY total_vendido DESC LIMIT 5
  `).all();

  res.json({ totalPedidos, ventasTotales, porEstado, pendientesContacto, pedidosHoy, ventasHoy, masVendidos });
});

// ================= CONFIGURACIÓN DE LA TIENDA (identidad, colores, banners) =================

function getSettings() {
  const row = db.prepare('SELECT data FROM site_settings WHERE id = 1').get();
  const saved = row ? JSON.parse(row.data) : {};
  // Combina con los valores por defecto para que las tiendas creadas antes de agregar
  // un campo nuevo (ej. countdown, textos) no se rompan por falta de esa llave.
  return {
    ...db.DEFAULT_SETTINGS,
    ...saved,
    social: { ...db.DEFAULT_SETTINGS.social, ...(saved.social || {}) },
    countdown: { ...db.DEFAULT_SETTINGS.countdown, ...(saved.countdown || {}) },
    textos: { ...db.DEFAULT_SETTINGS.textos, ...(saved.textos || {}) },
    campos_obligatorios: { ...db.DEFAULT_SETTINGS.campos_obligatorios, ...(saved.campos_obligatorios || {}) },
    color_primary_gradient: { ...db.DEFAULT_SETTINGS.color_primary_gradient, ...(saved.color_primary_gradient || {}) },
    color_accent_gradient: { ...db.DEFAULT_SETTINGS.color_accent_gradient, ...(saved.color_accent_gradient || {}) }
  };
}

// Público: la tienda lo consulta para pintar logo, colores, banners, redes
app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

app.get('/api/admin/settings', requireAdmin, (req, res) => {
  res.json(getSettings());
});

app.put('/api/admin/settings', requireAdmin, uploadBranding.any(), (req, res) => {
  const current = getSettings();
  const b = req.body;
  const files = req.files || [];
  const fileByField = {};
  files.forEach(f => { fileByField[f.fieldname] = f; });

  const bannersMeta = b.banners_json ? JSON.parse(b.banners_json) : current.banners;
  const banners = bannersMeta.map((banner, i) => {
    const fileKey = `banner_image_${i}`;
    return {
      image: fileByField[fileKey] ? `/branding/${fileByField[fileKey].filename}` : (banner.image || ''),
      title: banner.title || '',
      link: banner.link || '',
      ancho_completo: !!banner.ancho_completo
    };
  });

  // Diapositivas del Hero (slider) — cada una con su propia imagen opcional
  const heroSlidesMeta = b.hero_slides_json ? JSON.parse(b.hero_slides_json) : current.hero_slides;
  const heroSlides = heroSlidesMeta.map((slide, i) => {
    const fileKey = `hero_slide_image_${i}`;
    return {
      image: fileByField[fileKey] ? `/branding/${fileByField[fileKey].filename}` : (slide.image || ''),
      titulo: slide.titulo || '',
      subtitulo: slide.subtitulo || ''
    };
  });

  const updated = {
    ...current,
    brand_name: b.brand_name || current.brand_name,
    color_primary: b.color_primary || current.color_primary,
    color_accent: b.color_accent || current.color_accent,
    color_teal: b.color_teal || current.color_teal,
    color_texto: b.color_texto || current.color_texto,
    color_iconos: b.color_iconos || current.color_iconos,
    color_header_texto: b.color_header_texto || current.color_header_texto,
    color_menu_texto: b.color_menu_texto || current.color_menu_texto,
    color_categorias: b.color_categorias || current.color_categorias,
    logo_size: b.logo_size !== undefined ? parseInt(b.logo_size) || current.logo_size : current.logo_size,
    header_copyright: b.header_copyright ?? current.header_copyright,
    hero_title: b.hero_title ?? current.hero_title,
    hero_subtitle: b.hero_subtitle ?? current.hero_subtitle,
    hero_slides: heroSlides,
    hero_mostrar_texto: b.hero_mostrar_texto !== undefined ? b.hero_mostrar_texto === 'true' : current.hero_mostrar_texto,
    hero_altura: b.hero_altura || current.hero_altura,
    hero_altura_px: b.hero_altura_px !== undefined ? parseInt(b.hero_altura_px) || current.hero_altura_px : current.hero_altura_px,
    hero_opacidad_imagen: b.hero_opacidad_imagen !== undefined ? parseInt(b.hero_opacidad_imagen) : current.hero_opacidad_imagen,
    hero_oscurecer_imagen: b.hero_oscurecer_imagen !== undefined ? parseInt(b.hero_oscurecer_imagen) : current.hero_oscurecer_imagen,
    hero_ocultar_imagen_movil: b.hero_ocultar_imagen_movil !== undefined ? b.hero_ocultar_imagen_movil === 'true' : current.hero_ocultar_imagen_movil,
    hero_autoplay: b.hero_autoplay !== undefined ? b.hero_autoplay === 'true' : current.hero_autoplay,
    hero_intervalo_segundos: b.hero_intervalo_segundos !== undefined ? parseInt(b.hero_intervalo_segundos) || 5 : current.hero_intervalo_segundos,
    footer_text: b.footer_text ?? current.footer_text,
    layout: b.layout ? JSON.parse(b.layout) : (current.layout || ['hero', 'banners', 'productos']),
    social: {
      facebook: b.social_facebook ?? current.social.facebook,
      instagram: b.social_instagram ?? current.social.instagram,
      whatsapp: b.social_whatsapp ?? current.social.whatsapp,
      tiktok: b.social_tiktok ?? current.social.tiktok
    },
    envio_dias_habiles: b.envio_dias_habiles !== undefined ? parseInt(b.envio_dias_habiles) || 0 : current.envio_dias_habiles,
    countdown: b.countdown_json ? JSON.parse(b.countdown_json) : current.countdown,
    textos: b.textos_json ? { ...current.textos, ...JSON.parse(b.textos_json) } : current.textos,
    campos_obligatorios: b.campos_obligatorios_json ? { ...current.campos_obligatorios, ...JSON.parse(b.campos_obligatorios_json) } : current.campos_obligatorios,
    color_primary_gradient: b.color_primary_gradient_json ? JSON.parse(b.color_primary_gradient_json) : current.color_primary_gradient,
    color_accent_gradient: b.color_accent_gradient_json ? JSON.parse(b.color_accent_gradient_json) : current.color_accent_gradient,
    carrito_banner_link: b.carrito_banner_link ?? current.carrito_banner_link,
    banners
  };

  if (fileByField.logo) updated.logo_url = `/branding/${fileByField.logo.filename}`;
  if (b.remove_logo === 'true') updated.logo_url = '';

  if (fileByField.hero_image) updated.hero_image = `/branding/${fileByField.hero_image.filename}`;
  if (b.remove_hero_image === 'true') updated.hero_image = '';

  if (fileByField.favicon) updated.favicon_url = `/branding/${fileByField.favicon.filename}`;
  if (b.remove_favicon === 'true') updated.favicon_url = '';

  if (fileByField.carrito_banner_imagen) updated.carrito_banner_imagen = `/branding/${fileByField.carrito_banner_imagen.filename}`;
  if (b.remove_carrito_banner === 'true') updated.carrito_banner_imagen = '';

  if (fileByField.confirmacion_imagen) updated.confirmacion_imagen = `/branding/${fileByField.confirmacion_imagen.filename}`;
  if (b.remove_confirmacion_imagen === 'true') updated.confirmacion_imagen = '';

  db.prepare('UPDATE site_settings SET data = ? WHERE id = 1').run(JSON.stringify(updated));
  res.json({ ok: true, settings: updated });
});

// ================= RUTAS DE PÁGINAS =================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});
app.get('/admin/panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'panel.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Tienda corriendo en http://localhost:${PORT}`);
  console.log(`✅ Panel admin en http://localhost:${PORT}/admin\n`);
});
