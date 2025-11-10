# 📁 Estructura del Proyecto FerreterIA

## 🎯 Organización General

Este proyecto está organizado en dos vistas principales:
- **Vista de Usuario (Shop)**: Para comprar productos
- **Vista de Administrador**: Para gestionar productos (CRUD)

---

## 📂 Estructura de Directorios

```
FerreterIA-IngDeSofware/
│
├── 📄 Index.html                 # Página principal (landing)
├── 📄 README.md                  # Documentación del proyecto
│
├── 📁 html/
│   ├── 📁 usuario/               # Vistas de usuario (shop)
│   │   ├── tienda.html          # Vista principal de tienda (catálogo)
│   │   ├── carrito.html         # Vista del carrito de compras
│   │   ├── checkout.html        # Proceso de compra
│   │   ├── compra-exitosa.html  # Confirmación de compra
│   │   ├── detalle-producto.html # Detalle de un producto
│   │   ├── dashboard-usuario.html # Dashboard de usuario (legacy)
│   │   ├── explora.html         # Explorar productos (legacy)
│   │   └── registro.html        # Registro de usuarios
│   │
│   ├── 📁 admin/                 # Vistas de administrador
│   │   ├── panel-admin.html     # Panel principal de administración
│   │   ├── registrar-producto.html # Crear producto
│   │   ├── actualizar-producto.html # Editar producto
│   │   └── eliminar-producto.html  # Eliminar producto
│   │
│   ├── 📁 comunes/               # Páginas comunes
│   │   └── acerca-de-nosotros.html
│   │
│   └── Login.html                # Página de inicio de sesión
│
├── 📁 js/                        # Lógica JavaScript
│   ├── usuario.js               # Lógica específica de usuario (tienda, carrito, checkout)
│   ├── admin.js                 # Lógica específica de administrador (CRUD)
│   ├── productos.js             # Gestión de productos (localStorage)
│   ├── cart.js                  # Gestión del carrito de compras
│   ├── utils.js                 # Utilidades generales (auth, mensajes, validaciones)
│   ├── login.js                 # Lógica de autenticación
│   ├── registro.js              # Registro de usuarios
│   └── admin-loader.js          # Carga de administradores desde JSON
│
├── 📁 css/                       # Estilos CSS
│   ├── style.css                # Estilos principales
│   ├── explora.css              # Estilos de exploración
│   ├── panel-admin.css          # Estilos del panel admin
│   └── ...                      # Otros archivos CSS
│
├── 📁 data/                      # Datos estáticos
│   └── admins.json              # Lista de administradores
│
└── 📁 img/                       # Imágenes
    └── desconocido.jpg          # Imagen por defecto para productos
```

---

## 🔗 Rutas y Navegación

### **Rutas Principales**

#### Vista de Usuario (Shop)
- **`/Index.html`** → Página principal
- **`/html/usuario/tienda.html`** → Vista de tienda (catálogo de productos)
- **`/html/usuario/carrito.html`** → Carrito de compras
- **`/html/usuario/checkout.html`** → Proceso de compra
- **`/html/usuario/compra-exitosa.html`** → Confirmación de compra
- **`/html/usuario/detalle-producto.html?id=XXX`** → Detalle de producto

#### Vista de Administrador
- **`/html/admin/panel-admin.html`** → Panel de administración
- **`/html/admin/registrar-producto.html`** → Crear producto
- **`/html/admin/actualizar-producto.html?id=XXX`** → Editar producto
- **`/html/admin/eliminar-producto.html?id=XXX`** → Eliminar producto

#### Autenticación
- **`/html/Login.html`** → Inicio de sesión
- **`/html/usuario/registro.html`** → Registro de usuarios

### **Flujo de Navegación**

#### Usuario Normal:
```
Index.html → Login.html → tienda.html → carrito.html → checkout.html → compra-exitosa.html
```

#### Administrador:
```
Index.html → Login.html → panel-admin.html → (registrar/actualizar/eliminar-producto.html)
```

---

##  Archivos JavaScript Principales

### **`js/usuario.js`** - Lógica de Usuario
Contiene todas las funciones relacionadas con la experiencia de compra:

#### Funciones Principales:
- `inicializarVistaUsuario()` - Inicializa la vista de usuario
- `cargarProductosTienda(filtro)` - Carga y muestra productos en la tienda
- `agregarProductoAlCarrito(productoId, cantidad)` - Agrega producto al carrito
- `cargarCarrito()` - Carga y muestra el carrito
- `actualizarCantidadCarrito(productoId, cantidad)` - Actualiza cantidad en carrito
- `eliminarProductoDelCarrito(productoId)` - Elimina producto del carrito
- `irACheckout()` - Redirige al checkout
- `cargarCheckout()` - Carga el formulario de checkout
- `finalizarCompra(event)` - Procesa la compra
- `inicializarFiltrosTienda()` - Inicializa filtros de búsqueda

#### Comentarios Explicativos:
- Cada función tiene comentarios JSDoc explicando su propósito
- Secciones organizadas por funcionalidad (Tienda, Carrito, Checkout)
- Comentarios inline donde es necesario

### **`js/admin.js`** - Lógica de Administrador
Contiene todas las funciones relacionadas con la gestión de productos:

