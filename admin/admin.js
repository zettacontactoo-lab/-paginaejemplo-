const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-CO');

// ---- Verificar sesión ----
(async function checkAuth() {
  const res = await fetch('/api/admin/check');
  const data = await res.json();
  if (!data.isAdmin) window.location.href = '/admin';
})();

document.getElementById('logoutBtn').onclick = async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin';
};

// ---- Navegación de tabs ----
document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
  item.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('tab-' + item.dataset.tab).classList.add('active');
    if (item.dataset.tab === 'dashboard') cargarMetricas();
    if (item.dataset.tab === 'productos') cargarProductos();
    if (item.dataset.tab === 'pedidos') cargarPedidos();
    if (item.dataset.tab === 'diseno') cargarConfiguracion();
    if (item.dataset.tab === 'resenas') cargarResenasAdmin();
    if (item.dataset.tab === 'descuentos') cargarDescuentos();
    if (item.dataset.tab === 'popups') cargarPopupsAdmin();
  };
});

// ================= DASHBOARD =================
async function cargarMetricas() {
  const res = await fetch('/api/admin/metrics');
  const m = await res.json();

  document.getElementById('metricsGrid').innerHTML = `
    <div class="metric-card"><div class="label">Ventas totales</div><div class="value">${fmt(m.ventasTotales)}</div></div>
    <div class="metric-card"><div class="label">Ventas de hoy</div><div class="value">${fmt(m.ventasHoy)}</div></div>
    <div class="metric-card"><div class="label">Pedidos totales</div><div class="value">${m.totalPedidos}</div></div>
    <div class="metric-card"><div class="label">Pedidos de hoy</div><div class="value">${m.pedidosHoy}</div></div>
    <div class="metric-card"><div class="label">Necesitan contacto</div><div class="value">${m.pendientesContacto}</div></div>
  `;

  document.getElementById('estadoBreakdown').innerHTML = m.porEstado.length
    ? m.porEstado.map(e => `<span class="pill pill-on" style="margin-right:8px;">${e.estado}: ${e.c}</span>`).join('')
    : '<p style="color:#888;font-size:13.5px;">Aún no hay pedidos.</p>';

  document.getElementById('topProductos').innerHTML = m.masVendidos.length
    ? '<table><thead><tr><th>Producto</th><th>Unidades vendidas</th></tr></thead><tbody>' +
      m.masVendidos.map(p => `<tr><td>${p.nombre_producto}</td><td>${p.total_vendido}</td></tr>`).join('') +
      '</tbody></table>'
    : '<p style="color:#888;font-size:13.5px;">Aún no hay ventas registradas.</p>';
}

// ================= PRODUCTOS =================
let PRODUCTOS_CACHE = [];

