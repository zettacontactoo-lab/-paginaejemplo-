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
  document.getElementById('imgPreviewRow').innerHTML = '';
  document.getElementById('newImgPreviewRow').innerHTML = '';
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
  form.activo.checked = !!p.activo;
  form.destacado.checked = !!p.destacado;
  imagenesExistentes = [...p.imagenes];
  document.getElementById('newImgPreviewRow').innerHTML = '';
  renderImgPreview();
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

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const fd = new FormData(e.target);
  fd.set('activo', e.target.activo.checked ? 'true' : 'false');
  fd.set('destacado', e.target.destacado.checked ? 'true' : 'false');
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
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;">
          <input type="checkbox" data-field="necesita_contacto" data-id="${o.id}" ${o.necesita_contacto ? 'checked' : ''}> Contactar
        </label>
        <input type="text" placeholder="Notas internas" value="${o.notas_internas || ''}" data-field="notas_internas" data-id="${o.id}" style="flex:1;min-width:160px;">
      </div>
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

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  fd.set('layout', JSON.stringify(PREVIEW.layout || ['hero', 'banners', 'productos']));

  // Banners: mandamos la metadata (título/link/imagen actual) + los archivos nuevos por índice
  const bannersMeta = PREVIEW.banners.map(b => ({ image: b.image && b.image.startsWith('data:') ? '' : b.image, title: b.title, link: b.link }));
  fd.set('banners_json', JSON.stringify(bannersMeta));
  PREVIEW.banners.forEach((b, i) => {
    if (b._file) fd.append(`banner_image_${i}`, b._file);
  });

  const res = await fetch('/api/admin/settings', { method: 'PUT', body: fd });
  const msg = document.getElementById('settingsSavedMsg');
  if (res.ok) {
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
    cargarConfiguracion();
  } else {
    alert('Ocurrió un error al guardar los cambios de diseño.');
  }
});
