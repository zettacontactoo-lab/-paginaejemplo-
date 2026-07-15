let PRODUCTOS = [];
let CATEGORIA_ACTIVA = 'Todas';
let TEXTO_BUSQUEDA = '';
let CARRITO = []; // {product_id, nombre, precio, imagen, cantidad}

const fmt = (n) => '$' + Number(n).toLocaleString('es-CO');
const precioMostrar = (p) => (p.precio_oferta && p.precio_oferta > 0 && p.precio_oferta < p.precio_venta) ? p.precio_oferta : p.precio_venta;

const ICON_SOCIAL = {
  facebook: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M14 9h1.5V6.2H14c-1.7 0-3 1.2-3 3v1.8H9v3h2V19h3v-6h2.1l.5-3H14V9.4c0-.2.1-.4.3-.4Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-3.8-.9L3 21l2-5.7a8.3 8.3 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.5 3h.1a8.4 8.4 0 0 1 8.4 8.4Z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18a3 3 0 1 0 3-3V4h3.2a4.3 4.3 0 0 0 4 4.2"/></svg>'
};

// ================= CONFIGURACIÓN DE LA TIENDA (identidad, colores, banners, orden) =================
function aplicarConfiguracion(s) {
  document.documentElement.style.setProperty('--ink', s.color_primary);
  document.documentElement.style.setProperty('--accent', s.color_accent);
  document.documentElement.style.setProperty('--teal', s.color_teal);

  document.title = s.brand_name + ' — Paga cuando lo recibas';
  document.querySelectorAll('#logoText, #footerLogoText').forEach(el => {
    el.innerHTML = s.brand_name.length > 2
      ? s.brand_name.slice(0, Math.ceil(s.brand_name.length/2)) + '<span>' + s.brand_name.slice(Math.ceil(s.brand_name.length/2)) + '</span>'
      : s.brand_name;
  });

  if (s.logo_url) {
    document.getElementById('logoImg').src = s.logo_url;
    document.getElementById('logoImg').style.display = 'block';
    document.getElementById('logoText').style.display = 'none';
    document.getElementById('footerLogoText').style.display = 'none';
  } else {
    document.getElementById('logoImg').style.display = 'none';
    document.getElementById('logoText').style.display = 'block';
    document.getElementById('footerLogoText').style.display = 'block';
  }

  if (s.hero_title) document.getElementById('heroTitle').innerHTML = s.hero_title.replace(/\n/g, '<br>');
  if (s.hero_subtitle) document.getElementById('heroSubtitle').textContent = s.hero_subtitle;
  document.getElementById('hero').style.backgroundImage = s.hero_image
    ? `linear-gradient(135deg, rgba(20,22,31,0.75), rgba(20,22,31,0.55)), url('${s.hero_image}')`
    : '';

  document.getElementById('footerText').textContent = s.footer_text || '';

  const banners = (s.banners || []).filter(b => b.image);
  document.getElementById('bannersRow').innerHTML = banners.map(b => `
    <a class="banner-block" href="${b.link || '#'}" target="${b.link ? '_blank' : '_self'}">
      <img src="${b.image}" alt="${b.title || ''}">
      ${b.title ? `<span class="label">${b.title}</span>` : ''}
    </a>
  `).join('');

  const soc = s.social || {};
  document.getElementById('footerSocial').innerHTML = Object.keys(ICON_SOCIAL)
    .filter(k => soc[k])
    .map(k => `<a href="${soc[k]}" target="_blank" title="${k}">${ICON_SOCIAL[k]}</a>`)
    .join('');

  // Orden de las secciones (arrastrado en el panel de admin)
  const layout = s.layout && s.layout.length ? s.layout : ['hero', 'banners', 'productos'];
  const map = { hero: 'hero', banners: 'bannersRow', productos: 'catalogWrap' };
  layout.forEach((key, i) => {
    const el = document.getElementById(map[key]);
    if (el) el.style.order = i;
  });
}

async function cargarConfiguracion() {
  try {
    const res = await fetch('/api/settings');
    aplicarConfiguracion(await res.json());
  } catch (e) { /* usa los valores por defecto del HTML si falla */ }
}

// Modo vista previa en vivo: si el panel de admin nos manda cambios sin guardar, los aplicamos al instante
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'PREVIEW_SETTINGS') {
    aplicarConfiguracion(e.data.settings);
  }
});

// ================= PRODUCTOS =================
async function cargarProductos() {
  const res = await fetch('/api/products');
  PRODUCTOS = await res.json();
  renderCategorias();
  renderCatalogo();
}