async function cargarProductos() {
  const res = await fetch('/api/admin/products');
  PRODUCTOS_CACHE = await res.json();

  document.getElementById('catList').innerHTML =
    [...new Set(PRODUCTOS_CACHE.map(p => p.categoria).filter(Boolean))].map(c => `<option value="${c}">`).join('');

  document.getElementById('productsTableBody').innerHTML = PRODUCTOS_CACHE.map(p => `
    <tr>
      <td><img src="${p.imagenes[0] || ''}"></td>
      <td>${p.nombre}</td>
      <td>${p.categoria || '—'}</td>
      <td>${fmt(p.precio_venta)}</td>
      <td>${p.sku_droppi || '—'}</td>
      <td><span class="pill ${p.activo ? 'pill-on' : 'pill-off'}">${p.activo ? 'Publicado' : 'Oculto'}</span></td>
      <td>
        <button class="btn-secondary" data-edit="${p.id}">Editar</button>
        <button class="btn-danger" data-del="${p.id}">Eliminar</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="color:#888;">No hay productos aún. Crea el primero.</td></tr>';

  document.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => abrirEdicion(parseInt(btn.dataset.edit)));
  document.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => eliminarProducto(parseInt(btn.dataset.del)));
}

const productModal = document.getElementById('productModalOverlay');
document.getElementById('newProductBtn').onclick = () => abrirNuevo();
document.getElementById('closeProductModal').onclick = () => productModal.classList.remove('open');

let imagenesExistentes = [];

function abrirNuevo() {
  document.getElementById('productModalTitle').textContent = 'Nuevo producto';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  imagenesExistentes = [];
  BENEFICIOS_ACTUALES = [];
  VARIANTES_ACTUALES = [];
  document.getElementById('imgPreviewRow').innerHTML = '';
  document.getElementById('newImgPreviewRow').innerHTML = '';
  renderBeneficios();
  renderVariantes();
  productModal.classList.add('open');
}

function abrirEdicion(id) {
  const p = PRODUCTOS_CACHE.find(x => x.id === id);
  if (!p) return;
  document.getElementById('productModalTitle').textContent = 'Editar producto';
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('productId').value = p.id;
  form.nombre.value = p.nombre;
  form.descripcion.value = p.descripcion || '';
  form.categoria.value = p.categoria || '';
  form.sku_droppi.value = p.sku_droppi || '';
  form.precio_venta.value = p.precio_venta;
  form.precio_oferta.value = p.precio_oferta || '';
  form.precio_proveedor.value = p.precio_proveedor || '';
  form.unidades_disponibles.value = p.unidades_disponibles || 0;
  form.etiqueta.value = p.etiqueta || '';
  form.activo.checked = !!p.activo;
  form.destacado.checked = !!p.destacado;
  imagenesExistentes = [...p.imagenes];
  BENEFICIOS_ACTUALES = p.beneficios ? [...p.beneficios] : [];
  VARIANTES_ACTUALES = p.variantes ? JSON.parse(JSON.stringify(p.variantes)) : [];
  document.getElementById('newImgPreviewRow').innerHTML = '';
  renderImgPreview();
  renderBeneficios();
  renderVariantes();
  productModal.classList.add('open');
}

function renderImgPreview() {
  document.getElementById('imgPreviewRow').innerHTML = imagenesExistentes.map((src, i) =>
    `<div style="position:relative;"><img src="${src}"><button type="button" data-rm="${i}" class="img-remove-btn"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`
  ).join('');
  document.querySelectorAll('[data-rm]').forEach(btn => {
    btn.onclick = () => { imagenesExistentes.splice(parseInt(btn.dataset.rm), 1); renderImgPreview(); };
  });
}

// Previsualización de las imágenes NUEVAS seleccionadas (antes de subirlas)
document.getElementById('imagenesInput').addEventListener('change', (e) => {
  const cont = document.getElementById('newImgPreviewRow');
  cont.innerHTML = '';
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.createElement('img');
      img.src = ev.target.result;
      cont.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// ================= BENEFICIOS (viñetas) =================
let BENEFICIOS_ACTUALES = [];

function renderBeneficios() {
  document.getElementById('beneficiosEditor').innerHTML = BENEFICIOS_ACTUALES.map((b, i) => `
    <div class="beneficio-row">
      <input type="text" data-bi="${i}" value="${b.replace(/"/g, '&quot;')}" placeholder="Ej: Batería 20h">
      <button type="button" class="row-remove-btn" data-brm="${i}">✕</button>
    </div>
  `).join('');
  document.querySelectorAll('[data-bi]').forEach(inp => {
    inp.addEventListener('input', () => { BENEFICIOS_ACTUALES[inp.dataset.bi] = inp.value; });
  });
  document.querySelectorAll('[data-brm]').forEach(btn => {
    btn.onclick = () => { BENEFICIOS_ACTUALES.splice(parseInt(btn.dataset.brm), 1); renderBeneficios(); };
  });
}
document.getElementById('addBeneficioBtn').onclick = () => { BENEFICIOS_ACTUALES.push(''); renderBeneficios(); };

// ================= VARIANTES (color, talla, etc.) =================
let VARIANTES_ACTUALES = [];

function renderVariantes() {
  document.getElementById('variantesEditor').innerHTML = VARIANTES_ACTUALES.map((g, gi) => `
    <div class="variante-group-box">
      <input type="text" class="grupo-nombre" data-gi="${gi}" value="${(g.grupo || '').replace(/"/g, '&quot;')}" placeholder="Nombre del grupo (ej: Color)">
      <div class="variante-opciones-row">
        ${(g.opciones || []).map((op, oi) => `
          <span class="variante-opcion-chip">${op} <button type="button" data-gi="${gi}" data-oi="${oi}">✕</button></span>
        `).join('')}
      </div>
      <div style="display:flex;gap:6px;">
        <input type="text" class="nueva-opcion-input" data-gi="${gi}" placeholder="Ej: Rojo" style="flex:1;padding:7px 10px;border-radius:7px;border:1px solid var(--border);font-size:13px;">
        <button type="button" class="btn-secondary-sm" data-addop="${gi}">+ Opción</button>
      </div>
      <button type="button" class="row-remove-btn" data-grouprm="${gi}" style="margin-top:8px;">Eliminar grupo</button>
    </div>
  `).join('');

  document.querySelectorAll('.grupo-nombre').forEach(inp => {
    inp.addEventListener('input', () => { VARIANTES_ACTUALES[inp.dataset.gi].grupo = inp.value; });
  });
  document.querySelectorAll('.variante-opcion-chip button').forEach(btn => {
    btn.onclick = () => { VARIANTES_ACTUALES[btn.dataset.gi].opciones.splice(parseInt(btn.dataset.oi), 1); renderVariantes(); };
  });
  document.querySelectorAll('[data-addop]').forEach(btn => {
    btn.onclick = () => {
      const gi = btn.dataset.addop;
      const input = document.querySelector(`.nueva-opcion-input[data-gi="${gi}"]`);
      if (!input.value.trim()) return;
      VARIANTES_ACTUALES[gi].opciones.push(input.value.trim());
      renderVariantes();
    };
  });
  document.querySelectorAll('[data-grouprm]').forEach(btn => {
    btn.onclick = () => { VARIANTES_ACTUALES.splice(parseInt(btn.dataset.grouprm), 1); renderVariantes(); };
  });
}
document.getElementById('addVarianteBtn').onclick = () => { VARIANTES_ACTUALES.push({ grupo: '', opciones: [] }); renderVariantes(); };

// ================= IMPORTAR PRODUCTOS POR CSV =================
document.getElementById('importCsvBtn').onclick = () => document.getElementById('csvFileInput').click();
document.getElementById('csvFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const msg = document.getElementById('importResultMsg');
  msg.style.display = 'block';
  msg.textContent = 'Importando...';

  const fd = new FormData();
  fd.append('csv', file);
  try {
    const res = await fetch('/api/admin/products/import', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al importar');
    msg.textContent = `Listo: ${data.creados} producto(s) creado(s), ${data.actualizados} actualizado(s).` +
      (data.errores.length ? ` ${data.errores.length} fila(s) con problemas.` : '');
    cargarProductos();
  } catch (err) {
    msg.textContent = 'Error: ' + err.message;
  }
  e.target.value = '';
});

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const fd = new FormData(e.target);
  fd.set('activo', e.target.activo.checked ? 'true' : 'false');
  fd.set('destacado', e.target.destacado.checked ? 'true' : 'false');
  fd.set('beneficios', JSON.stringify(BENEFICIOS_ACTUALES.filter(b => b.trim())));
  fd.set('variantes', JSON.stringify(VARIANTES_ACTUALES.filter(g => g.grupo.trim() && g.opciones.length)));
  if (id) fd.set('imagenes_existentes', JSON.stringify(imagenesExistentes));

  const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, body: fd });
  if (res.ok) {
    productModal.classList.remove('open');
    cargarProductos();
  } else {
    alert('Ocurrió un error al guardar el producto.');
  }
});

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
  await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
  cargarProductos();
}

// ================= PEDIDOS =================
const ESTADOS = ['Pendiente', 'Confirmado', 'Despachado', 'En camino', 'Entregado', 'Devuelto', 'Cancelado'];

async function cargarPedidos() {
  const res = await fetch('/api/admin/orders');
  const pedidos = await res.json();

  document.getElementById('ordersList').innerHTML = pedidos.length ? pedidos.map(o => `
    <div class="order-card">
      <div class="order-head">
        <div>
          <span class="id">Pedido #${o.id}</span>
          ${o.necesita_contacto ? '<span class="contact-flag">Contactar cliente</span>' : ''}
        </div>
        <strong>${fmt(o.precio_total)}</strong>
      </div>
      <div class="order-client">${o.nombre_cliente} · ${o.telefono} · ${o.direccion}, ${o.ciudad} ${o.departamento || ''}</div>
      <div class="order-items">${o.items.map(i => `${i.nombre_producto} (x${i.cantidad})`).join(', ')}</div>
      <div class="order-controls">
        <select data-field="estado" data-id="${o.id}">
          ${ESTADOS.map(es => `<option value="${es}" ${o.estado === es ? 'selected' : ''}>${es}</option>`).join('')}
        </select>
        <input type="text" placeholder="Transportadora" value="${o.transportadora || ''}" data-field="transportadora" data-id="${o.id}">
        <input type="text" placeholder="N° de guía" value="${o.numero_guia || ''}" data-field="numero_guia" data-id="${o.id}">
        <input type="text" placeholder="Referencia Droppi (interno)" value="${o.referencia_droppi || ''}" data-field="referencia_droppi" data-id="${o.id}">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;">
          <input type="checkbox" data-field="necesita_contacto" data-id="${o.id}" ${o.necesita_contacto ? 'checked' : ''}> Contactar
        </label>
        <input type="text" placeholder="Notas internas" value="${o.notas_internas || ''}" data-field="notas_internas" data-id="${o.id}" style="flex:1;min-width:160px;">
      </div>
      ${o.descuento_codigo ? `<div style="font-size:12px;color:#1D8A44;margin-top:6px;">Descuento aplicado: ${o.descuento_codigo} (-${fmt(o.descuento_valor)})</div>` : ''}
    </div>
  `).join('') : '<p style="color:#888;">Aún no hay pedidos registrados.</p>';

  document.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('change', () => actualizarPedido(el));
  });
}

let debounceTimers = {};
async function actualizarPedido(el) {
  const id = el.dataset.id;
  const field = el.dataset.field;
  const value = el.type === 'checkbox' ? el.checked : el.value;

  clearTimeout(debounceTimers[id + field]);
  debounceTimers[id + field] = setTimeout(async () => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    });
  }, 400);
}

// Carga inicial
cargarMetricas();

// ================= DISEÑO DE LA TIENDA =================
let SETTINGS_CACHE = null;
let PREVIEW = null; // copia editable en memoria, usada solo para la vista previa en vivo (sin guardar aún)

const LAYOUT_LABELS = {
  hero: 'Banner principal (hero)',
  banners: 'Banners promocionales',
  productos: 'Sección de productos'
};

async function cargarConfiguracion() {
  const res = await fetch('/api/admin/settings');
  SETTINGS_CACHE = await res.json();
  PREVIEW = JSON.parse(JSON.stringify(SETTINGS_CACHE));
  const s = SETTINGS_CACHE;

  document.getElementById('s_brand_name').value = s.brand_name || '';
  document.getElementById('s_color_primary').value = s.color_primary || '#14161F';
  document.getElementById('s_color_accent').value = s.color_accent || '#FFC93C';
  document.getElementById('s_color_teal').value = s.color_teal || '#0E7C7B';
  document.getElementById('s_hero_title').value = s.hero_title || '';
  document.getElementById('s_hero_subtitle').value = s.hero_subtitle || '';
  document.getElementById('s_footer_text').value = s.footer_text || '';
  document.getElementById('s_facebook').value = s.social?.facebook || '';
  document.getElementById('s_instagram').value = s.social?.instagram || '';
  document.getElementById('s_whatsapp').value = s.social?.whatsapp || '';
  document.getElementById('s_tiktok').value = s.social?.tiktok || '';

  document.getElementById('s_logo_preview').innerHTML = s.logo_url ? `<img src="${s.logo_url}">` : '';
  document.getElementById('s_hero_preview').innerHTML = s.hero_image ? `<img src="${s.hero_image}">` : '';
  document.getElementById('s_favicon_preview').innerHTML = s.favicon_url ? `<img src="${s.favicon_url}">` : '';

  document.getElementById('s_countdown_activo').checked = !!(s.countdown && s.countdown.activo);
  document.getElementById('s_countdown_texto').value = (s.countdown && s.countdown.texto) || '';
  document.getElementById('s_countdown_fecha').value = (s.countdown && s.countdown.fecha_fin) ? s.countdown.fecha_fin.slice(0, 16) : '';
  document.getElementById('s_envio_dias').value = s.envio_dias_habiles || 5;

  const TEXTOS_LABELS = {
    anuncio_barra: 'Barra de anuncio (arriba de todo)',
    busqueda_placeholder: 'Texto del buscador',
    btn_agregar_carrito: 'Botón "Agregar al carrito"',
    btn_comprar_ahora: 'Botón "Comprar ahora"',
    badge_pagas_recibir: 'Insignia "Pagas al recibir"',
    texto_disponible: 'Texto cuando hay stock',
    texto_pocas_unidades: 'Texto pocas unidades (usa {n})',
    texto_agotado: 'Texto agotado',
    mensaje_confirmacion: 'Mensaje de confirmación (usa {id} y {total})',
    titulo_relacionados: 'Título "También te puede interesar"',
    titulo_resenas: 'Título de la sección de reseñas',
    placeholder_codigo_descuento: 'Placeholder del código de descuento',
    texto_envio_estimado: 'Texto de envío estimado (usa {inicio} y {fin})'
  };
  const textos = s.textos || {};
  document.getElementById('textosEditor').innerHTML = Object.keys(TEXTOS_LABELS).map(key => `
    <label>${TEXTOS_LABELS[key]}
      <input type="text" class="texto-editable-input" data-key="${key}" value="${(textos[key] || '').replace(/"/g, '&quot;')}">
    </label>
  `).join('');

  renderLayoutOrderList();
  renderBannerBlocks();
  enviarVistaPrevia();
}

function renderBannerBlocks() {
  const banners = PREVIEW.banners && PREVIEW.banners.length ? PREVIEW.banners : [{ image: '', title: '', link: '' }];
  document.getElementById('bannerBlocksEditor').innerHTML = banners.map((b, i) => `
    <div class="panel-box" style="background:#FAFAFB;margin-bottom:10px;position:relative;">
      <button type="button" class="banner-remove-btn" data-i="${i}" title="Quitar este banner">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
      <h3>Banner ${i + 1}</h3>
      <div class="form-grid">
        <label>Imagen
          <input type="file" accept="image/*" class="banner-img-input" data-i="${i}">
        </label>
        <div class="img-preview-row" id="bannerPreview_${i}">${b.image ? `<img src="${b.image}">` : ''}</div>
        <label>Texto sobre el banner (opcional)
          <input type="text" class="banner-title-input" data-i="${i}" value="${b.title || ''}">
        </label>
        <label>Link al hacer clic (opcional)
          <input type="text" class="banner-link-input" data-i="${i}" value="${b.link || ''}" placeholder="https://...">
        </label>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.banner-remove-btn').forEach(btn => {
    btn.onclick = () => {
      PREVIEW.banners.splice(parseInt(btn.dataset.i), 1);
      renderBannerBlocks();
      enviarVistaPrevia();
    };
  });
  document.querySelectorAll('.banner-img-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const i = input.dataset.i;
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById(`bannerPreview_${i}`).innerHTML = `<img src="${ev.target.result}">`;
        PREVIEW.banners[i].image = ev.target.result;
        PREVIEW.banners[i]._file = file; // se usa al guardar
        enviarVistaPrevia();
      };
      reader.readAsDataURL(file);
    });
  });
  document.querySelectorAll('.banner-title-input').forEach(input => {
    input.addEventListener('input', () => { PREVIEW.banners[input.dataset.i].title = input.value; enviarVistaPrevia(); });
  });
  document.querySelectorAll('.banner-link-input').forEach(input => {
    input.addEventListener('input', () => { PREVIEW.banners[input.dataset.i].link = input.value; });
  });
}

