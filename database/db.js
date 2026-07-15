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

// Configuración por defecto de la tienda (identidad, colores, banners, redes)
const DEFAULT_SETTINGS = {
  brand_name: 'TuTienda',
  logo_url: '',
  color_primary: '#14161F',
  color_accent: '#FFC93C',
  color_teal: '#0E7C7B',
  hero_title: 'Compra sin miedo.\nPaga cuando lo tengas en tus manos.',
  hero_subtitle: 'Escoge tus productos, llena tus datos de envío y listo — nosotros llegamos hasta tu puerta.',
  hero_image: '',
  layout: ['hero', 'banners', 'productos'],
  banners: [
    { image: '', title: '', link: '' },
    { image: '', title: '', link: '' }
  ],
  social: { facebook: '', instagram: '', whatsapp: '', tiktok: '' },
  footer_text: 'Envíos a toda Colombia y Ecuador · Pago contraentrega · Tus datos están protegidos'
};

const existingSettings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
if (!existingSettings) {
  db.prepare('INSERT INTO site_settings (id, data) VALUES (1, ?)').run(JSON.stringify(DEFAULT_SETTINGS));
}

module.exports = db;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