function renderCategorias() {
  const cats = ['Todas', ...new Set(PRODUCTOS.map(p => p.categoria).filter(Boolean))];
  const cont = document.getElementById('catnav');
  cont.innerHTML = cats.map(c =>
    `<button class="chip ${c === CATEGORIA_ACTIVA ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');
  cont.querySelectorAll('.chip').forEach(el => {
    el.onclick = () => { CATEGORIA_ACTIVA = el.dataset.cat; renderCategorias(); renderCatalogo(); };
  });
}

function productosFiltrados() {
  let lista = CATEGORIA_ACTIVA === 'Todas' ? PRODUCTOS : PRODUCTOS.filter(p => p.categoria === CATEGORIA_ACTIVA);
  if (TEXTO_BUSQUEDA.trim()) {
    const q = TEXTO_BUSQUEDA.trim().toLowerCase();
    lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q));
  }
  return lista;
}

function renderCatalogo() {
  const cont = document.getElementById('catalogo');
  const lista = productosFiltrados();

  document.getElementById('catalogTitle').textContent = TEXTO_BUSQUEDA.trim()
    ? `Resultados para "${TEXTO_BUSQUEDA.trim()}"`
    : (CATEGORIA_ACTIVA === 'Todas' ? 'Todos los productos' : CATEGORIA_ACTIVA);
  document.getElementById('resultCount').textContent = `${lista.length} producto${lista.length !== 1 ? 's' : ''}`;

  if (!lista.length) {
    cont.innerHTML = '<p class="loading">No encontramos productos con ese criterio.</p>';
    return;
  }
  cont.innerHTML = lista.map(p => {
    const agotado = p.unidades_disponibles !== undefined && p.unidades_disponibles !== null && Number(p.unidades_disponibles) <= 0;
    const enOferta = p.precio_oferta && p.precio_oferta > 0 && p.precio_oferta < p.precio_venta;
    const pct = enOferta ? Math.round(100 - (p.precio_oferta / p.precio_venta) * 100) : 0;
    return `
    <div class="card" data-id="${p.id}">
      ${agotado ? '<div class="badge-agotado">Agotado</div>' : ''}
      <span class="badge-cod"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="14" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="6" cy="19" r="1.3"/><circle cx="17.5" cy="19" r="1.3"/></svg> Pagas al recibir</span>
      ${enOferta ? `<span class="badge-off">-${pct}%</span>` : ''}
      <img src="${p.imagenes[0] || ''}" alt="${p.nombre}">
      <div class="card-body">
        <p class="card-name">${p.nombre}</p>
        <div class="card-price-row">
          <span class="card-price">${fmt(precioMostrar(p))}</span>
          ${enOferta ? `<span class="card-price-old">${fmt(p.precio_venta)}</span>` : ''}
        </div>
      </div>
    </div>
  `; }).join('');
  cont.querySelectorAll('.card').forEach(el => {
    el.onclick = () => abrirProducto(parseInt(el.dataset.id));
  });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  TEXTO_BUSQUEDA = e.target.value;
  renderCatalogo();
});
document.getElementById('searchBtn').onclick = () => renderCatalogo();

// ================= MODAL DE PRODUCTO + CARRUSEL =================
let cantidadModal = 1;
let carruselIdx = 0;
let carruselImgs = [];

function abrirProducto(id) {
  const p = PRODUCTOS.find(x => x.id === id);
  if (!p) return;
  cantidadModal = 1;
  carruselIdx = 0;
  carruselImgs = p.imagenes.length ? p.imagenes : [''];

  const enOferta = p.precio_oferta && p.precio_oferta > 0 && p.precio_oferta < p.precio_venta;
  const agotado = p.unidades_disponibles !== undefined && p.unidades_disponibles !== null && Number(p.unidades_disponibles) <= 0;
  const pocasUnidades = !agotado && p.unidades_disponibles > 0 && p.unidades_disponibles <= 5;

  const html = `
    <div class="carousel">
      <div class="carousel-track" id="carouselTrack">
        ${carruselImgs.map(src => `<img src="${src}">`).join('')}
      </div>
      ${carruselImgs.length > 1 ? `
        <button class="carousel-nav prev" id="carPrev"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button class="carousel-nav next" id="carNext"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      ` : ''}
    </div>
    ${carruselImgs.length > 1 ? `<div class="carousel-dots" id="carDots">
      ${carruselImgs.map((_, i) => `<span class="${i === 0 ? 'active' : ''}" data-i="${i}"></span>`).join('')}
    </div>` : ''}
    <h2>${p.nombre}</h2>
    <div class="price-row">
      <span class="price">${fmt(precioMostrar(p))}</span>
      ${enOferta ? `<span class="price-old">${fmt(p.precio_venta)}</span>` : ''}
    </div>
    ${agotado ? '<p class="stock-note low">Sin unidades disponibles por ahora</p>' :
      pocasUnidades ? `<p class="stock-note low">¡Solo quedan ${p.unidades_disponibles} unidades!</p>` :
      '<p class="stock-note">Disponible para envío inmediato</p>'}
    <p class="desc">${p.descripcion || ''}</p>
    ${!agotado ? `
      <div class="qty-selector">
        <button id="qMinus"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <span id="qVal">1</span>
        <button id="qPlus"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
      </div>
      <button class="btn-primary" id="addToCartBtn">Agregar al carrito</button>
    ` : ''}
  `;
  document.getElementById('productModalContent').innerHTML = html;

  if (carruselImgs.length > 1) {
    document.getElementById('carPrev').onclick = () => moverCarrusel(-1);
    document.getElementById('carNext').onclick = () => moverCarrusel(1);
    document.querySelectorAll('#carDots span').forEach(dot => {
      dot.onclick = () => { carruselIdx = parseInt(dot.dataset.i); actualizarCarrusel(); };
    });
  }

  if (!agotado) {
    document.getElementById('qMinus').onclick = () => { if (cantidadModal > 1) cantidadModal--; document.getElementById('qVal').textContent = cantidadModal; };
    document.getElementById('qPlus').onclick = () => { cantidadModal++; document.getElementById('qVal').textContent = cantidadModal; };
    document.getElementById('addToCartBtn').onclick = () => { agregarAlCarrito(p, cantidadModal); cerrarModales(); };
  }

  abrir('productModal');
}

function moverCarrusel(dir) {
  carruselIdx = (carruselIdx + dir + carruselImgs.length) % carruselImgs.length;
  actualizarCarrusel();
}
function actualizarCarrusel() {
  document.getElementById('carouselTrack').style.transform = `translateX(-${carruselIdx * 100}%)`;
  document.querySelectorAll('#carDots span').forEach((d, i) => d.classList.toggle('active', i === carruselIdx));
}

// ================= CARRITO =================
function agregarAlCarrito(p, cantidad) {
  const existente = CARRITO.find(i => i.product_id === p.id);
  if (existente) existente.cantidad += cantidad;
  else CARRITO.push({ product_id: p.id, nombre: p.nombre, precio: precioMostrar(p), imagen: p.imagenes[0] || '', cantidad });
  actualizarCarritoUI();
}

function actualizarCarritoUI() {
  const totalItems = CARRITO.reduce((s, i) => s + i.cantidad, 0);
  document.getElementById('cartCount').textContent = totalItems;

  const cont = document.getElementById('cartItems');
  if (!CARRITO.length) {
    cont.innerHTML = '<p style="color:#888;font-size:14px;">Tu carrito está vacío.</p>';
  } else {
    cont.innerHTML = CARRITO.map((i, idx) => `
      <div class="cart-item">
        <img src="${i.imagen}" alt="${i.nombre}">
        <div class="cart-item-info">
          <p class="name">${i.nombre}</p>
          <div class="qty-controls">
            <button data-action="menos" data-idx="${idx}">−</button>
            <span>${i.cantidad}</span>
            <button data-action="mas" data-idx="${idx}">+</button>
          </div>
        </div>
        <strong>${fmt(i.precio * i.cantidad)}</strong>
      </div>
    `).join('');
    cont.querySelectorAll('button[data-action]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        if (btn.dataset.action === 'mas') CARRITO[idx].cantidad++;
        else {
          CARRITO[idx].cantidad--;
          if (CARRITO[idx].cantidad <= 0) CARRITO.splice(idx, 1);
        }
        actualizarCarritoUI();
      };
    });
  }

  const total = CARRITO.reduce((s, i) => s + i.precio * i.cantidad, 0);
  document.getElementById('cartTotal').textContent = fmt(total);
  document.getElementById('goCheckout').disabled = CARRITO.length === 0;
}

function abrir(id) { document.getElementById(id).classList.add('open'); }
function cerrarModales() { document.querySelectorAll('.overlay').forEach(o => o.classList.remove('open')); }

document.getElementById('cartBtn').onclick = () => abrir('cartOverlay');
document.querySelectorAll('[data-close]').forEach(b => b.onclick = cerrarModales);
document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', (e) => { if (e.target === o) cerrarModales(); });
});

document.getElementById('goCheckout').onclick = () => { cerrarModales(); abrir('checkoutOverlay'); };

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.items = CARRITO.map(i => ({ product_id: i.product_id, cantidad: i.cantidad }));

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear el pedido');

    document.getElementById('confirmText').textContent =
      `Tu pedido #${data.id_pedido} por ${fmt(data.total)} fue registrado. Te contactaremos para confirmar la entrega.`;
    CARRITO = [];
    actualizarCarritoUI();
    e.target.reset();
    cerrarModales();
    abrir('confirmOverlay');
    cargarProductos(); // refresca por si algún producto quedó agotado
  } catch (err) {
    alert(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar pedido';
  }
});

const ES_VISTA_PREVIA = new URLSearchParams(window.location.search).get('preview') === '1';

async function iniciarTienda() {
  const inicio = Date.now();
  await Promise.all([cargarConfiguracion(), cargarProductos()]);

  const loadingScreen = document.getElementById('loadingScreen');
  if (ES_VISTA_PREVIA) {
    // En la vista previa del admin no mostramos la animación: debe sentirse instantánea
    loadingScreen.classList.add('hide');
    return;
  }
  // Aseguramos que la animación se vea un mínimo de tiempo aunque todo cargue muy rápido
  const transcurrido = Date.now() - inicio;
  const espera = Math.max(0, 700 - transcurrido);
  setTimeout(() => loadingScreen.classList.add('hide'), espera);
}

iniciarTienda();