document.getElementById('addBannerBtn').onclick = () => {
  PREVIEW.banners.push({ image: '', title: '', link: '' });
  renderBannerBlocks();
};

function renderLayoutOrderList() {
  const layout = PREVIEW.layout && PREVIEW.layout.length ? PREVIEW.layout : ['hero', 'banners', 'productos'];
  const cont = document.getElementById('layoutOrderList');
  cont.innerHTML = layout.map(key => `
    <div class="layout-order-item" draggable="true" data-key="${key}">
      <svg class="grip" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      ${LAYOUT_LABELS[key] || key}
    </div>
  `).join('');
  activarDragAndDrop();
}

function activarDragAndDrop() {
  const cont = document.getElementById('layoutOrderList');
  let draggedEl = null;

  cont.querySelectorAll('.layout-order-item').forEach(item => {
    item.addEventListener('dragstart', () => {
      draggedEl = item;
      setTimeout(() => item.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedEl = null;
      guardarOrdenDesdeDOM();
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      const after = getDragAfterElement(cont, e.clientY);
      if (!draggedEl) return;
      if (after == null) cont.appendChild(draggedEl);
      else cont.insertBefore(draggedEl, after);
    });
  });
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.layout-order-item:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function guardarOrdenDesdeDOM() {
  const keys = [...document.querySelectorAll('#layoutOrderList .layout-order-item')].map(el => el.dataset.key);
  PREVIEW.layout = keys;
  enviarVistaPrevia();
}

function enviarVistaPrevia() {
  const iframe = document.getElementById('livePreview');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'PREVIEW_SETTINGS', settings: PREVIEW }, window.location.origin);
  }
}

