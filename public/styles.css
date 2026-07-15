:root {
  --ink: #14161F;
  --ink-soft: #2A2D3A;
  --accent: #FFC93C;
  --accent-dark: #E8AE12;
  --teal: #0E7C7B;
  --bg: #FFFFFF;
  --bg-soft: #F4F4F6;
  --text: #1B1B1F;
  --text-muted: #6B6C76;
  --radius: 14px;
  --font-display: 'Sora', sans-serif;
  --font-body: 'Inter', sans-serif;
}

/* ---- Pantalla de carga (carrito animado) ---- */
.loading-screen {
  position: fixed; inset: 0; z-index: 999;
  background: var(--ink);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
  transition: opacity .4s ease, visibility .4s ease;
}
.loading-screen.hide { opacity: 0; visibility: hidden; pointer-events: none; }
.loading-cart { color: var(--accent); animation: cartRoll 1.1s ease-in-out infinite; }
.cart-body { animation: cartBounce 1.1s ease-in-out infinite; }
.wheel { transform-origin: center; animation: wheelSpin .5s linear infinite; }
.loading-text { color: #C7C8D2; font-family: var(--font-body); font-size: 13.5px; font-weight: 600; letter-spacing: .3px; }

@keyframes cartRoll {
  0%, 100% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
}
@keyframes cartBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
@keyframes wheelSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--text);
  background: var(--bg);
}
a { color: inherit; }

/* ---- Announce bar ---- */
.announce-bar {
  background: var(--accent);
  color: var(--ink);
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
  padding: 7px 10px;
  letter-spacing: .2px;
}

