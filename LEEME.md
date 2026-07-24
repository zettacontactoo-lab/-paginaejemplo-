# Tu Tienda — Proyecto local

## Novedades de esta versión (editor de tema completo)

**Hero con carrusel de diapositivas:**
- Agrega una o varias diapositivas (imagen + título + subtítulo cada una); con más de una se activa un carrusel automático con flechas y puntos.
- Muestra/oculta el texto sobre la imagen de forma independiente, o deja solo la imagen.
- Control de opacidad de la imagen de fondo.
- Selector de altura (completa, media, o personalizada en píxeles).
- Autoplay configurable (activar/desactivar y segundos entre diapositivas).
- Ocultar el hero en celular si lo prefieres.
- Se arregló el bug donde no se podía quitar la imagen del hero una vez cargada.

**Colores con degradado:** el color principal y el de acento ahora pueden ser un degradado (dos colores + ángulo) en vez de un color sólido.

**Encabezado:** tamaño del logo ajustable, color de fondo de la barra de categorías, y texto de derechos de autor opcional.

**Banners:** cada banner ahora puede marcarse como "ancho completo" (ocupa toda la fila) o mantenerse en cuadrícula normal.

**Countdown de oferta:** ahora con tipo de mensaje (oferta / envío gratis / descuento / promoción) y animación configurable en el ícono.

**Campos obligatorios del checkout:** decides si ciudad y departamento son obligatorios o no. Nombre, teléfono y dirección siempre son obligatorios (son indispensables para poder entregar el pedido).

**Filtro de pedidos:** en la pestaña Pedidos, filtra por estado, rango de fechas, cliente (nombre o teléfono), y transportadora.

> **Nota honesta:** no existe un filtro por "método de pago" porque tu tienda es 100% contraentrega — no hay otro método de pago en el sistema para filtrar. El "carrusel de banners" que se pidió como tipo de banner separado se resolvió con el carrusel del Hero (un solo sistema, en vez de construir dos carruseles distintos).

## Novedades de la versión anterior (consolidado + responsive)

Esta entrega junta **todas** las correcciones y funciones construidas hasta ahora, además de un ajuste completo para que se vea y use bien desde el celular (tienda pública y panel de administración).

**Arreglos consolidados:**
- Carrusel de imágenes de producto arreglado.
- Botón de quitar logo, subir/quitar favicon.
- Bug donde el producto no abría al hacer clic — arreglado.
- La tienda ya no se queda trabada en "Cargando..." si algo falla — siempre termina de cargar (o avisa el error).
- La etiqueta "Nuevo"/"Más vendido" ya no se monta encima del precio.
- Importación de Excel: detecta sola si el separador es coma o punto y coma, y si el archivo viene en UTF-8 o en la codificación típica del Excel en español (arregla las tildes rotas).
- Columnas de etiqueta, beneficios y variantes ya se pueden llenar desde el Excel de importación.

**Responsive:**
- Tienda pública: catálogo, ficha de producto, carrito, checkout, menús emergentes y rastreo de pedido se adaptan a pantallas de celular (los modales se comportan como hojas deslizables desde abajo, más cómodas de usar con el pulgar).
- Panel de admin: el menú lateral se convierte en una barra superior deslizable en pantallas chicas, las tablas se pueden desplazar horizontalmente, y los formularios se ajustan a una sola columna.

## ⚠️ Muy importante: cómo abrir la tienda correctamente

**Nunca abras los archivos `.html` haciendo doble clic desde el Explorador de Windows.** Si haces eso, la barra de direcciones del navegador va a mostrar algo como `C:/Users/.../panel.html` en vez de `http://localhost:3000/...` — y en ese caso nada va a funcionar (ni las métricas, ni la vista previa, ni el guardado de productos), porque esas funciones necesitan hablar con el servidor.

**Siempre entra así:**
1. Corre `npm start` en la terminal (ver Paso 4 más abajo).
2. Abre el navegador y entra a `http://localhost:3000` (tienda) o `http://localhost:3000/admin` (panel) escribiendo la dirección tú mismo, o haciendo clic en el link — nunca abriendo el archivo directamente.

## Funciones completas del sistema (referencia rápida)

- Catálogo con buscador, categorías, y orden de secciones editable (arrastrar y soltar).
- Carrito, checkout sin login, botón "Comprar ahora", código de descuento con bloqueo de 5 min.
- Variantes de producto (color, talla, etc.), beneficios en viñetas, fecha de entrega estimada dinámica.
- Reseñas de producto con moderación (aprobar/eliminar desde el panel).
- Rastreo de pedido público (número de pedido + teléfono) en ventana emergente.
- Descuento y restauración automática de stock según el estado del pedido.
- Importar/exportar productos por Excel (CSV), sin quitar la carga manual.
- Menús emergentes editables (Cómo funciona, Testimonios, Política de cambios, o los que quieras) con imagen o ícono animado.
- Hero con carrusel de diapositivas, countdown de oferta, botón de WhatsApp flotante, textos de la tienda 100% editables.
- Identidad de marca: logo (con tamaño ajustable), favicon, colores (sólidos o degradados), banners ilimitados (con opción de ancho completo), redes sociales, copyright del encabezado.
- Filtro de pedidos por estado, fecha, cliente y transportadora.
- Campos obligatorios del checkout configurables.
- Vista previa en vivo de los cambios de diseño antes de guardar.
- Métricas de ventas, pedidos por estado, productos más vendidos.

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