document.getElementById('livePreview').addEventListener('load', () => {
  if (PREVIEW) enviarVistaPrevia();
});

// Cualquier cambio en los campos de texto/color actualiza la vista previa al instante
document.getElementById('settingsForm').addEventListener('input', (e) => {
  if (!PREVIEW) return;
  const el = e.target;
  const map = {
    brand_name: 'brand_name', color_primary: 'color_primary', color_accent: 'color_accent', color_teal: 'color_teal',
    hero_title: 'hero_title', hero_subtitle: 'hero_subtitle', footer_text: 'footer_text'
  };
  if (map[el.name]) { PREVIEW[map[el.name]] = el.value; enviarVistaPrevia(); }
  if (el.name === 'social_facebook') { PREVIEW.social.facebook = el.value; enviarVistaPrevia(); }
  if (el.name === 'social_instagram') { PREVIEW.social.instagram = el.value; enviarVistaPrevia(); }
  if (el.name === 'social_whatsapp') { PREVIEW.social.whatsapp = el.value; enviarVistaPrevia(); }
  if (el.name === 'social_tiktok') { PREVIEW.social.tiktok = el.value; enviarVistaPrevia(); }
});

document.getElementById('s_logo_input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('s_logo_preview').innerHTML = `<img src="${ev.target.result}">`;
    PREVIEW.logo_url = ev.target.result;
    enviarVistaPrevia();
  };
  reader.readAsDataURL(file);
});
document.getElementById('s_hero_image_input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('s_hero_preview').innerHTML = `<img src="${ev.target.result}">`;
    PREVIEW.hero_image = ev.target.result;
    enviarVistaPrevia();
  };
  reader.readAsDataURL(file);
});

