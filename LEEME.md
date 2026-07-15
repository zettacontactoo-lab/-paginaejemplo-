# Tu Tienda — Proyecto local

## ⚠️ Muy importante: cómo abrir la tienda correctamente

**Nunca abras los archivos `.html` haciendo doble clic desde el Explorador de Windows.** Si haces eso, la barra de direcciones del navegador va a mostrar algo como `C:/Users/.../panel.html` en vez de `http://localhost:3000/...` — y en ese caso nada va a funcionar (ni las métricas, ni la vista previa, ni el guardado de productos), porque esas funciones necesitan hablar con el servidor.

**Siempre entra así:**
1. Corre `npm start` en la terminal (ver Paso 4 más abajo).
2. Abre el navegador y entra a `http://localhost:3000` (tienda) o `http://localhost:3000/admin` (panel) escribiendo la dirección tú mismo, o haciendo clic en el link — nunca abriendo el archivo directamente.

## Novedades de esta versión

- **Animación de carrito al cargar la tienda**: antes de mostrar la tienda completa, aparece una animación breve de un carrito de compras.
- **Banners ilimitados**: ya no son solo 3 — puedes agregar y quitar los que quieras desde "+ Agregar banner".
- **Constructor visual con arrastrar y soltar**: en el panel de admin → "Diseño de la tienda", puedes arrastrar para decidir en qué orden aparecen el banner principal, los banners promocionales y la sección de productos.
- **Vista previa en vivo**: al lado del formulario de diseño hay una ventana que muestra la tienda en tiempo real — cada cambio que hagas (colores, textos, orden, imágenes) se refleja ahí al instante, ANTES de guardar. Solo tienes que darle "Guardar cambios de diseño" cuando quede como quieres.
- **Íconos propios de un solo color** en toda la plataforma (tienda y panel admin) — nada de emojis, todo con un estilo de línea consistente y profesional.
- Buscador de productos en la tienda.
- Precio de oferta con insignia de descuento automática.
- Unidades disponibles con "Agotado" automático.
- Carrusel de imágenes en la ficha de producto.
- Previsualización de imágenes antes de subirlas.

## Novedades de la versión anterior

Esta es tu tienda contraentrega completa: tienda pública + panel de administración.
Aquí tienes TODO lo necesario para probarla en tu computador, sin gastar en hosting ni dominio todavía.

---

## PASO 1: Instalar Node.js (una sola vez)

Node.js es el programa que hace correr la tienda en tu computador. Es gratis.

1. Ve a **https://nodejs.org**
2. Descarga la versión que dice **"LTS"** (la recomendada, no la más nueva).
3. Instálalo como cualquier programa (Siguiente, Siguiente, Instalar).
4. Para confirmar que quedó instalado, abre la terminal (en Windows: busca "cmd" o "PowerShell"; en Mac: busca "Terminal") y escribe:
   ```
   node -v
   ```
   Si te muestra un número de versión (ej: v20.11.0), quedó instalado correctamente.

## PASO 2: Abrir la carpeta del proyecto

1. Descomprime el archivo .zip que te entregué en el lugar donde quieras guardar el proyecto (ej: Escritorio).
2. Abre la terminal.
3. Entra a la carpeta del proyecto. Ejemplo si está en el Escritorio (Windows):
   ```
   cd Desktop\tienda
   ```
   O en Mac:
   ```
   cd Desktop/tienda
   ```
   (Tip: puedes escribir `cd ` con un espacio y luego arrastrar la carpeta del proyecto directo a la terminal, y ella escribe la ruta sola.)

## PASO 3: Instalar las piezas que la tienda necesita

Dentro de la carpeta del proyecto (en la terminal), escribe:
```
npm install
```
Espera a que termine (puede tardar 1-2 minutos). Esto descarga todo lo necesario para que la tienda funcione. Solo se hace una vez.

## PASO 4: Encender la tienda

```
npm start
```

Si todo salió bien, verás en la terminal:
```
✅ Tienda corriendo en http://localhost:3000
✅ Panel admin en http://localhost:3000/admin
```

**Deja esa ventana de terminal abierta** — mientras esté abierta, tu tienda está "prendida". Si la cierras, la tienda se apaga (esto es normal, y así seguirá funcionando cuando la subamos a un hosting real más adelante, solo que ahí queda prendida 24/7).

## PASO 5: Ver la tienda

- **Tienda pública** (lo que ve el cliente): abre tu navegador y entra a
  👉 `http://localhost:3000`

- **Panel de administración** (solo para ti, nadie más lo ve ni tiene enlace a él):
  👉 `http://localhost:3000/admin`

  Usuario y contraseña iniciales (¡cámbialos! ver Paso 6):
  - Usuario: `admin`
  - Contraseña: `cambiaEstaClave123`

---

## PASO 6: Cambiar tu usuario y contraseña de admin

1. Busca en la carpeta del proyecto un archivo llamado **`.env`** (ábrelo con el Bloc de notas o cualquier editor de texto — puede que tu explorador de archivos oculte archivos que empiezan con punto; si no lo ves, activa "mostrar archivos ocultos").
2. Ahí verás algo así:
   ```
   ADMIN_USER=admin
   ADMIN_PASS=cambiaEstaClave123
   ```
3. Cambia esos valores por tu usuario y contraseña reales, guarda el archivo.
4. Apaga la terminal (Ctrl+C) y vuelve a correr `npm start` para que tome el cambio.

**Importante:** este archivo `.env` nunca debe compartirse ni subirse a internet (ej: a GitHub público). Es tu "llave" del panel.

---

## Cómo se usa día a día

1. **Cargar productos:** entra a `/admin` → pestaña "Productos" → "+ Nuevo producto". Llena nombre, descripción, categoría, precio, el SKU de Droppi (para identificarlo al despachar), y sube las fotos.
2. **Recibir pedidos:** cuando un cliente compra en la tienda, el pedido aparece automáticamente en la pestaña "Pedidos" del panel — con nombre, teléfono, dirección y productos.
3. **Despachar en Droppi:** ve a la pestaña "Pedidos" → botón **"⬇ Exportar a Excel"**. Esto descarga un CSV (se abre directo en Excel) con todos los pedidos, listo para que hagas el despacho en Droppi.
4. **Actualizar el estado del pedido:** en cada pedido puedes cambiar el estado (Pendiente, Despachado, En camino, Entregado, etc.), agregar la transportadora, el número de guía, y marcar si hay que contactar al cliente.
5. **Ver métricas:** pestaña "Métricas" — ventas totales, ventas de hoy, pedidos pendientes de contacto, productos más vendidos.

---

## Qué sigue (cuando ya lo hayas probado y te guste)

Cuando quieras que la tienda esté disponible en internet 24/7 (no solo en tu computador), el siguiente paso es:
1. Comprar un dominio (ej: tutienda.com).
2. Contratar un hosting que soporte Node.js (ej: Railway, Render, DigitalOcean — hay opciones económicas).
3. Subir este mismo proyecto ahí.

No hay que reescribir nada — el mismo código que corre en tu computador es el que corre en internet. Cuando llegues a ese paso, dímelo y te ayudo con el despliegue.

---

## Estructura del proyecto (por si tienes curiosidad)

```
tienda/
├── server.js          → el "motor" de la tienda (servidor)
├── .env                → tu usuario/clave de admin (privado)
├── database/           → configuración de la base de datos
├── data/                → aquí vive tu base de datos (productos y pedidos)
├── public/              → la tienda que ve el cliente
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── uploads/          → fotos de productos que subas
└── admin/                → el panel de administración
    ├── login.html
    ├── panel.html
    ├── admin.css
    └── admin.js
```
