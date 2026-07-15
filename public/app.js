let PRODUCTOS = [];
let CATEGORIA_ACTIVA = 'Todas';
let TEXTO_BUSQUEDA = '';
let CARRITO = []; // {product_id, nombre, precio, imagen, cantidad, variante}
let SETTINGS = null;
let DESCUENTO_ACTIVO = null; // { codigo, porcentaje }

const fmt = (n) => '$' + Math.round(Number(n)).toLocaleString('es-CO');
const precioMostrar = (p) => (p.precio_oferta && p.precio_oferta > 0 && p.precio_oferta < p.precio_venta) ? p.precio_oferta : p.precio_venta;
const T = (key) => (SETTINGS && SETTINGS.textos && SETTINGS.textos[key]) || '';

const ICON_SOCIAL = {
  facebook: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M14 9h1.5V6.2H14c-1.7 0-3 1.2-3 3v1.8H9v3h2V19h3v-6h2.1l.5-3H14V9.4c0-.2.1-.4.3-.4Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-3.8-.9L3 21l2-5.7a8.3 8.3 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.5 3h.1a8.4 8.4 0 0 1 8.4 8.4Z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18a3 3 0 1 0 3-3V4h3.2a4.3 4.3 0 0 0 4 4.2"/></svg>'
};

const ICON_POPUP = {
  cart: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  box: '<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  check: '<circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
  star: '<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/>',
  truck: '<rect x="1" y="7" width="14" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="6" cy="19" r="1.5"/><circle cx="17.5" cy="19" r="1.5"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5Z"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'
};
function svgIcon(key, size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_POPUP[key] || ICON_POPUP.check}</svg>`;
}
function svgIcon2(name) {
  const paths = {
    chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>'
  };
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

// ================= CONFIGURACIÓN DE LA TIENDA =================
function aplicarConfiguracion(s) {
  SETTINGS = s;
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

  const favicon = document.getElementById('faviconLink');
  if (s.favicon_url) favicon.href = s.favicon_url;

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

  const wa = document.getElementById('whatsappFloat');
  if (soc.whatsapp) { wa.href = soc.whatsapp; wa.style.display = 'flex'; }
  else wa.style.display = 'none';

  if (s.textos) {
    document.getElementById('announceBar').textContent = s.textos.anuncio_barra || '';
    document.getElementById('searchInput').placeholder = s.textos.busqueda_placeholder || '';
    document.getElementById('discountInput').placeholder = s.textos.placeholder_codigo_descuento || '';
  }

  const cd = s.countdown || {};
  clearInterval(window._countdownInterval);
  const bar = document.getElementById('countdownBar');
  if (cd.activo && cd.fecha_fin && new Date(cd.fecha_fin) > new Date()) {
    bar.style.display = 'flex';
    document.getElementById('countdownTexto').textContent = cd.texto || '';
    const actualizarReloj = () => {
      const restante = new Date(cd.fecha_fin) - new Date();
      if (restante <= 0) { bar.style.display = 'none'; clearInterval(window._countdownInterval); return; }
      const h = Math.floor(restante / 3600000);
      const m = Math.floor((restante % 3600000) / 60000);
      const sec = Math.floor((restante % 60000) / 1000);
      document.getElementById('countdownReloj').textContent =
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    };
    actualizarReloj();
    window._countdownInterval = setInterval(actualizarReloj, 1000);
  } else {
    bar.style.display = 'none';
  }

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

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'PREVIEW_SETTINGS') aplicarConfiguracion(e.data.settings);
});

// ================= MENÚS EMERGENTES (footer) =================
async function cargarPopups() {
  try {
    const res = await fetch('/api/popups');
    const popups = await res.json();
    const cont = document.getElementById('footerLinks');
    cont.innerHTML = '<button id="trackLinkBtn">Rastrea tu pedido</button>' +
      popups.map(p => `<button data-popup-id="${p.id}">${p.titulo_menu}</button>`).join('');

    document.getElementById('trackLinkBtn').onclick = () => abrir('trackOverlay');
    cont.querySelectorAll('[data-popup-id]').forEach(btn => {
      btn.onclick = () => abrirPopup(popups.find(p => p.id === parseInt(btn.dataset.popupId)));
    });
  } catch (e) { /* si falla, simplemente no se muestran menús emergentes */ }
}

function abrirPopup(popup) {
  if (!popup) return;
  let html = `<h2>${popup.titulo_menu}</h2>`;
  if (popup.tipo === 'steps') {
    html += popup.items.map(item => `
      <div class="popup-step">
        <div class="step-icon">${item.imagen ? `<img src="${item.imagen}">` : `<span class="anim-${item.animacion}">${svgIcon(item.icono || 'check', 22)}</span>`}</div>
        <div>
          <p class="step-title">${item.titulo}</p>
          <p class="step-text">${item.texto}</p>
        </div>
      </div>
    `).join('');
  } else if (popup.tipo === 'testimonials') {
    html += popup.items.map(item => `
      <div class="popup-testimonial">
        <div class="t-avatar">${item.imagen ? `<img src="${item.imagen}">` : `<span class="anim-${item.animacion}">${svgIcon(item.icono || 'smile', 20)}</span>`}</div>
        <div>
          <p class="t-name">${item.titulo}</p>
          <p class="t-text">${item.texto}</p>
        </div>
      </div>
    `).join('');
  } else {
    html += `<div class="popup-text-content">${popup.contenido_texto || ''}</div>`;
  }
  document.getElementById('infoPopupContent').innerHTML = html;
  abrir('infoPopupOverlay');
}

// ================= RASTREO DE PEDIDO =================
document.getElementById('trackForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const resultDiv = document.getElementById('trackResult');
  resultDiv.innerHTML = '<p class="loading" style="padding:16px 0;">Consultando...</p>';
  try {
    const res = await fetch(`/api/track?id=${encodeURIComponent(fd.get('id'))}&telefono=${encodeURIComponent(fd.get('telefono'))}`);
    const data = await res.json();
    if (!res.ok) {
      resultDiv.innerHTML = `<p class="track-error">${data.error}</p>`;
      return;
    }
    resultDiv.innerHTML = `
      <div class="track-result-box">
        <div class="track-status-line"><span class="dot"></span><strong>${data.estado}</strong></div>
        ${data.transportadora ? `<div class="track-status-line"><span class="dot"></span>Transportadora: ${data.transportadora}</div>` : ''}
        ${data.numero_guia ? `<div class="track-status-line"><span class="dot"></span>N° de guía: ${data.numero_guia}</div>` : ''}
        <div class="track-status-line"><span class="dot"></span>Ciudad: ${data.ciudad}</div>
        <div class="track-status-line"><span class="dot"></span>Total: ${fmt(data.precio_total)}</div>
        <div class="track-status-line"><span class="dot"></span>${data.items.map(i => `${i.nombre_producto}${i.variante ? ' ('+i.variante+')' : ''} x${i.cantidad}`).join(', ')}</div>
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = '<p class="track-error">Ocurrió un error al consultar. Intenta de nuevo.</p>';
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
      <span class="badge-cod">${svgIcon('truck', 12)} ${T('badge_pagas_recibir') || 'Pagas al recibir'}</span>
      ${enOferta ? `<span class="badge-off">-${pct}%</span>` : ''}
      ${p.etiqueta ? `<span class="badge-etiqueta">${p.etiqueta}</span>` : ''}
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