document.getElementById('s_favicon_input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { document.getElementById('s_favicon_preview').innerHTML = `<img src="${ev.target.result}">`; };
  reader.readAsDataURL(file);
});

let REMOVE_LOGO = false, REMOVE_FAVICON = false;
document.getElementById('removeLogoBtn').onclick = () => {
  REMOVE_LOGO = true;
  document.getElementById('s_logo_preview').innerHTML = '';
  document.getElementById('s_logo_input').value = '';
  PREVIEW.logo_url = '';
  enviarVistaPrevia();
};
document.getElementById('removeFaviconBtn').onclick = () => {
  REMOVE_FAVICON = true;
  document.getElementById('s_favicon_preview').innerHTML = '';
  document.getElementById('s_favicon_input').value = '';
};

// Los textos editables también actualizan la vista previa en vivo
document.getElementById('textosEditor').addEventListener('input', (e) => {
  if (!PREVIEW.textos) PREVIEW.textos = {};
  PREVIEW.textos[e.target.dataset.key] = e.target.value;
  enviarVistaPrevia();
});
document.getElementById('s_countdown_activo').addEventListener('change', actualizarPreviewCountdown);
document.getElementById('s_countdown_texto').addEventListener('input', actualizarPreviewCountdown);
document.getElementById('s_countdown_fecha').addEventListener('input', actualizarPreviewCountdown);
function actualizarPreviewCountdown() {
  PREVIEW.countdown = {
    activo: document.getElementById('s_countdown_activo').checked,
    texto: document.getElementById('s_countdown_texto').value,
    fecha_fin: document.getElementById('s_countdown_fecha').value
  };
  enviarVistaPrevia();
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  fd.set('layout', JSON.stringify(PREVIEW.layout || ['hero', 'banners', 'productos']));
  fd.set('envio_dias_habiles', document.getElementById('s_envio_dias').value || 5);
  fd.set('countdown_json', JSON.stringify({
    activo: document.getElementById('s_countdown_activo').checked,
    texto: document.getElementById('s_countdown_texto').value,
    fecha_fin: document.getElementById('s_countdown_fecha').value
  }));
  const textosActualizados = {};
  document.querySelectorAll('.texto-editable-input').forEach(inp => { textosActualizados[inp.dataset.key] = inp.value; });
  fd.set('textos_json', JSON.stringify(textosActualizados));
  if (REMOVE_LOGO) fd.set('remove_logo', 'true');
  if (REMOVE_FAVICON) fd.set('remove_favicon', 'true');

  // Banners: mandamos la metadata (título/link/imagen actual) + los archivos nuevos por índice
  const bannersMeta = PREVIEW.banners.map(b => ({ image: b.image && b.image.startsWith('data:') ? '' : b.image, title: b.title, link: b.link }));
  fd.set('banners_json', JSON.stringify(bannersMeta));
  PREVIEW.banners.forEach((b, i) => {
    if (b._file) fd.append(`banner_image_${i}`, b._file);
  });

  const res = await fetch('/api/admin/settings', { method: 'PUT', body: fd });
  const msg = document.getElementById('settingsSavedMsg');
  if (res.ok) {
    REMOVE_LOGO = false; REMOVE_FAVICON = false;
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
    cargarConfiguracion();
  } else {
    alert('Ocurrió un error al guardar los cambios de diseño.');
  }
});

