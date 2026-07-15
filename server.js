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
  const { nombre, descripcion, categoria, precio_venta, precio_oferta, precio_proveedor, sku_droppi, unidades_disponibles, activo, destacado } = req.body;
  const imagenes = (req.files || []).map(f => `/uploads/${f.filename}`);
  const stmt = db.prepare(`
    INSERT INTO products (nombre, descripcion, categoria, precio_venta, precio_oferta, precio_proveedor, sku_droppi, unidades_disponibles, imagenes, activo, destacado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    nombre, descripcion || '', categoria || '', parseFloat(precio_venta) || 0,
    precio_oferta ? parseFloat(precio_oferta) : null,
    parseFloat(precio_proveedor) || 0, sku_droppi || '',
    parseInt(unidades_disponibles) || 0,
    JSON.stringify(imagenes), activo === 'false' ? 0 : 1, destacado === 'true' ? 1 : 0
  );
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/admin/products/:id', requireAdmin, upload.array('imagenes', 6), (req, res) => {
  const id = req.params.id;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  const { nombre, descripcion, categoria, precio_venta, precio_oferta, precio_proveedor, sku_droppi, unidades_disponibles, activo, destacado, imagenes_existentes } = req.body;

  let imagenes = imagenes_existentes ? JSON.parse(imagenes_existentes) : JSON.parse(existing.imagenes || '[]');
  const nuevas = (req.files || []).map(f => `/uploads/${f.filename}`);
  imagenes = imagenes.concat(nuevas);

  db.prepare(`
    UPDATE products SET nombre=?, descripcion=?, categoria=?, precio_venta=?, precio_oferta=?, precio_proveedor=?,
    sku_droppi=?, unidades_disponibles=?, imagenes=?, activo=?, destacado=? WHERE id=?
  `).run(
    nombre, descripcion || '', categoria || '', parseFloat(precio_venta) || 0,
    precio_oferta ? parseFloat(precio_oferta) : null,
    parseFloat(precio_proveedor) || 0, sku_droppi || '',
    parseInt(unidades_disponibles) || 0,
    JSON.stringify(imagenes), activo === 'false' ? 0 : 1, destacado === 'true' ? 1 : 0, id
  );
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

function formatProduct(row) {
  return { ...row, imagenes: JSON.parse(row.imagenes || '[]') };
}

// ================= PEDIDOS =================

// Público: crear pedido (checkout sin login)
app.post('/api/orders', (req, res) => {
  const { nombre_cliente, telefono, direccion, ciudad, departamento, notas_cliente, items } = req.body;

  if (!nombre_cliente || !telefono || !direccion || !ciudad || !items || !items.length) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  let total = 0;
  const productosValidados = [];
  for (const item of items) {
    const prod = db.prepare('SELECT * FROM products WHERE id = ? AND activo = 1').get(item.product_id);
    if (!prod) continue;
    const cantidad = parseInt(item.cantidad) || 1;
    const subtotal = prod.precio_venta * cantidad;
    total += subtotal;
    productosValidados.push({
      product_id: prod.id, nombre_producto: prod.nombre, sku_droppi: prod.sku_droppi,
      cantidad, precio_unitario: prod.precio_venta, subtotal
    });
  }

  if (!productosValidados.length) return res.status(400).json({ error: 'No hay productos válidos en el pedido' });

  const insertOrder = db.prepare(`
    INSERT INTO orders (nombre_cliente, telefono, direccion, ciudad, departamento, notas_cliente, precio_total, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')
  `);
  const info = insertOrder.run(nombre_cliente, telefono, direccion, ciudad, departamento || '', notas_cliente || '', total);
  const orderId = info.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, nombre_producto, sku_droppi, cantidad, precio_unitario, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of productosValidados) {
    insertItem.run(orderId, p.product_id, p.nombre_producto, p.sku_droppi, p.cantidad, p.precio_unitario, p.subtotal);
  }

  res.json({ ok: true, id_pedido: orderId, total });
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
  const { estado, transportadora, numero_guia, necesita_contacto, notas_internas } = req.body;
  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' });

  db.prepare(`
    UPDATE orders SET estado=?, transportadora=?, numero_guia=?, necesita_contacto=?, notas_internas=? WHERE id=?
  `).run(
    estado ?? existing.estado,
    transportadora ?? existing.transportadora,
    numero_guia ?? existing.numero_guia,
    necesita_contacto !== undefined ? (necesita_contacto ? 1 : 0) : existing.necesita_contacto,
    notas_internas ?? existing.notas_internas,
    req.params.id
  );
  res.json({ ok: true });
});

// Exportar pedidos a CSV (se abre directo en Excel)
app.get('/api/admin/orders/export', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const items = db.prepare('SELECT * FROM order_items').all();

  let csv = 'ID Pedido,Fecha,Cliente,Telefono,Direccion,Ciudad,Departamento,Productos,Total,Estado,Transportadora,Guia,Notas\n';
  for (const o of orders) {
    const its = items.filter(i => i.order_id === o.id)
      .map(i => `${i.nombre_producto} (${i.sku_droppi || 's/n'}) x${i.cantidad}`)
      .join(' | ');
    const row = [
      o.id, o.fecha_hora, o.nombre_cliente, o.telefono, o.direccion, o.ciudad, o.departamento,
      its, o.precio_total, o.estado, o.transportadora || '', o.numero_guia || '', o.notas_internas || ''
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
  return row ? JSON.parse(row.data) : db.DEFAULT_SETTINGS;
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
      link: banner.link || ''
    };
  });

  const updated = {
    ...current,
    brand_name: b.brand_name || current.brand_name,
    color_primary: b.color_primary || current.color_primary,
    color_accent: b.color_accent || current.color_accent,
    color_teal: b.color_teal || current.color_teal,
    hero_title: b.hero_title ?? current.hero_title,
    hero_subtitle: b.hero_subtitle ?? current.hero_subtitle,
    footer_text: b.footer_text ?? current.footer_text,
    layout: b.layout ? JSON.parse(b.layout) : (current.layout || ['hero', 'banners', 'productos']),
    social: {
      facebook: b.social_facebook ?? current.social.facebook,
      instagram: b.social_instagram ?? current.social.instagram,
      whatsapp: b.social_whatsapp ?? current.social.whatsapp,
      tiktok: b.social_tiktok ?? current.social.tiktok
    },
    banners
  };

  if (fileByField.logo) updated.logo_url = `/branding/${fileByField.logo.filename}`;
  if (fileByField.hero_image) updated.hero_image = `/branding/${fileByField.hero_image.filename}`;

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