// ================= FECHA ESTIMADA DE ENTREGA =================
function calcularFechaEntrega() {
  const diasHabiles = (SETTINGS && SETTINGS.envio_dias_habiles) || 5;
  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  function sumarDiasHabiles(fecha, dias) {
    const f = new Date(fecha);
    let contador = 0;
    while (contador < dias) {
      f.setDate(f.getDate() + 1);
      if (f.getDay() !== 0 && f.getDay() !== 6) contador++;
    }
    return f;
  }
  const inicio = sumarDiasHabiles(new Date(), Math.max(1, diasHabiles - 1));
  const fin = sumarDiasHabiles(new Date(), diasHabiles);
  const fmtFecha = (d) => `${d.getDate()} de ${MESES[d.getMonth()]}`;
  const plantilla = T('texto_envio_estimado') || 'Recíbelo entre el {inicio} y el {fin}';
  return plantilla.replace('{inicio}', fmtFecha(inicio)).replace('{fin}', fmtFecha(fin));
}

// ================= MODAL DE PRODUCTO + CARRUSEL =================
let cantidadModal = 1;
let carruselIdx = 0;
let carruselImgs = [];
let variantesSeleccionadas = {};
let productoActualModal = null;

function abrirProducto(id) {
  const p = PRODUCTOS.find(x => x.id === id);
  if (!p) return;
  cantidadModal = 1;
  carruselIdx = 0;
  carruselImgs = p.imagenes.length ? p.imagenes : [''];
  variantesSeleccionadas = {};
  productoActualModal = p;

  const enOferta = p.precio_oferta && p.precio_oferta > 0 && p.precio_oferta < p.precio_venta;
  const agotado = p.unidades_disponibles !== undefined && p.unidades_disponibles !== null && Number(p.unidades_disponibles) <= 0;
  const pocasUnidades = !agotado && p.unidades_disponibles > 0 && p.unidades_disponibles <= 5;

  const html = `
    <div class="carousel">
      <div class="carousel-viewport"><div class="carousel-track" id="carouselTrack">
        ${carruselImgs.map(src => `<img src="${src}">`).join('')}
      </div></div>
      ${carruselImgs.length > 1 ? `
        <button class="carousel-nav prev" id="carPrev"></button>
        <button class="carousel-nav next" id="carNext"></button>
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
    ${agotado ? `<p class="stock-note low">${T('texto_agotado') || 'Sin unidades disponibles por ahora'}</p>` :
      pocasUnidades ? `<p class="stock-note low">${(T('texto_pocas_unidades') || '¡Solo quedan {n} unidades!').replace('{n}', p.unidades_disponibles)}</p>` :
      `<p class="stock-note">${T('texto_disponible') || 'Disponible para envío inmediato'}</p>`}
    <p class="desc">${p.descripcion || ''}</p>

    ${p.beneficios && p.beneficios.length ? `
      <ul class="beneficios-list">
        ${p.beneficios.map(b => `<li>${svgIcon('check', 15)} ${b}</li>`).join('')}
      </ul>
    ` : ''}

    <div class="envio-estimado">${svgIcon('truck', 16)} ${calcularFechaEntrega()}</div>

    ${p.variantes && p.variantes.length ? p.variantes.map(g => `
      <div class="variant-group" data-grupo="${g.grupo}">
        <p class="variant-label">${g.grupo}</p>
        <div class="variant-options">
          ${g.opciones.map(op => `<button type="button" class="variant-chip" data-grupo="${g.grupo}" data-valor="${op}">${op}</button>`).join('')}
        </div>
      </div>
    `).join('') : ''}

    ${!agotado ? `
      <div class="qty-selector">
        <button id="qMinus"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <span id="qVal">1</span>
        <button id="qPlus"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
      </div>
      <div class="buy-buttons">
        <button class="btn-outline-dark" id="addToCartBtn">${T('btn_agregar_carrito') || 'Agregar al carrito'}</button>
        <button class="btn-primary" id="buyNowBtn" style="margin:0;">${T('btn_comprar_ahora') || 'Comprar ahora'}</button>
      </div>
    ` : ''}

    <div id="relatedSection"></div>
    <div class="reviews-section" id="reviewsSection">
      <h3>${T('titulo_resenas') || 'Calificaciones y comentarios'}</h3>
      <div id="reviewsList"><p class="loading" style="padding:10px 0;">Cargando...</p></div>
      <form class="review-form" id="reviewForm">
        <div class="star-picker" id="starPicker">
          ${[1,2,3,4,5].map(n => `<button type="button" data-star="${n}">★</button>`).join('')}
        </div>
        <input type="hidden" name="calificacion" id="calificacionInput" value="0">
        <input type="text" name="nombre" placeholder="Tu nombre" required>
        <textarea name="comentario" placeholder="Cuéntanos tu experiencia (opcional)" rows="2"></textarea>
        <button type="submit" class="btn-secondary-sm" style="align-self:flex-start;">Enviar comentario</button>
        <p id="reviewMsg" class="discount-msg"></p>
      </form>
    </div>
  `;
  document.getElementById('productModalContent').innerHTML = html;
  const btnPrev = document.getElementById('carPrev');
  const btnNext = document.getElementById('carNext');
  if (btnPrev) btnPrev.innerHTML = svgIcon2('chevronLeft');
  if (btnNext) btnNext.innerHTML = svgIcon2('chevronRight');

  if (carruselImgs.length > 1) {
    btnPrev.onclick = () => moverCarrusel(-1);
    btnNext.onclick = () => moverCarrusel(1);
    document.querySelectorAll('#carDots span').forEach(dot => {
      dot.onclick = () => { carruselIdx = parseInt(dot.dataset.i); actualizarCarrusel(); };
    });
  }

  document.querySelectorAll('.variant-chip').forEach(chip => {
    chip.onclick = () => {
      const grupo = chip.dataset.grupo;
      document.querySelectorAll(`.variant-chip[data-grupo="${CSS.escape(grupo)}"]`).forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      variantesSeleccionadas[grupo] = chip.dataset.valor;
    };
  });

  if (!agotado) {
    document.getElementById('qMinus').onclick = () => { if (cantidadModal > 1) cantidadModal--; document.getElementById('qVal').textContent = cantidadModal; };
    document.getElementById('qPlus').onclick = () => { cantidadModal++; document.getElementById('qVal').textContent = cantidadModal; };
    document.getElementById('addToCartBtn').onclick = () => {
      if (!validarVariantes(p)) return;
      agregarAlCarrito(p, cantidadModal);
      cerrarModales();
    };
    document.getElementById('buyNowBtn').onclick = () => {
      if (!validarVariantes(p)) return;
      agregarAlCarrito(p, cantidadModal);
      cerrarModales();
      abrir('checkoutOverlay');
      renderResumenCheckout();
    };
  }

  cargarResenas(p.id);
  renderRelacionados(p);
  configurarStarPicker();
}

function validarVariantes(p) {
  if (!p.variantes || !p.variantes.length) return true;
  for (const g of p.variantes) {
    if (!variantesSeleccionadas[g.grupo]) {
      alert(`Por favor elige una opción de "${g.grupo}" antes de continuar.`);
      return false;
    }
  }
  return true;
}

function moverCarrusel(dir) {
  carruselIdx = (carruselIdx + dir + carruselImgs.length) % carruselImgs.length;
  actualizarCarrusel();
}
function actualizarCarrusel() {
  document.getElementById('carouselTrack').style.transform = `translateX(-${carruselIdx * 100}%)`;
  document.querySelectorAll('#carDots span').forEach((d, i) => d.classList.toggle('active', i === carruselIdx));
}

// ================= PRODUCTOS RELACIONADOS =================
function renderRelacionados(p) {
  const relacionados = PRODUCTOS.filter(x => x.id !== p.id && x.categoria === p.categoria).slice(0, 4);
  const cont = document.getElementById('relatedSection');
  if (!relacionados.length) { cont.innerHTML = ''; return; }
  cont.innerHTML = `
    <div class="related-section">
      <h3>${T('titulo_relacionados') || 'También te puede interesar'}</h3>
      <div class="related-grid">
        ${relacionados.map(r => `
          <div class="related-card" data-id="${r.id}">
            <img src="${r.imagenes[0] || ''}" alt="${r.nombre}">
            <div class="rc-body">
              <p class="rc-name">${r.nombre}</p>
              <p class="rc-price">${fmt(precioMostrar(r))}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  cont.querySelectorAll('.related-card').forEach(el => {
    el.onclick = () => abrirProducto(parseInt(el.dataset.id));
  });
}

// ================= RESEÑAS =================
async function cargarResenas(productId) {
  const cont = document.getElementById('reviewsList');
  try {
    const res = await fetch(`/api/products/${productId}/reviews`);
    const reviews = await res.json();
    if (!reviews.length) {
      cont.innerHTML = '<p style="font-size:13px;color:#888;">Aún no hay comentarios. ¡Sé el primero!</p>';
      return;
    }
    const promedio = reviews.reduce((s, r) => s + r.calificacion, 0) / reviews.length;
    cont.innerHTML = `
      <div class="reviews-summary">
        <span class="stars">${'★'.repeat(Math.round(promedio))}${'☆'.repeat(5 - Math.round(promedio))}</span>
        <span>${promedio.toFixed(1)} · ${reviews.length} reseña${reviews.length !== 1 ? 's' : ''}</span>
      </div>
      ${reviews.map(r => `
        <div class="review-item">
          <div class="review-head"><span>${r.nombre}</span><span class="stars">${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}</span></div>
          ${r.comentario ? `<p class="review-text">${r.comentario}</p>` : ''}
        </div>
      `).join('')}
    `;
  } catch (e) {
    cont.innerHTML = '';
  }
}

function configurarStarPicker() {
  let seleccion = 0;
  document.querySelectorAll('#starPicker button').forEach(btn => {
    btn.onclick = () => {
      seleccion = parseInt(btn.dataset.star);
      document.getElementById('calificacionInput').value = seleccion;
      document.querySelectorAll('#starPicker button').forEach(b => b.classList.toggle('active', parseInt(b.dataset.star) <= seleccion));
    };
  });

  document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    const msg = document.getElementById('reviewMsg');
    if (!payload.calificacion || payload.calificacion === '0') {
      msg.textContent = 'Selecciona una calificación de estrellas.';
      msg.className = 'discount-msg error';
      return;
    }
    try {
      const res = await fetch(`/api/products/${productoActualModal.id}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      msg.textContent = data.mensaje;
      msg.className = 'discount-msg ok';
      e.target.reset();
      document.getElementById('calificacionInput').value = 0;
      document.querySelectorAll('#starPicker button').forEach(b => b.classList.remove('active'));
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'discount-msg error';
    }
  });
}