// ================= RESEÑAS =================
async function cargarResenasAdmin() {
  const res = await fetch('/api/admin/reviews');
  const reviews = await res.json();
  const cont = document.getElementById('reviewsAdminList');

  if (!reviews.length) {
    cont.innerHTML = '<p style="color:#888;">Aún no hay reseñas.</p>';
    return;
  }
  cont.innerHTML = reviews.map(r => `
    <div class="review-admin-card">
      <div class="review-admin-head">
        <div>
          <strong>${r.nombre}</strong> · <span style="color:#888;font-size:12.5px;">${r.nombre_producto}</span>
          ${r.aprobado ? '<span class="badge-approved">Aprobada</span>' : '<span class="badge-pending">Pendiente</span>'}
        </div>
        <span class="stars-admin">${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}</span>
      </div>
      ${r.comentario ? `<p class="review-admin-text">${r.comentario}</p>` : ''}
      <div class="review-admin-actions">
        ${!r.aprobado ? `<button class="btn-secondary-sm" data-approve="${r.id}">Aprobar</button>` : ''}
        <button class="btn-danger" data-delreview="${r.id}">Eliminar</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-approve]').forEach(btn => {
    btn.onclick = async () => { await fetch(`/api/admin/reviews/${btn.dataset.approve}`, { method: 'PUT' }); cargarResenasAdmin(); };
  });
  document.querySelectorAll('[data-delreview]').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('¿Eliminar esta reseña?')) return;
      await fetch(`/api/admin/reviews/${btn.dataset.delreview}`, { method: 'DELETE' });
      cargarResenasAdmin();
    };
  });
}

// ================= CÓDIGOS DE DESCUENTO =================
async function cargarDescuentos() {
  const res = await fetch('/api/admin/discounts');
  const codes = await res.json();
  document.getElementById('discountsTableBody').innerHTML = codes.length ? codes.map(c => `
    <tr>
      <td><strong>${c.codigo}</strong></td>
      <td>${c.porcentaje}%</td>
      <td>${c.ultimo_uso ? new Date(c.ultimo_uso.replace(' ', 'T')).toLocaleString('es-CO') : 'Nunca usado'}</td>
      <td><span class="pill ${c.activo ? 'pill-on' : 'pill-off'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <button class="btn-secondary" data-toggle="${c.id}" data-activo="${c.activo}">${c.activo ? 'Desactivar' : 'Activar'}</button>
        <button class="btn-danger" data-deldiscount="${c.id}">Eliminar</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="color:#888;">No hay códigos aún.</td></tr>';

  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.onclick = async () => {
      await fetch(`/api/admin/discounts/${btn.dataset.toggle}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: btn.dataset.activo === 'true' ? 0 : 1 })
      });
      cargarDescuentos();
    };
  });
  document.querySelectorAll('[data-deldiscount]').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('¿Eliminar este código?')) return;
      await fetch(`/api/admin/discounts/${btn.dataset.deldiscount}`, { method: 'DELETE' });
      cargarDescuentos();
    };
  });
}

const discountModal = document.getElementById('discountModalOverlay');
document.getElementById('newDiscountBtn').onclick = () => { document.getElementById('discountForm').reset(); discountModal.classList.add('open'); };
document.getElementById('closeDiscountModal').onclick = () => discountModal.classList.remove('open');
document.getElementById('discountForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const res = await fetch('/api/admin/discounts', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (res.ok) { discountModal.classList.remove('open'); cargarDescuentos(); }
  else { const d = await res.json(); alert(d.error || 'Error al crear el código'); }
});

// ================= MENÚS EMERGENTES =================
let POPUPS_CACHE = [];
const TIPO_LABELS = { steps: 'Pasos numerados', testimonials: 'Testimonios', text: 'Texto simple' };

async function cargarPopupsAdmin() {
  const res = await fetch('/api/admin/popups');
  POPUPS_CACHE = await res.json();
  const cont = document.getElementById('popupsList');

  if (!POPUPS_CACHE.length) {
    cont.innerHTML = '<p style="color:#888;">Aún no has creado ningún menú emergente.</p>';
    return;
  }
  cont.innerHTML = POPUPS_CACHE.map(p => `
    <div class="popup-card">
      <div>
        <div class="p-title">${p.titulo_menu}</div>
        <div class="p-type">${TIPO_LABELS[p.tipo] || p.tipo} ${p.tipo !== 'text' ? `· ${p.items.length} elemento(s)` : ''}</div>
      </div>
      <div class="p-actions">
        <button class="btn-secondary" data-editpopup="${p.id}">Editar</button>
        <button class="btn-danger" data-delpopup="${p.id}">Eliminar</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-editpopup]').forEach(btn => {
    btn.onclick = () => abrirEdicionPopup(parseInt(btn.dataset.editpopup));
  });
  document.querySelectorAll('[data-delpopup]').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('¿Eliminar este menú emergente? Se borrará todo su contenido.')) return;
      await fetch(`/api/admin/popups/${btn.dataset.delpopup}`, { method: 'DELETE' });
      cargarPopupsAdmin();
    };
  });
}