#### Funciones Principales:
- `inicializarVistaAdmin()` - Inicializa la vista de admin (verifica permisos)
- `cargarProductosAdmin()` - Carga productos en el panel de admin
- `actualizarEstadisticasAdmin()` - Actualiza estadísticas del panel
- `inicializarFiltrosAdmin()` - Inicializa filtros de búsqueda en admin
- `inicializarFormularioRegistro()` - Configura formulario de registro
- `inicializarFormularioActualizacion()` - Configura formulario de actualización
- `inicializarEliminacionProducto()` - Configura eliminación de productos

#### Comentarios Explicativos:
- Cada función tiene comentarios JSDoc explicando su propósito
- Secciones organizadas por funcionalidad (Panel, CRUD, Utilidades)
- Comentarios inline donde es necesario

---

##  Almacenamiento de Datos

### **localStorage**
El proyecto utiliza `localStorage` para almacenar datos:

- **`productos`** - Lista de productos
- **`carrito`** - Items del carrito de compras
- **`usuarioActivo`** - Sesión del usuario actual
- **`usuarios`** - Usuarios registrados
- **`compras`** - Historial de compras
- **`productoContadorId`** - Contador de IDs de productos

---

##  Control de Acceso

### **Autenticación**
- Los usuarios deben iniciar sesión para acceder a ciertas funcionalidades
- Los administradores tienen acceso exclusivo al panel de administración
- La función `protegerRutaAdmin()` verifica permisos antes de cargar páginas de admin

### **Redirección según Rol**
- **Usuario normal**: Redirige a `tienda.html` después del login
- **Administrador**: Redirige a `panel-admin.html` después del login

---

## Validaciones

### **Validaciones de Productos**
- Nombre: mínimo 2 caracteres
- Categoría: mínimo 2 caracteres
- Precio: mayor a 0
- Stock: 0 o mayor

### **Validaciones de Carrito**
- Stock disponible antes de agregar al carrito
- Validación de stock antes del checkout
- Validación de campos requeridos en checkout

---

##  Estilos y Diseño

### **CSS Principal**
- `style.css` - Estilos generales y navegación
- `explora.css` - Estilos de la vista de tienda
- `panel-admin.css` - Estilos del panel de administración

### **Diseño Responsive**
- Las vistas están diseñadas para ser responsive
- Se adaptan a diferentes tamaños de pantalla

---

##  Cómo Usar

### **Para Usuarios:**
1. Acceder a la tienda (`tienda.html`)
2. Explorar productos y agregar al carrito
3. Ver el carrito y ajustar cantidades
4. Proceder al checkout
5. Completar la compra

### **Para Administradores:**
1. Iniciar sesión con credenciales de admin
2. Acceder al panel de administración
3. Gestionar productos (crear, editar, eliminar)
4. Ver estadísticas del inventario

---

##  Notas Importantes

### **Rutas Relativas**
- Las rutas están configuradas de forma relativa
- Desde `html/usuario/` usar rutas como `tienda.html`, `carrito.html`
- Desde `html/admin/` usar rutas como `panel-admin.html`
- Para ir a la raíz usar `../../Index.html`

### **Imágenes de Productos**
- Los productos pueden tener una URL de imagen
- Si no se proporciona imagen, se usa `/img/desconocido.jpg` por defecto
- Las imágenes se validan con `onerror` para mostrar la imagen por defecto si fallan

### **Carrito de Compras**
- El carrito se guarda en `localStorage`
- Persiste entre sesiones
- Se actualiza automáticamente cuando se agregan/eliminan productos

---

##  Mantenimiento

### **Agregar Nuevas Funcionalidades**
1. Agregar la lógica en `usuario.js` o `admin.js` según corresponda
2. Actualizar las vistas HTML si es necesario
3. Agregar estilos CSS si es necesario
4. Actualizar esta documentación

### **Modificar Rutas**
1. Actualizar las rutas en los archivos HTML
2. Actualizar las redirecciones en `login.js`
3. Actualizar esta documentación

---

##  Referencias

- **Gestor de Productos**: `js/productos.js`
- **Gestor de Carrito**: `js/cart.js`
- **Utilidades**: `js/utils.js`
- **Autenticación**: `js/login.js`

---

##  Checklist de Funcionalidades

### Vista de Usuario (Shop)
- [x] Mostrar productos con diseño tipo catálogo
- [x] Botón "Agregar al carrito"
- [x] Guardar carrito en localStorage
- [x] Página de carrito con listado de productos
- [x] Mostrar totales en el carrito
- [x] Botón "Finalizar compra"
- [x] Proceso de checkout completo

### Vista de Administrador
- [x] CRUD completo de productos (crear, leer, actualizar, eliminar)
- [x] Datos guardados en localStorage
- [x] Validaciones básicas en formularios
- [x] Navegación entre páginas del panel de admin
- [x] Estadísticas del inventario

### Extras
- [x] Barra de navegación común para ambas vistas
- [x] Control de acceso (login que redirige según tipo de usuario)
- [x] Diseño responsive y limpio
- [x] Comentarios explicativos en el código
- [x] Rutas coherentes entre vistas

---