// ================= CARRITO =================
function agregarAlCarrito(p, cantidad) {
  const varianteTexto = Object.entries(variantesSeleccionadas).map(([g, v]) => `${g}: ${v}`).join(', ');
  const existente = CARRITO.find(i => i.product_id === p.id && i.variante === varianteTexto);
  if (existente) existente.cantidad += cantidad;
  else CARRITO.push({ product_id: p.id, nombre: p.nombre, precio: precioMostrar(p), imagen: p.imagenes[0] || '', cantidad, variante: varianteTexto });
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
          <p class="name">${i.nombre}${i.variante ? ` <span style="color:#999;font-weight:400;">(${i.variante})</span>` : ''}</p>
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

document.getElementById('goCheckout').onclick = () => { cerrarModales(); abrir('checkoutOverlay'); renderResumenCheckout(); };

// ================= CÓDIGO DE DESCUENTO =================
function renderResumenCheckout() {
  const subtotal = CARRITO.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const descuento = DESCUENTO_ACTIVO ? Math.round(subtotal * (DESCUENTO_ACTIVO.porcentaje / 100)) : 0;
  const total = subtotal - descuento;
  document.getElementById('checkoutTotalSummary').innerHTML = `
    <div class="line"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    ${descuento > 0 ? `<div class="line"><span>Descuento (${DESCUENTO_ACTIVO.codigo})</span><span>-${fmt(descuento)}</span></div>` : ''}
    <div class="line total"><span>Total</span><span>${fmt(total)}</span></div>
  `;
}

document.getElementById('applyDiscountBtn').onclick = async () => {
  const codigo = document.getElementById('discountInput').value.trim();
  const msg = document.getElementById('discountMsg');
  if (!codigo) return;
  try {
    const res = await fetch('/api/apply-discount', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ codigo })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    DESCUENTO_ACTIVO = { codigo: data.codigo, porcentaje: data.porcentaje };
    msg.textContent = `Código aplicado: ${data.porcentaje}% de descuento`;
    msg.className = 'discount-msg ok';
    renderResumenCheckout();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'discount-msg error';
  }
};

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.items = CARRITO.map(i => ({ product_id: i.product_id, cantidad: i.cantidad, variante: i.variante }));
  if (DESCUENTO_ACTIVO) payload.codigo_descuento = DESCUENTO_ACTIVO.codigo;

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

    const plantilla = T('mensaje_confirmacion') || 'Tu pedido #{id} por {total} fue registrado. Te contactaremos para confirmar la entrega.';
    document.getElementById('confirmText').textContent = plantilla.replace('{id}', data.id_pedido).replace('{total}', fmt(data.total));
    CARRITO = [];
    DESCUENTO_ACTIVO = null;
    document.getElementById('discountInput').value = '';
    document.getElementById('discountMsg').textContent = '';
    actualizarCarritoUI();
    e.target.reset();
    cerrarModales();
    abrir('confirmOverlay');
    cargarProductos();
  } catch (err) {
    alert(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar pedido';
  }
});

// ================= ARRANQUE =================
const ES_VISTA_PREVIA = new URLSearchParams(window.location.search).get('preview') === '1';

async function iniciarTienda() {
  const inicio = Date.now();
  await Promise.all([cargarConfiguracion(), cargarProductos(), cargarPopups()]);

  const loadingScreen = document.getElementById('loadingScreen');
  if (ES_VISTA_PREVIA) {
    loadingScreen.classList.add('hide');
    return;
  }
  const transcurrido = Date.now() - inicio;
  const espera = Math.max(0, 700 - transcurrido);
  setTimeout(() => loadingScreen.classList.add('hide'), espera);
}

iniciarTienda();