const popupModal = document.getElementById('popupModalOverlay');
document.getElementById('newPopupBtn').onclick = () => { document.getElementById('popupForm').reset(); popupModal.classList.add('open'); };
document.getElementById('closePopupModal').onclick = () => popupModal.classList.remove('open');
document.getElementById('popupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const res = await fetch('/api/admin/popups', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (res.ok) { popupModal.classList.remove('open'); cargarPopupsAdmin(); }
  else alert('Error al crear el menú emergente');
});

let POPUP_EDITANDO = null;
const popupEditModal = document.getElementById('popupEditModalOverlay');
document.getElementById('closePopupEditModal').onclick = () => popupEditModal.classList.remove('open');

function abrirEdicionPopup(id) {
  POPUP_EDITANDO = POPUPS_CACHE.find(p => p.id === id);
  if (!POPUP_EDITANDO) return;
  document.getElementById('popupEditTitle').textContent = POPUP_EDITANDO.titulo_menu;

  if (POPUP_EDITANDO.tipo === 'text') {
    document.getElementById('popupEditTextContent').style.display = 'block';
    document.getElementById('popupEditItemsContent').style.display = 'none';
    document.getElementById('popupTextArea').value = POPUP_EDITANDO.contenido_texto || '';
  } else {
    document.getElementById('popupEditTextContent').style.display = 'none';
    document.getElementById('popupEditItemsContent').style.display = 'block';
    renderPopupItems();
  }
  popupEditModal.classList.add('open');
}

