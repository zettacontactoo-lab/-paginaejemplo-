# Tu Tienda — Proyecto local

## Novedades de esta versión (arreglos de color + banners + animaciones)

**Arreglos de bugs reales:**
- El hero se veía oscuro sin remedio: el control de "opacidad" solo afectaba la imagen, no la capa oscura de encima. Ahora hay un control aparte ("Oscurecer la imagen") que en 0% quita esa capa por completo.
- Botones que "desaparecían" (Agregar al carrito, Enviar comentario): estaban atados al mismo color que el header/fondo — si cambiabas ese color a uno claro, el botón se volvía invisible. Ahora tienen colores propios, independientes.
- Favicon "pequeño": aclarado — los navegadores SIEMPRE muestran el ícono de la pestaña diminuto, es así en todos los sitios web del mundo, no se puede agrandar. Lo que sí se agrandó fue el rango del tamaño del **logo** del encabezado (ahora hasta 120px).

**Colores independientes:** además de color principal, acento y secundario, ahora puedes definir por separado: color del texto general, color de íconos/botones, color del texto del encabezado, y color del texto del menú de categorías.

**Banners nuevos:**
- Banner del carrito: una imagen (con link opcional) que aparece arriba de los productos dentro del carrito.
- Imagen de la ventana de "Pedido confirmado": aparece junto al mensaje de confirmación que ve el cliente justo después de comprar.

**10 animaciones** (antes solo 3): rebote, pulso, giro, sacudida, desvanecer, zoom, voltear, balanceo, tambaleo y flotar — con selectores **separados** para la imagen/ícono y para el texto de cada elemento de un menú emergente. Todas se mantienen dentro de su caja asignada, sin desbordarse.

**Vista previa escritorio/celular:** en "Diseño de la tienda", arriba de la vista previa en vivo, dos botones para ver cómo se ve la tienda en pantalla de escritorio o angosta como celular.

**Filtro de categorías optimizado:** si tienes más de 6 categorías, las primeras se muestran como siempre y el resto queda agrupado en un menú desplegable "Más ▾", para que la barra no se vuelva una fila interminable.

**Campos obligatorios ampliados:** ahora puedes marcar también "Notas" como obligatorias, y se ven claramente marcados (aunque bloqueados) los 3 campos que siempre son obligatorios por diseño (nombre, teléfono, dirección).

## Novedades de la versión anterior (editor de tema completo)

**Hero con carrusel de diapositivas:**
- Agrega una o varias diapositivas (imagen + título + subtítulo cada una); con más de una se activa un carrusel automático con flechas y puntos.
- Muestra/oculta el texto sobre la imagen de forma independiente, o deja solo la imagen.
- Selector de altura (completa, media, o personalizada en píxeles).
- Autoplay configurable (activar/desactivar y segundos entre diapositivas).
- Ocultar el hero en celular si lo prefieres.

**Colores con degradado:** el color principal y el de acento pueden ser un degradado (dos colores + ángulo) en vez de un color sólido.

**Banners:** cada banner puede marcarse como "ancho completo" (ocupa toda la fila) o mantenerse en cuadrícula normal.

**Countdown de oferta:** con tipo de mensaje (oferta / envío gratis / descuento / promoción) y animación en el ícono.

**Filtro de pedidos:** en la pestaña Pedidos, filtra por estado, rango de fechas, cliente (nombre o teléfono), y transportadora.

> **Nota honesta:** no existe un filtro por "método de pago" porque tu tienda es 100% contraentrega. El "carrusel de banners" se resolvió con el carrusel del Hero (un solo sistema, en vez de dos redundantes).

## Novedades de versiones anteriores (consolidado + responsive)

**Arreglos consolidados:**
- Carrusel de imágenes de producto arreglado.
- Botón de quitar logo, subir/quitar favicon.
- Bug donde el producto no abría al hacer clic — arreglado.
- La tienda ya no se queda trabada en "Cargando..." si algo falla.
- La etiqueta "Nuevo"/"Más vendido" ya no se monta encima del precio.
- Importación de Excel: detecta sola si el separador es coma o punto y coma, y si el archivo viene en UTF-8 o en la codificación típica del Excel en español.
- Columnas de etiqueta, beneficios y variantes en el Excel de importación.

**Responsive:** tienda pública y panel de admin se adaptan a pantallas de celular.

## ⚠️ Muy importante: cómo abrir la tienda correctamente

**Nunca abras los archivos `.html` haciendo doble clic desde el Explorador de Windows.** Si haces eso, la barra de direcciones del navegador va a mostrar algo como `C:/Users/.../panel.html` en vez de `http://localhost:3000/...` — y en ese caso nada va a funcionar (ni las métricas, ni la vista previa, ni el guardado de productos), porque esas funciones necesitan hablar con el servidor.

**Siempre entra así:**
1. Corre `npm start` en la terminal (ver Paso 4 más abajo).
2. Abre el navegador y entra a `http://localhost:3000` (tienda) o `http://localhost:3000/admin` (panel) escribiendo la dirección tú mismo, o haciendo clic en el link — nunca abriendo el archivo directamente.

## Funciones completas del sistema (referencia rápida)

- Catálogo con buscador, categorías (con menú "Más" si son muchas), y orden de secciones editable.
- Carrito con banner promocional propio, checkout sin login, botón "Comprar ahora", código de descuento con bloqueo de 5 min.
- Ventana de confirmación de pedido con imagen/banner propio.
- Variantes de producto, beneficios en viñetas, fecha de entrega estimada dinámica.
- Reseñas de producto con moderación.
- Rastreo de pedido público en ventana emergente.
- Descuento y restauración automática de stock según el estado del pedido.
- Importar/exportar productos por Excel (CSV), sin quitar la carga manual.
- Menús emergentes editables con imagen o ícono animado (10 animaciones, separadas para imagen y texto).
- Hero con carrusel de diapositivas (opacidad y oscurecimiento independientes), countdown de oferta, botón de WhatsApp flotante, textos de la tienda 100% editables.
- Identidad de marca: logo (tamaño ajustable), favicon, colores (sólidos, degradados, o independientes por elemento), banners ilimitados, redes sociales, copyright del encabezado.
- Filtro de pedidos por estado, fecha, cliente y transportadora.
- Campos obligatorios del checkout completamente configurables.
- Vista previa en vivo con selector de escritorio/celular.
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
