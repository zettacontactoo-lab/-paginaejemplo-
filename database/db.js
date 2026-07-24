const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'tienda.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    precio_venta REAL NOT NULL,
    precio_oferta REAL,
    precio_proveedor REAL,
    sku_droppi TEXT,
    stock TEXT DEFAULT 'disponible',
    unidades_disponibles INTEGER DEFAULT 0,
    imagenes TEXT DEFAULT '[]',
    activo INTEGER DEFAULT 1,
    destacado INTEGER DEFAULT 0,
    fecha_creacion TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_hora TEXT DEFAULT (datetime('now', 'localtime')),
    nombre_cliente TEXT NOT NULL,
    telefono TEXT NOT NULL,
    direccion TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    departamento TEXT,
    notas_cliente TEXT,
    precio_total REAL NOT NULL,
    estado TEXT DEFAULT 'Pendiente',
    transportadora TEXT,
    numero_guia TEXT,
    necesita_contacto INTEGER DEFAULT 0,
    notas_internas TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    nombre_producto TEXT NOT NULL,
    sku_droppi TEXT,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS popups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo_menu TEXT NOT NULL,
    tipo TEXT NOT NULL,
    contenido_texto TEXT DEFAULT '',
    activo INTEGER DEFAULT 1,
    orden INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS popup_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    popup_id INTEGER NOT NULL,
    titulo TEXT DEFAULT '',
    texto TEXT DEFAULT '',
    imagen TEXT DEFAULT '',
    icono TEXT DEFAULT '',
    animacion TEXT DEFAULT 'none',
    orden INTEGER DEFAULT 0,
    FOREIGN KEY (popup_id) REFERENCES popups(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    calificacion INTEGER NOT NULL,
    comentario TEXT DEFAULT '',
    aprobado INTEGER DEFAULT 0,
    fecha TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS discount_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    porcentaje REAL NOT NULL,
    activo INTEGER DEFAULT 1,
    ultimo_uso TEXT
  );
`);

// Migración segura para bases de datos ya existentes (creadas antes de estos campos)
function addColumnIfMissing(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
addColumnIfMissing('products', 'precio_oferta', 'REAL');
addColumnIfMissing('products', 'unidades_disponibles', 'INTEGER DEFAULT 0');
addColumnIfMissing('products', 'etiqueta', "TEXT DEFAULT ''");
addColumnIfMissing('products', 'variantes', "TEXT DEFAULT '[]'");
addColumnIfMissing('products', 'beneficios', "TEXT DEFAULT '[]'");
addColumnIfMissing('order_items', 'variante', "TEXT DEFAULT ''");
addColumnIfMissing('orders', 'referencia_droppi', "TEXT DEFAULT ''");
addColumnIfMissing('orders', 'descuento_codigo', "TEXT DEFAULT ''");
addColumnIfMissing('orders', 'descuento_valor', 'REAL DEFAULT 0');
addColumnIfMissing('popup_items', 'animacion_texto', "TEXT DEFAULT 'none'");

// Configuración por defecto de la tienda (identidad, colores, banners, redes)
const DEFAULT_SETTINGS = {
  brand_name: 'TuTienda',
  logo_url: '',
  favicon_url: '',
  color_primary: '#14161F',
  color_accent: '#FFC93C',
  color_teal: '#0E7C7B',
  color_texto: '#1B1B1F',
  color_iconos: '#14161F',
  color_header_texto: '#FFFFFF',
  color_menu_texto: '#D5D6E0',
  hero_title: 'Compra sin miedo.\nPaga cuando lo tengas en tus manos.',
  hero_subtitle: 'Escoge tus productos, llena tus datos de envío y listo — nosotros llegamos hasta tu puerta.',
  hero_image: '',
  hero_slides: [],
  hero_mostrar_texto: true,
  hero_altura: 'full',
  hero_altura_px: 480,
  hero_opacidad_imagen: 100,
  hero_oscurecer_imagen: 40,
  hero_ocultar_imagen_movil: false,
  hero_autoplay: true,
  hero_intervalo_segundos: 5,
  layout: ['hero', 'banners', 'productos'],
  banners: [
    { image: '', title: '', link: '', ancho_completo: false },
    { image: '', title: '', link: '', ancho_completo: false }
  ],
  carrito_banner_imagen: '',
  carrito_banner_link: '',
  confirmacion_imagen: '',
  color_categorias: '#2A2D3A',
  logo_size: 36,
  header_copyright: '',
  color_primary_gradient: { activo: false, color2: '#2A2D3A', angulo: 135 },
  color_accent_gradient: { activo: false, color2: '#E8AE12', angulo: 135 },
  campos_obligatorios: { nombre_cliente: true, telefono: true, direccion: true, ciudad: true, departamento: false, notas_cliente: false },
  social: { facebook: '', instagram: '', whatsapp: '', tiktok: '' },
  footer_text: 'Envíos a toda Colombia y Ecuador · Pago contraentrega · Tus datos están protegidos',
  envio_dias_habiles: 5,
  countdown: { activo: false, texto: 'Oferta válida hoy', fecha_fin: '', animacion: 'none' },
  textos: {
    anuncio_barra: 'Envíos a toda Colombia y Ecuador · Pago 100% contraentrega · Sin registro',
    busqueda_placeholder: 'Buscar productos...',
    btn_agregar_carrito: 'Agregar al carrito',
    btn_comprar_ahora: 'Comprar ahora',
    badge_pagas_recibir: 'Pagas al recibir',
    texto_disponible: 'Disponible para envío inmediato',
    texto_pocas_unidades: '¡Solo quedan {n} unidades!',
    texto_agotado: 'Sin unidades disponibles por ahora',
    mensaje_confirmacion: 'Tu pedido #{id} por {total} fue registrado. Te contactaremos para confirmar la entrega.',
    titulo_relacionados: 'También te puede interesar',
    titulo_resenas: 'Calificaciones y comentarios',
    placeholder_codigo_descuento: '¿Tienes un código de descuento?',
    texto_envio_estimado: 'Recíbelo entre el {inicio} y el {fin}'
  }
};

const existingSettings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
if (!existingSettings) {
  db.prepare('INSERT INTO site_settings (id, data) VALUES (1, ?)').run(JSON.stringify(DEFAULT_SETTINGS));
}

module.exports = db;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