document.getElementById('savePopupTextBtn').onclick = async () => {
  await fetch(`/api/admin/popups/${POPUP_EDITANDO.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contenido_texto: document.getElementById('popupTextArea').value })
  });
  popupEditModal.classList.remove('open');
  cargarPopupsAdmin();
};

function renderPopupItems() {
  const cont = document.getElementById('popupItemsList');
  const ICONOS_ETIQUETA = { cart: 'Carrito', box: 'Caja', check: 'Check', heart: 'Corazón', star: 'Estrella', truck: 'Camión', shield: 'Escudo', smile: 'Carita' };
  cont.innerHTML = POPUP_EDITANDO.items.map(item => `
    <div class="popup-item-row">
      <div class="pi-icon">${item.imagen ? `<img src="${item.imagen}">` : (ICONOS_ETIQUETA[item.icono] || '—')}</div>
      <div class="pi-info">
        <div class="pi-title">${item.titulo}</div>
        <div class="pi-text">${item.texto}</div>
      </div>
      <button class="btn-secondary" data-edititem="${item.id}">Editar</button>
      <button class="btn-danger" data-delitem="${item.id}">Eliminar</button>
    </div>
  `).join('') || '<p style="color:#888;font-size:13px;">Aún no hay elementos. Agrega el primero.</p>';

  document.querySelectorAll('[data-edititem]').forEach(btn => {
    btn.onclick = () => abrirItemPopup(POPUP_EDITANDO.items.find(i => i.id === parseInt(btn.dataset.edititem)));
  });
  document.querySelectorAll('[data-delitem]').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('¿Eliminar este elemento?')) return;
      await fetch(`/api/admin/popups/items/${btn.dataset.delitem}`, { method: 'DELETE' });
      POPUP_EDITANDO.items = POPUP_EDITANDO.items.filter(i => i.id !== parseInt(btn.dataset.delitem));
      renderPopupItems();
    };
  });
}

const popupItemModal = document.getElementById('popupItemModalOverlay');
document.getElementById('closePopupItemModal').onclick = () => popupItemModal.classList.remove('open');
let ITEM_EDITANDO_ID = null;

document.getElementById('addPopupItemBtn').onclick = () => abrirItemPopup(null);

function abrirItemPopup(item) {
  ITEM_EDITANDO_ID = item ? item.id : null;
  document.getElementById('popupItemModalTitle').textContent = item ? 'Editar elemento' : 'Agregar elemento';
  const form = document.getElementById('popupItemForm');
  form.reset();
  document.getElementById('popupItemImgPreview').innerHTML = '';

  const esTestimonio = POPUP_EDITANDO.tipo === 'testimonials';
  document.getElementById('popupItemTituloLabel').firstChild.textContent = esTestimonio ? 'Nombre del cliente' : 'Título del paso';
  document.getElementById('popupItemTextoLabel').firstChild.textContent = esTestimonio ? 'Comentario' : 'Descripción';

  if (item) {
    form.titulo.value = item.titulo || '';
    form.texto.value = item.texto || '';
    form.icono.value = item.icono || 'cart';
    form.animacion.value = item.animacion || 'none';
    if (item.imagen) document.getElementById('popupItemImgPreview').innerHTML = `<img src="${item.imagen}">`;
  }
  popupItemModal.classList.add('open');
}

document.getElementById('popupItemImgInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { document.getElementById('popupItemImgPreview').innerHTML = `<img src="${ev.target.result}">`; };
  reader.readAsDataURL(file);
});

document.getElementById('popupItemForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const url = ITEM_EDITANDO_ID
    ? `/api/admin/popups/items/${ITEM_EDITANDO_ID}`
    : `/api/admin/popups/${POPUP_EDITANDO.id}/items`;
  const method = ITEM_EDITANDO_ID ? 'PUT' : 'POST';
  const res = await fetch(url, { method, body: fd });
  if (res.ok) {
    popupItemModal.classList.remove('open');
    const refreshed = await (await fetch('/api/admin/popups')).json();
    POPUPS_CACHE = refreshed;
    POPUP_EDITANDO = refreshed.find(p => p.id === POPUP_EDITANDO.id);
    renderPopupItems();
  } else {
    alert('Error al guardar el elemento');
  }
});