/* ---- Topbar ---- */
.topbar {
  background: var(--ink);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.logo { font-family: var(--font-display); font-weight: 800; font-size: 22px; white-space: nowrap; }
.logo span { color: var(--accent); }
.logo-img { height: 36px; object-fit: contain; }

.search-wrap {
  flex: 1;
  display: flex;
  max-width: 560px;
  margin: 0 auto;
}
.search-wrap input {
  flex: 1;
  border: none;
  border-radius: 8px 0 0 8px;
  padding: 11px 14px;
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
}
.search-wrap button {
  background: var(--accent);
  border: none;
  padding: 0 18px;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn {
  background: var(--accent);
  color: var(--ink);
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 7px;
}

.catnav {
  background: var(--ink-soft);
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 0 20px;
}
.catnav .chip {
  background: transparent;
  border: none;
  color: #D5D6E0;
  padding: 11px 16px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
}
.catnav .chip.active { color: #fff; border-bottom-color: var(--accent); }
.catnav .chip:hover { color: #fff; }

#pageSections { display: flex; flex-direction: column; }
.search-wrap button svg, #cartBtn svg { display: block; }
.badge-cod { display: inline-flex; align-items: center; gap: 5px; }
.hero {
  background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: #fff;
  padding: 56px 20px;
  background-size: cover;
  background-position: center;
}
.hero-inner { max-width: 700px; margin: 0 auto; text-align: center; }
.hero h1 {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 14px;
  white-space: pre-line;
}
.hero p { color: #C7C8D2; font-size: 16px; margin: 0; }

/* ---- Banners promocionales ---- */
.banners-row {
  max-width: 1280px;
  margin: 24px auto 0;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.banner-block {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  min-height: 140px;
  background: var(--bg-soft);
  display: flex;
  align-items: flex-end;
  text-decoration: none;
}
.banner-block img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.banner-block .label {
  position: relative;
  z-index: 2;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  padding: 16px;
  background: linear-gradient(0deg, rgba(20,22,31,0.75), transparent);
  width: 100%;
}

/* ---- Catalogo ---- */
.catalog-wrap { max-width: 1280px; margin: 36px auto 60px; padding: 0 20px; }
.catalog-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 18px; }
.catalog-head h2 { font-family: var(--font-display); font-size: 20px; margin: 0; }
.result-count { color: var(--text-muted); font-size: 13px; }

.catalogo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}
.loading { color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 40px; }

.card {
  background: #fff;
  border: 1px solid #ECECEF;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
  position: relative;
}
.card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(20,22,31,0.08); }
.card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; background: var(--bg-soft); transition: transform .35s ease; }
.card:hover img { transform: scale(1.06); }
.card-body { padding: 12px 14px 16px; }
.card-name { font-weight: 600; font-size: 14.5px; margin: 0 0 6px; line-height: 1.3; min-height: 37px; }
.card-price-row { display: flex; align-items: baseline; gap: 8px; }
.card-price { font-family: var(--font-display); font-weight: 800; font-size: 17px; color: var(--ink); }
.card-price-old { font-size: 13px; color: var(--text-muted); text-decoration: line-through; }
.badge-cod {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--teal);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 999px;
  z-index: 2;
}
.badge-off {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #D64545;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 9px;
  border-radius: 999px;
  z-index: 2;
}
.badge-agotado {
  position: absolute;
  inset: 0;
  background: rgba(20,22,31,0.55);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  z-index: 3;
}
.badge-etiqueta {
  position: absolute;
  top: 38px;
  left: 10px;
  background: var(--ink);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: .3px;
}

/* ---- Overlays / Modales ---- */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(20,22,31,0.55);
  z-index: 100;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.overlay.open { display: flex; }
.modal {
  background: #fff;
  border-radius: 18px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--bg-soft);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.cart-drawer { max-width: 420px; }
#cartItems { margin: 16px 0; display: flex; flex-direction: column; gap: 12px; }
.cart-item { display: flex; gap: 10px; align-items: center; border-bottom: 1px solid #EEE; padding-bottom: 10px; }
.cart-item img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
.cart-item-info { flex: 1; }
.cart-item-info .name { font-size: 13.5px; font-weight: 600; }
.qty-controls { display: flex; align-items: center; gap: 8px; }
.qty-controls button { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #DDD; background: #fff; cursor: pointer; }
.cart-total { font-size: 17px; margin: 10px 0 18px; }

.btn-primary {
  width: 100%;
  background: var(--accent);
  color: var(--ink);
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

/* Product modal + carrusel */
.producto-modal .carousel { position: relative; margin-bottom: 14px; }
.producto-modal .carousel-viewport {
  width: 100%; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: var(--bg-soft);
}
.producto-modal .carousel-track {
  display: flex; height: 100%; transition: transform .25s ease;
}
.producto-modal .carousel-track img { width: 100%; height: 100%; object-fit: cover; flex: 0 0 100%; }
.carousel-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.9); border: none; width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--ink);
}
.carousel-nav.prev { left: 8px; }
.carousel-nav.next { right: 8px; }
.carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 8px; }
.carousel-dots span { width: 7px; height: 7px; border-radius: 50%; background: #DADADF; cursor: pointer; }
.carousel-dots span.active { background: var(--ink); }

.producto-modal h2 { font-family: var(--font-display); font-size: 20px; margin: 0 0 6px; }
.producto-modal .price-row { display: flex; align-items: baseline; gap: 10px; margin: 6px 0 14px; }
.producto-modal .price { font-family: var(--font-display); font-weight: 800; font-size: 22px; }
.producto-modal .price-old { font-size: 15px; color: var(--text-muted); text-decoration: line-through; }
.producto-modal .stock-note { font-size: 12.5px; color: var(--teal); font-weight: 600; margin: -8px 0 12px; }
.producto-modal .stock-note.low { color: #D64545; }
.producto-modal .desc { color: var(--text-muted); font-size: 14px; line-height: 1.5; margin-bottom: 16px; }
.qty-selector { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.qty-selector button { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #DDD; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text); }

/* Checkout form */
.checkout-modal h2 { font-family: var(--font-display); margin: 0 0 4px; }
.sub { color: var(--text-muted); font-size: 13.5px; margin: 0 0 18px; }
#checkoutForm { display: flex; flex-direction: column; gap: 12px; }
#checkoutForm label { font-size: 13px; font-weight: 600; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px; }
#checkoutForm input, #checkoutForm textarea {
  font-family: var(--font-body);
  padding: 11px 12px;
  border-radius: 8px;
  border: 1px solid #DADADF;
  font-size: 14.5px;
  color: var(--text);
}
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.confirm-modal { text-align: center; max-width: 380px; }
.confirm-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--teal); color: #fff; font-size: 26px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}

/* ---- Footer ---- */
.footer { background: var(--ink); color: #C7C8D2; padding: 32px 20px; margin-top: 40px; }
.footer-inner { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.footer-brand p { font-size: 13px; margin: 8px 0 0; max-width: 420px; }
.footer-social { display: flex; gap: 12px; }
.footer-social a {
  width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 16px;
}

@media (max-width: 700px) {
  .topbar-inner { flex-wrap: wrap; }
  .search-wrap { order: 3; max-width: 100%; }
  .hero h1 { font-size: 26px; }
}

/* ---- Countdown de oferta ---- */
.countdown-bar {
  background: #D64545;
  color: #fff;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.countdown-bar strong { font-family: var(--font-display); letter-spacing: .5px; }

/* ---- WhatsApp flotante ---- */
.whatsapp-float {
  position: fixed;
  bottom: 22px;
  right: 22px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #25D366;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  z-index: 80;
  text-decoration: none;
}

/* ---- Envío estimado ---- */
.envio-estimado {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
  background: var(--bg-soft);
  padding: 10px 12px;
  border-radius: 10px;
  margin: 10px 0 16px;
}

/* ---- Beneficios (viñetas) ---- */
.beneficios-list { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 6px; }
.beneficios-list li { font-size: 13.5px; display: flex; align-items: center; gap: 8px; color: var(--text); }
.beneficios-list li svg { color: var(--teal); flex-shrink: 0; }

/* ---- Variantes ---- */
.variant-group { margin-bottom: 14px; }
.variant-group .variant-label { font-size: 12.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 7px; text-transform: uppercase; letter-spacing: .3px; }
.variant-options { display: flex; flex-wrap: wrap; gap: 8px; }
.variant-chip {
  padding: 8px 14px; border-radius: 8px; border: 1.5px solid #DADADF; background: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text);
}
.variant-chip.selected { border-color: var(--ink); background: var(--ink); color: #fff; }

/* ---- Botones dobles (agregar / comprar ahora) ---- */
.buy-buttons { display: flex; gap: 10px; margin-bottom: 10px; }
.buy-buttons .btn-primary { flex: 1; }
.btn-outline-dark {
  flex: 1; background: #fff; color: var(--ink); border: 1.5px solid var(--ink);
  padding: 14px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer;
}

/* ---- Reseñas ---- */
.reviews-section { margin-top: 22px; border-top: 1px solid #EEE; padding-top: 18px; }
.reviews-section h3 { font-family: var(--font-display); font-size: 15px; margin: 0 0 10px; }
.reviews-summary { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; font-size: 14px; }
.stars { color: var(--accent-dark); letter-spacing: 1px; }
.review-item { border-bottom: 1px solid #F0F0F0; padding: 10px 0; }
.review-item .review-head { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
.review-item .review-text { font-size: 13.5px; color: var(--text-muted); margin: 4px 0 0; }
.review-form { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.review-form input, .review-form textarea {
  font-family: var(--font-body); padding: 10px 12px; border-radius: 8px; border: 1px solid #DADADF; font-size: 13.5px;
}
.star-picker { display: flex; gap: 4px; }
.star-picker button { background: none; border: none; cursor: pointer; font-size: 22px; color: #DADADF; padding: 0; }
.star-picker button.active { color: var(--accent-dark); }

/* ---- Productos relacionados ---- */
.related-section { margin-top: 22px; border-top: 1px solid #EEE; padding-top: 18px; }
.related-section h3 { font-family: var(--font-display); font-size: 15px; margin: 0 0 10px; }
.related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.related-card { cursor: pointer; border: 1px solid #ECECEF; border-radius: 10px; overflow: hidden; }
.related-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
.related-card .rc-body { padding: 8px; }
.related-card .rc-name { font-size: 12px; font-weight: 600; margin: 0 0 3px; line-height: 1.25; }
.related-card .rc-price { font-size: 13px; font-weight: 800; font-family: var(--font-display); }

/* ---- Código de descuento en checkout ---- */
.discount-box { display: flex; gap: 8px; margin-bottom: 6px; }
.discount-box input {
  flex: 1; padding: 10px 12px; border-radius: 8px; border: 1px solid #DADADF; font-size: 13.5px; font-family: var(--font-body);
}
.btn-secondary-sm {
  background: var(--ink); color: #fff; border: none; padding: 0 16px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;
}
.discount-msg { font-size: 12.5px; margin: 0 0 10px; min-height: 15px; }
.discount-msg.ok { color: #1D8A44; }
.discount-msg.error { color: #D64545; }
.checkout-total-summary { background: var(--bg-soft); border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 13.5px; }
.checkout-total-summary .line { display: flex; justify-content: space-between; margin: 3px 0; }
.checkout-total-summary .line.total { font-weight: 800; font-size: 15px; border-top: 1px solid #E2E2E7; margin-top: 6px; padding-top: 6px; }

/* ---- Menús emergentes de contenido (Cómo funciona / Testimonios / Política) ---- */
.footer-links { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 10px; }
.footer-links button {
  background: none; border: none; color: #C7C8D2; font-size: 12.5px; cursor: pointer; text-decoration: underline; padding: 0; font-family: var(--font-body);
}
.info-popup-modal h2 { font-family: var(--font-display); font-size: 19px; margin: 0 0 16px; }
.popup-step { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 18px; }
.popup-step .step-icon {
  width: 46px; height: 46px; border-radius: 12px; background: var(--bg-soft); color: var(--ink);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;
}
.popup-step .step-icon img { width: 100%; height: 100%; object-fit: cover; }
.popup-step .step-title { font-weight: 700; font-size: 14.5px; margin: 0 0 3px; }
.popup-step .step-text { font-size: 13.5px; color: var(--text-muted); margin: 0; }

.popup-testimonial { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F0F0F0; }
.popup-testimonial:last-child { border-bottom: none; }
.popup-testimonial .t-avatar {
  width: 44px; height: 44px; border-radius: 50%; background: var(--bg-soft); color: var(--ink); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden; font-weight: 700;
}
.popup-testimonial .t-avatar img { width: 100%; height: 100%; object-fit: cover; }
.popup-testimonial .t-name { font-weight: 700; font-size: 13.5px; margin: 0 0 3px; }
.popup-testimonial .t-text { font-size: 13.5px; color: var(--text-muted); margin: 0; }

.popup-text-content { font-size: 14px; color: var(--text); line-height: 1.6; white-space: pre-line; }

@keyframes iconBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes iconPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
@keyframes iconSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.anim-bounce { animation: iconBounce 1.4s ease-in-out infinite; }
.anim-pulse { animation: iconPulse 1.4s ease-in-out infinite; }
.anim-spin { animation: iconSpin 3s linear infinite; }

/* ---- Rastreo de pedido ---- */
.track-modal h2 { font-family: var(--font-display); margin: 0 0 4px; }
#trackForm { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
#trackForm label { font-size: 13px; font-weight: 600; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px; }
#trackForm input { padding: 11px 12px; border-radius: 8px; border: 1px solid #DADADF; font-size: 14.5px; font-family: var(--font-body); }
.track-result-box { margin-top: 18px; }
.track-status-line { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F0F0F0; font-size: 13.5px; }
.track-status-line .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--teal); flex-shrink: 0; }
.track-error { color: #D64545; font-size: 13.5px; margin-top: 14px; }
