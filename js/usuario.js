// ======================= USUARIO.JS =======================
// Lógica específica para la vista de usuario (tienda, carrito, checkout)
// Este archivo contiene todas las funciones relacionadas con la experiencia de compra del usuario

/**
 * ========================================
 * INICIALIZACIÓN DE LA VISTA DE USUARIO
 * ========================================
 * Se ejecuta cuando se carga una página de usuario (tienda, carrito, checkout)
 */
function inicializarVistaUsuario() {
  // Verificar si hay un usuario autenticado
  const usuario = verificarAutenticacion();
  
  // Actualizar la navegación según el estado de autenticación
  if (usuario) {
    actualizarBotonesAuth();
    
    // Solo actualizar contador del carrito si hay sesión activa de USUARIO (NO administrador)
    if (usuario.rol !== 'admin') {
      gestorCarrito.actualizarContadorCarrito();
    } else {
      // Si es administrador, ocultar contador y limpiar carrito
      const contadores = document.querySelectorAll('.contador-carrito');
      contadores.forEach(contador => {
        contador.style.display = 'none';
      });
      gestorCarrito.limpiar();
    }
  } else {
    // Si no hay sesión, ocultar contador del carrito y limpiar carrito
    const contadores = document.querySelectorAll('.contador-carrito');
    contadores.forEach(contador => {
      contador.style.display = 'none';
    });
    // Limpiar carrito si no hay sesión
    gestorCarrito.limpiar();
  }
}

/**
 * ========================================
 * GESTIÓN DE LA VISTA DE TIENDA
 * ========================================
 */

/**
 * Cargar y mostrar productos en la vista de tienda
 * @param {Object} filtro - Objeto con filtros aplicados (texto, categoria, stock)
 * @param {number} pagina - Página actual (para paginación)
 */
function cargarProductosTienda(filtro = {}, pagina = 1) {
  // Obtener todos los productos desde el gestor
  const productos = gestorProductos.obtenerTodos();
  
  // Obtener elementos del DOM
  const grid = document.getElementById('grid-productos');
  const sinResultados = document.getElementById('sin-resultados');
  const contenedorPaginacion = document.getElementById('paginacion-contenedor');
  
  if (!grid) {
    console.error('No se encontró el elemento grid-productos');
    return;
  }

  // Mostrar skeleton loader
  if (typeof mostrarSkeletonLoader === 'function') {
    mostrarSkeletonLoader(grid, 6);
  }

  // Simular delay para mostrar el skeleton (solo si hay muchos productos)
  setTimeout(() => {
    // Actualizar el selector de categorías
    actualizarSelectorCategorias(productos);

    // Aplicar filtros a los productos
    let productosFiltrados = aplicarFiltrosProductos(productos, filtro);

    // Guardar productos filtrados para paginación
    window.productosFiltradosActuales = productosFiltrados;

    // Calcular paginación
    const totalPaginas = calcularTotalPaginas(productosFiltrados.length);
    CONFIG_PAGINACION.paginaActual = pagina;
    CONFIG_PAGINACION.totalPaginas = totalPaginas;

    // Paginar productos
    const productosPagina = paginarProductos(productosFiltrados, pagina);

    // Renderizar los productos de la página actual
    renderizarProductosTienda(productosPagina, grid, sinResultados);

    // Renderizar controles de paginación
    if (contenedorPaginacion && typeof renderizarPaginacion === 'function') {
      renderizarPaginacion(contenedorPaginacion, pagina, totalPaginas, (nuevaPagina) => {
        cargarProductosTienda(filtro, nuevaPagina);
      });
    }
  }, productos.length > 20 ? 300 : 0);
}

/**
 * Actualizar el selector de categorías con las categorías disponibles
 * @param {Array} productos - Array de productos
 */
function actualizarSelectorCategorias(productos) {
  const selectCategoria = document.getElementById('filtro-categoria');
  if (!selectCategoria) return;

  // Obtener categorías únicas y ordenadas
  const categorias = [...new Set(productos.map(p => p.categoria))].filter(Boolean).sort();
  
  // Limpiar opciones existentes (excepto la primera "Todas las categorías")
  const opcionesActuales = selectCategoria.querySelectorAll('option');
  opcionesActuales.forEach((opt, index) => {
    if (index > 0) opt.remove();
  });

  // Agregar categorías al selector
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });
}

/**
 * Aplicar filtros a la lista de productos
 * @param {Array} productos - Array de productos a filtrar
 * @param {Object} filtro - Objeto con los filtros a aplicar
 * @returns {Array} - Array de productos filtrados
 */
function aplicarFiltrosProductos(productos, filtro) {
  let productosFiltrados = productos;

  // Filtro por texto (nombre, categoría o descripción)
  if (filtro.texto) {
    const textoLower = filtro.texto.toLowerCase();
    productosFiltrados = productosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(textoLower) ||
      (p.categoria && p.categoria.toLowerCase().includes(textoLower)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(textoLower))
    );
  }

  // Filtro por categoría
  if (filtro.categoria) {
    productosFiltrados = productosFiltrados.filter(p => p.categoria === filtro.categoria);
  }

  // Filtro por stock
  if (filtro.stock === 'disponible') {
    productosFiltrados = productosFiltrados.filter(p => p.stock > 0);
  } else if (filtro.stock === 'bajo') {
    productosFiltrados = productosFiltrados.filter(p => p.stock < 5 && p.stock > 0);
  }

  return productosFiltrados;
}

/**
 * Renderizar productos en la vista de tienda
 * @param {Array} productos - Array de productos a renderizar
 * @param {HTMLElement} grid - Elemento DOM donde se renderizarán los productos
 * @param {HTMLElement} sinResultados - Elemento DOM para mostrar mensaje sin resultados
 */
function renderizarProductosTienda(productos, grid, sinResultados) {
  // Limpiar el grid
  grid.innerHTML = '';

  // Si no hay productos, mostrar mensaje
  if (!productos || productos.length === 0) {
    if (grid) grid.style.display = 'none';
    if (sinResultados) sinResultados.style.display = 'block';
    return;
  }

  // Mostrar grid y ocultar mensaje de sin resultados
  if (grid) grid.style.display = 'grid';
  if (sinResultados) sinResultados.style.display = 'none';

  // Crear tarjeta para cada producto
  productos.forEach(producto => {
    const card = crearTarjetaProducto(producto);
    grid.appendChild(card);
  });
}

/**
 * Crear una tarjeta HTML para un producto
 * @param {Object} producto - Objeto producto
 * @returns {HTMLElement} - Elemento DOM de la tarjeta
 */
function crearTarjetaProducto(producto) {
  // Obtener información del producto
  const estado = gestorProductos.obtenerEstadoStock(producto.stock);
  const precio = gestorProductos.formatearPrecio(producto.precio);
  const imagen = producto.imagen || '/img/desconocido.jpg';
  
  // Obtener calificación promedio del producto
  const calificacionInfo = gestorOpiniones.obtenerCalificacionPromedioFormateada(producto.id);
  const numeroOpiniones = gestorOpiniones.obtenerNumeroOpiniones(producto.id);
  
  // Si no hay opiniones pero hay calificación inicial, usarla
  let calificacionMostrar = calificacionInfo;
  if (numeroOpiniones === 0 && producto.calificacionInicial) {
    calificacionMostrar = gestorOpiniones.formatearCalificacion(producto.calificacionInicial);
  }
  
  // Descripción corta (máximo 100 caracteres)
  const descripcionCorta = producto.descripcion 
    ? (producto.descripcion.length > 100 ? producto.descripcion.substring(0, 100) + '...' : producto.descripcion)
    : '';

  // Verificar si hay sesión activa y que NO sea administrador para habilitar botón de carrito
  const usuario = verificarAutenticacion();
  const tieneSesion = usuario !== null;
  const esAdministrador = tieneSesion && usuario.rol === 'admin';
  const puedeAgregar = tieneSesion && !esAdministrador && producto.stock > 0;

  // Crear elemento de tarjeta
  const card = document.createElement('div');
  card.className = 'card-producto-tienda';
  
  // Generar HTML de la tarjeta con lazy loading y ARIA labels
  card.innerHTML = `
    <img 
      src="${imagen}" 
      alt="${sanitizarTexto(producto.nombre)} - ${sanitizarTexto(producto.categoria)}" 
      class="card-producto-imagen" 
      loading="lazy"
      onerror="this.src='/img/desconocido.jpg'"
      aria-label="Imagen de ${sanitizarTexto(producto.nombre)}">
    <div class="card-producto-contenido">
      <div class="card-producto-header">
        <span class="badge-estado ${estado.clase}" aria-label="Estado de stock: ${estado.texto}">${estado.texto}</span>
        <span style="color: #718096; font-size: 0.85em;" aria-label="ID del producto">#${producto.id}</span>
      </div>
      <h3 class="card-producto-nombre">${sanitizarTexto(producto.nombre)}</h3>
      <div class="card-producto-categoria" aria-label="Categoría: ${sanitizarTexto(producto.categoria)}">📂 ${sanitizarTexto(producto.categoria)}</div>
      ${descripcionCorta ? `<p class="card-producto-descripcion">${sanitizarTexto(descripcionCorta)}</p>` : ''}
      <div class="card-producto-calificacion" role="img" aria-label="Calificación: ${calificacionMostrar.promedio > 0 ? calificacionMostrar.texto : 'Sin calificaciones'}">
        ${calificacionMostrar.estrellasHTML}
        <span style="margin-left: 5px; font-size: 0.9em; color: #4a5568;">
          ${calificacionMostrar.promedio > 0 ? calificacionMostrar.estrellas : 'Sin calificaciones'}
          ${numeroOpiniones > 0 ? `(${numeroOpiniones} ${numeroOpiniones === 1 ? 'opinión' : 'opiniones'})` : ''}
        </span>
      </div>
      <div class="card-producto-precio" aria-label="Precio: ${precio}">${precio}</div>
      <div class="card-producto-acciones">
        <button 
          class="btn-agregar-carrito ${!puedeAgregar ? 'btn-deshabilitado' : ''}" 
          onclick="${puedeAgregar ? `agregarProductoAlCarrito('${producto.id}')` : `mostrarMensaje('⚠️ Debes iniciar sesión para agregar productos al carrito', 'warning'); setTimeout(() => { window.location.href = '../iniciar-sesion.html'; }, 1500);`}" 
          ${!puedeAgregar ? 'disabled aria-disabled="true"' : ''}
          aria-label="${!tieneSesion ? 'Inicia sesión para agregar al carrito' : esAdministrador ? 'Los administradores no pueden comprar' : producto.stock === 0 ? 'Producto sin stock' : 'Agregar ' + sanitizarTexto(producto.nombre) + ' al carrito'}">
          ${!tieneSesion ? '🔒 Inicia Sesión' : esAdministrador ? '👨‍💼 Solo Gestión' : producto.stock === 0 ? 'Sin Stock' : '🛒 Agregar al Carrito'}
        </button>
        <a 
          href="producto.html?id=${producto.id}" 
          class="btn-ver-detalle"
          aria-label="Ver detalles de ${sanitizarTexto(producto.nombre)}">
          Ver Detalle
        </a>
      </div>
    </div>
  `;

  return card;
}

/**
 * ========================================
 * GESTIÓN DEL CARRITO DE COMPRAS
 * ========================================
 */

/**
 * Agregar un producto al carrito
 * Requiere sesión activa de USUARIO (NO administrador) - redirige al login si no hay sesión
 * Los administradores NO pueden agregar productos al carrito
 * @param {string} productoId - ID del producto a agregar
 * @param {number} cantidad - Cantidad a agregar (por defecto 1)
 */
function agregarProductoAlCarrito(productoId, cantidad = 1) {
  // Verificar autenticación y que NO sea administrador
  const usuario = verificarAutenticacion();
  
  if (!usuario) {
    mostrarMensaje('⚠️ Debes iniciar sesión para agregar productos al carrito', 'warning');
    setTimeout(() => {
      window.location.href = '../iniciar-sesion.html';
    }, 1500);
    return;
  }
  
  // Los administradores NO pueden agregar productos al carrito
  if (usuario.rol === 'admin') {
    mostrarMensaje('⚠️ Los administradores no pueden realizar compras. Solo pueden gestionar productos desde el panel de administración.', 'warning');
    setTimeout(() => {
      window.location.href = '../admin/panel-admin.html';
    }, 2000);
    return;
  }

  try {
    // Intentar agregar el producto al carrito
    gestorCarrito.agregarProducto(productoId, cantidad);
    
    // Obtener información del producto para mensaje mejorado
    const producto = gestorProductos.obtenerPorId(productoId);
    const nombreProducto = producto ? producto.nombre : 'producto';
    
    // Mostrar mensaje de éxito mejorado
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado(`✅ "${nombreProducto}" agregado al carrito exitosamente`, 'success');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje(`✅ Producto agregado al carrito`, 'success');
    }
    
    // Actualizar el contador del carrito en la navegación
    gestorCarrito.actualizarContadorCarrito();
  } catch (error) {
    // Mostrar mensaje de error mejorado con más contexto
    let mensajeError = error.message;
    
    // Mejorar mensajes de error comunes
    if (error.message.includes('stock')) {
      mensajeError = `No hay suficiente stock disponible. ${error.message}`;
    } else if (error.message.includes('no encontrado')) {
      mensajeError = 'El producto no está disponible en este momento. Por favor, intenta más tarde.';
    }
    
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado(`❌ ${mensajeError}`, 'error');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje(`❌ ${mensajeError}`, 'error');
    } else {
      alert(mensajeError);
    }
  }
}

/**
 * Cargar y mostrar el contenido del carrito
 * Requiere sesión activa de USUARIO (NO administrador) - redirige si no hay sesión o es admin
 */
function cargarCarrito() {
  // Verificar autenticación y que NO sea administrador
  if (!protegerRutaUsuario()) {
    return; // La función protegerRutaUsuario ya redirige si no hay sesión o es admin
  }

  const contenidoDiv = document.getElementById('carrito-contenido');
  if (!contenidoDiv) return;

  // Actualizar contador del carrito
  gestorCarrito.actualizarContadorCarrito();

  // Verificar si el carrito está vacío
  if (gestorCarrito.estaVacio()) {
    mostrarCarritoVacio(contenidoDiv);
    return;
  }

  // Obtener items del carrito con información completa
  const items = gestorCarrito.obtenerItemsCompletos();
  const total = gestorCarrito.obtenerTotal();
  const cantidadTotal = gestorCarrito.obtenerCantidadTotal();

  // Renderizar el carrito con items
  renderizarCarrito(items, total, cantidadTotal, contenidoDiv);
}

/**
 * Mostrar mensaje cuando el carrito está vacío
 * @param {HTMLElement} contenedor - Elemento DOM donde se mostrará el mensaje
 */
function mostrarCarritoVacio(contenedor) {
  contenedor.innerHTML = `
    <div class="carrito-vacio">
      <h2>🛒 Tu carrito está vacío</h2>
      <p>Agrega productos desde la tienda para comenzar tu compra</p>
      <a href="tienda.html" class="btn-continuar-comprando">Ir a la Tienda</a>
    </div>
  `;
}

/**
 * Renderizar el contenido del carrito con items y resumen
 * @param {Array} items - Array de items del carrito
 * @param {number} total - Total de la compra
 * @param {number} cantidadTotal - Cantidad total de productos
 * @param {HTMLElement} contenedor - Elemento DOM donde se renderizará
 */
function renderizarCarrito(items, total, cantidadTotal, contenedor) {
  const totalFormateado = gestorProductos.formatearPrecio(total);

  // Generar HTML de los items
  let itemsHTML = '';
  items.forEach(item => {
    const producto = item.producto;
    const imagen = producto.imagen || '/img/desconocido.jpg';
    const precio = gestorProductos.formatearPrecio(producto.precio);
    const subtotal = gestorProductos.formatearPrecio(item.subtotal);

    itemsHTML += `
      <div class="carrito-item" role="listitem" aria-label="Producto: ${sanitizarTexto(producto.nombre)}">
        <img 
          src="${imagen}" 
          alt="${sanitizarTexto(producto.nombre)} - ${sanitizarTexto(producto.categoria)}" 
          class="carrito-item-imagen" 
          loading="lazy"
          onerror="this.src='/img/desconocido.jpg'"
          aria-label="Imagen de ${sanitizarTexto(producto.nombre)}">
        <div class="carrito-item-info">
          <div class="carrito-item-nombre">${sanitizarTexto(producto.nombre)}</div>
          <div class="carrito-item-categoria" aria-label="Categoría: ${sanitizarTexto(producto.categoria)}">📂 ${sanitizarTexto(producto.categoria)}</div>
          <div class="carrito-item-precio" aria-label="Precio unitario: ${precio}">${precio} c/u</div>
          <button 
            class="btn-eliminar" 
            onclick="eliminarProductoDelCarrito('${producto.id}')"
            aria-label="Eliminar ${sanitizarTexto(producto.nombre)} del carrito">
            🗑️ Eliminar
          </button>
        </div>
        <div class="carrito-item-cantidad">
          <div class="cantidad-controls" role="group" aria-label="Controles de cantidad">
            <button 
              class="btn-cantidad" 
              onclick="actualizarCantidadCarrito('${producto.id}', ${item.cantidad - 1})"
              aria-label="Disminuir cantidad"
              ${item.cantidad <= 1 ? 'disabled aria-disabled="true"' : ''}>
              -
            </button>
            <input 
              type="number" 
              class="cantidad-input" 
              value="${item.cantidad}" 
              min="1" 
              max="${producto.stock}" 
              aria-label="Cantidad de ${sanitizarTexto(producto.nombre)}"
              onchange="actualizarCantidadCarrito('${producto.id}', parseInt(this.value))">
            <button 
              class="btn-cantidad" 
              onclick="actualizarCantidadCarrito('${producto.id}', ${item.cantidad + 1})"
              aria-label="Aumentar cantidad"
              ${item.cantidad >= producto.stock ? 'disabled aria-disabled="true"' : ''}>
              +
            </button>
          </div>
          <div class="carrito-item-subtotal" aria-label="Subtotal: ${subtotal}">${subtotal}</div>
        </div>
      </div>
    `;
  });

  // Renderizar el carrito completo
  contenedor.innerHTML = `
    <div class="carrito-content">
      <div class="carrito-items">
        ${itemsHTML}
      </div>
      <div class="carrito-resumen">
        <div class="resumen-titulo">Resumen de Compra</div>
        <div class="resumen-item">
          <span>Productos (${cantidadTotal})</span>
          <span>${totalFormateado}</span>
        </div>
        <div class="resumen-item">
          <span>Envío</span>
          <span>Gratis</span>
        </div>
        <div class="resumen-total">
          <span>Total</span>
          <span>${totalFormateado}</span>
        </div>
        <button class="btn-checkout" onclick="irACheckout()">Finalizar Compra</button>
        <a href="tienda.html" class="btn-continuar-comprando">← Continuar Comprando</a>
      </div>
    </div>
  `;
}

/**
 * Actualizar la cantidad de un producto en el carrito
 * Requiere sesión activa de USUARIO (NO administrador)
 * @param {string} productoId - ID del producto
 * @param {number} cantidad - Nueva cantidad
 */
function actualizarCantidadCarrito(productoId, cantidad) {
  // Verificar autenticación y que NO sea administrador
  if (!protegerRutaUsuario()) {
    return;
  }

  try {
    // Si la cantidad es 0 o menor, eliminar el producto
    if (cantidad <= 0) {
      eliminarProductoDelCarrito(productoId);
      return;
    }

    // Actualizar la cantidad en el carrito
    gestorCarrito.actualizarCantidad(productoId, cantidad);
    
    // Recargar el carrito para mostrar los cambios
    cargarCarrito();
    
    // Mostrar mensaje de éxito mejorado
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado('✅ Cantidad actualizada correctamente', 'success');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje('✅ Cantidad actualizada', 'success');
    }
  } catch (error) {
    // Mostrar mensaje de error
    mostrarMensaje(`❌ ${error.message}`, 'error');
    // Recargar el carrito para mostrar el estado actual
    cargarCarrito();
  }
}

/**
 * Eliminar un producto del carrito
 * Requiere sesión activa de USUARIO (NO administrador)
 * @param {string} productoId - ID del producto a eliminar
 */
function eliminarProductoDelCarrito(productoId) {
  // Verificar autenticación y que NO sea administrador
  if (!protegerRutaUsuario()) {
    return;
  }

  // Confirmar la eliminación
  if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
    // Eliminar el producto
    gestorCarrito.eliminarProducto(productoId);
    
    // Recargar el carrito
    cargarCarrito();
    
    // Mostrar mensaje de éxito mejorado
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado('✅ Producto eliminado del carrito correctamente', 'success');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje('✅ Producto eliminado del carrito', 'success');
    }
  }
}

/**
 * ========================================
 * GESTIÓN DEL CHECKOUT
 * ========================================
 */

/**
 * Ir a la página de checkout
 * Requiere sesión activa de USUARIO (NO administrador) - redirige si no hay sesión o es admin
 */
function irACheckout() {
  // Verificar autenticación y que NO sea administrador
  if (!protegerRutaUsuario()) {
    return; // La función protegerRutaUsuario ya redirige si no hay sesión o es admin
  }

  // Validar stock antes de ir al checkout
  const validacion = gestorCarrito.validarStock();
  
  if (!validacion.valido) {
    // Mostrar errores si hay problemas de stock
    mostrarMensaje(`❌ ${validacion.errores.join('. ')}`, 'error');
    // Recargar el carrito para mostrar el estado actual
    cargarCarrito();
    return;
  }

  // Redirigir a la página de checkout
  window.location.href = 'checkout.html';
}

/**
 * Cargar la vista de checkout
 * Requiere sesión activa de USUARIO (NO administrador) - redirige si no hay sesión o es admin
 */
function cargarCheckout() {
  // Verificar autenticación y que NO sea administrador
  if (!protegerRutaUsuario()) {
    return; // La función protegerRutaUsuario ya redirige si no hay sesión o es admin
  }

  const contenidoDiv = document.getElementById('checkout-contenido');
  if (!contenidoDiv) return;

  // Actualizar contador del carrito
  gestorCarrito.actualizarContadorCarrito();

  // Verificar si el carrito está vacío
  if (gestorCarrito.estaVacio()) {
    mostrarCheckoutVacio(contenidoDiv);
    return;
  }

  // Validar stock
  const validacion = gestorCarrito.validarStock();
  if (!validacion.valido) {
    mostrarCheckoutError(contenidoDiv, validacion.errores);
    return;
  }

  // Obtener items del carrito
  const items = gestorCarrito.obtenerItemsCompletos();
  const total = gestorCarrito.obtenerTotal();
  const cantidadTotal = gestorCarrito.obtenerCantidadTotal();

  // Renderizar el formulario de checkout
  renderizarCheckout(items, total, cantidadTotal, contenidoDiv);
}

/**
 * Mostrar mensaje cuando el carrito está vacío en checkout
 * @param {HTMLElement} contenedor - Elemento DOM donde se mostrará
 */
function mostrarCheckoutVacio(contenedor) {
  contenedor.innerHTML = `
    <div class="checkout-vacio">
      <h2>🛒 Tu carrito está vacío</h2>
      <p>Agrega productos desde la tienda para comenzar tu compra</p>
      <a href="tienda.html" class="btn-volver">Ir a la Tienda</a>
    </div>
  `;
}

/**
 * Mostrar errores de stock en checkout
 * @param {HTMLElement} contenedor - Elemento DOM donde se mostrará
 * @param {Array} errores - Array de mensajes de error
 */
function mostrarCheckoutError(contenedor, errores) {
  contenedor.innerHTML = `
    <div class="checkout-vacio">
      <div class="mensaje-error">
        <h3>❌ Error en el carrito</h3>
        <p>${errores.join('<br>')}</p>
      </div>
      <a href="carrito.html" class="btn-volver">Volver al Carrito</a>
    </div>
  `;
}

/**
 * Renderizar el formulario de checkout
 * @param {Array} items - Array de items del carrito
 * @param {number} total - Total de la compra
 * @param {number} cantidadTotal - Cantidad total de productos
 * @param {HTMLElement} contenedor - Elemento DOM donde se renderizará
 */
function renderizarCheckout(items, total, cantidadTotal, contenedor) {
  const totalFormateado = gestorProductos.formatearPrecio(total);

  // Generar HTML de los items del resumen
  let itemsHTML = '';
  items.forEach(item => {
    const producto = item.producto;
    const imagen = producto.imagen || '/img/desconocido.jpg';
    const precio = gestorProductos.formatearPrecio(producto.precio);
    const subtotal = gestorProductos.formatearPrecio(item.subtotal);

    itemsHTML += `
      <div class="resumen-item">
        <div class="resumen-item-producto">
          <img 
            src="${imagen}" 
            alt="${sanitizarTexto(producto.nombre)}" 
            class="resumen-item-imagen" 
            loading="lazy"
            onerror="this.src='/img/desconocido.jpg'"
            aria-label="Imagen de ${sanitizarTexto(producto.nombre)}">
          <div class="resumen-item-info">
            <div class="resumen-item-nombre">${sanitizarTexto(producto.nombre)}</div>
            <div class="resumen-item-details" aria-label="Cantidad: ${item.cantidad}, precio unitario: ${precio}">${item.cantidad} x ${precio}</div>
          </div>
        </div>
        <div style="font-weight: bold; color: #2d3748;" aria-label="Subtotal: ${subtotal}">${subtotal}</div>
      </div>
    `;
  });

  // Renderizar el formulario completo
  contenedor.innerHTML = `
    <div class="checkout-content">
      <div class="checkout-form">
        <form id="formCheckout" onsubmit="finalizarCompra(event)" aria-label="Formulario de checkout">
          <div class="form-section">
            <h3>📋 Información de Contacto</h3>
            <div class="form-group">
              <label for="nombre">Nombre Completo *</label>
              <input 
                type="text" 
                id="nombre" 
                required 
                aria-required="true"
                aria-describedby="nombre-desc"
                autocomplete="name">
              <small id="nombre-desc" class="sr-only">Ingresa tu nombre completo</small>
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                required 
                aria-required="true"
                aria-describedby="email-desc"
                autocomplete="email">
              <small id="email-desc" class="sr-only">Ingresa tu dirección de correo electrónico</small>
            </div>
            <div class="form-group">
              <label for="telefono">Teléfono *</label>
              <input 
                type="tel" 
                id="telefono" 
                required 
                aria-required="true"
                aria-describedby="telefono-desc"
                autocomplete="tel">
              <small id="telefono-desc" class="sr-only">Ingresa tu número de teléfono</small>
            </div>
          </div>

          <div class="form-section">
            <h3>📍 Dirección de Envío</h3>
            <div class="form-group">
              <label for="direccion">Dirección *</label>
              <input 
                type="text" 
                id="direccion" 
                required 
                aria-required="true"
                aria-describedby="direccion-desc"
                autocomplete="street-address">
              <small id="direccion-desc" class="sr-only">Ingresa tu dirección completa</small>
            </div>
            <div class="form-group">
              <label for="ciudad">Ciudad *</label>
              <input 
                type="text" 
                id="ciudad" 
                required 
                aria-required="true"
                aria-describedby="ciudad-desc"
                autocomplete="address-level2">
              <small id="ciudad-desc" class="sr-only">Ingresa tu ciudad</small>
            </div>
            <div class="form-group">
              <label for="codigo-postal">Código Postal</label>
              <input 
                type="text" 
                id="codigo-postal"
                aria-describedby="codigo-postal-desc"
                autocomplete="postal-code">
              <small id="codigo-postal-desc" class="sr-only">Ingresa tu código postal (opcional)</small>
            </div>
          </div>

          <div class="form-section">
            <h3>💳 Método de Pago</h3>
            <div class="form-group">
              <label for="metodo-pago">Método de Pago *</label>
              <select 
                id="metodo-pago" 
                required 
                aria-required="true"
                aria-describedby="metodo-pago-desc">
                <option value="">Selecciona un método</option>
                <option value="efectivo">Efectivo contra entrega</option>
                <option value="transferencia">Transferencia bancaria</option>
                <option value="tarjeta">Tarjeta de crédito/débito</option>
              </select>
              <small id="metodo-pago-desc" class="sr-only">Selecciona tu método de pago preferido</small>
            </div>
            <div class="form-group">
              <label for="notas">Notas adicionales (opcional)</label>
              <textarea 
                id="notas" 
                placeholder="Instrucciones especiales para la entrega..."
                aria-describedby="notas-desc"></textarea>
              <small id="notas-desc" class="sr-only">Ingresa instrucciones adicionales para la entrega (opcional)</small>
            </div>
          </div>

          <div id="mensaje-formulario" style="display:none; margin-bottom: 20px; padding: 12px; border-radius: 8px;"></div>

          <button type="submit" class="btn-finalizar">✅ Confirmar y Finalizar Compra</button>
        </form>
      </div>

      <div class="checkout-resumen">
        <div class="resumen-titulo">Resumen de Compra</div>
        ${itemsHTML}
        <div class="resumen-item">
          <span>Envío</span>
          <span>Gratis</span>
        </div>
        <div class="resumen-total">
          <span>Total</span>
          <span>${totalFormateado}</span>
        </div>
        <a href="carrito.html" class="btn-volver">← Volver al Carrito</a>
      </div>
    </div>
  `;
}

/**
 * Finalizar la compra (procesar el formulario de checkout)
 * @param {Event} event - Evento del formulario
 */
function finalizarCompra(event) {
  event.preventDefault();

  const mensajeDiv = document.getElementById('mensaje-formulario');
  
  // Validar stock nuevamente antes de procesar
  const validacion = gestorCarrito.validarStock();
  if (!validacion.valido) {
    const mensajeError = validacion.errores.join('. ');
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado(`❌ Error en el carrito: ${mensajeError}`, 'error');
    } else {
      mensajeDiv.textContent = `❌ ${mensajeError}`;
      mensajeDiv.style.display = 'block';
      mensajeDiv.style.backgroundColor = '#fee2e2';
      mensajeDiv.style.color = '#991b1b';
    }
    cargarCheckout();
    return;
  }

  // Obtener datos del formulario
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const direccion = document.getElementById('direccion').value.trim();
  const ciudad = document.getElementById('ciudad').value.trim();
  const codigoPostal = document.getElementById('codigo-postal').value.trim();
  const metodoPago = document.getElementById('metodo-pago').value;
  const notas = document.getElementById('notas').value.trim();

  // Validar campos con validaciones mejoradas
  const errores = [];
  
  // Validar nombre
  if (!nombre) {
    errores.push('El nombre es requerido');
  } else if (nombre.length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  } else if (nombre.length > 100) {
    errores.push('El nombre no puede exceder 100 caracteres');
  }

  // Validar email
  if (typeof validarEmail === 'function') {
    const validacionEmail = validarEmail(email);
    if (!validacionEmail.valido) {
      errores.push(validacionEmail.error);
    }
  } else if (!email) {
    errores.push('El email es requerido');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.push('El formato del email no es válido. Ejemplo: usuario@dominio.com');
  }

  // Validar teléfono
  if (typeof validarTelefono === 'function') {
    const validacionTelefono = validarTelefono(telefono);
    if (!validacionTelefono.valido) {
      errores.push(validacionTelefono.error);
    }
  } else if (!telefono) {
    errores.push('El teléfono es requerido');
  }

  // Validar dirección
  if (!direccion) {
    errores.push('La dirección es requerida');
  } else if (direccion.length < 5) {
    errores.push('La dirección debe tener al menos 5 caracteres');
  } else if (direccion.length > 200) {
    errores.push('La dirección no puede exceder 200 caracteres');
  }

  // Validar ciudad
  if (!ciudad) {
    errores.push('La ciudad es requerida');
  } else if (ciudad.length < 2) {
    errores.push('La ciudad debe tener al menos 2 caracteres');
  } else if (ciudad.length > 100) {
    errores.push('La ciudad no puede exceder 100 caracteres');
  }

  // Validar método de pago
  if (!metodoPago) {
    errores.push('Debes seleccionar un método de pago');
  }

  // Validar notas (opcional pero con límite)
  if (notas && notas.length > 500) {
    errores.push('Las notas no pueden exceder 500 caracteres');
  }

  // Mostrar errores si hay
  if (errores.length > 0) {
    const mensajeError = errores.join('. ');
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado(`❌ Por favor, corrige los siguientes errores: ${mensajeError}`, 'error');
    } else {
      mensajeDiv.textContent = `❌ ${mensajeError}`;
      mensajeDiv.style.display = 'block';
      mensajeDiv.style.backgroundColor = '#fee2e2';
      mensajeDiv.style.color = '#991b1b';
    }
    return;
  }

  // Crear objeto de datos de compra
  const datosCompra = {
    nombre: nombre,
    email: email,
    telefono: telefono,
    direccion: direccion,
    ciudad: ciudad,
    codigoPostal: codigoPostal,
    metodoPago: metodoPago,
    notas: notas,
    items: gestorCarrito.obtenerItemsCompletos(),
    total: gestorCarrito.obtenerTotal(),
    fecha: new Date().toISOString()
  };

  try {
    // Guardar compra en localStorage (historial)
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    compras.push(datosCompra);
    localStorage.setItem('compras', JSON.stringify(compras));

    // Actualizar stock de productos
    datosCompra.items.forEach(item => {
      // Los items del carrito tienen la propiedad producto.id (viene de obtenerItemsCompletos)
      if (item.producto && item.producto.id) {
        const producto = gestorProductos.obtenerPorId(item.producto.id);
        if (producto) {
          gestorProductos.actualizar(producto.id, {
            stock: producto.stock - item.cantidad
          });
        }
      }
    });

    // Limpiar carrito
    gestorCarrito.limpiar();

    // Mostrar mensaje de procesamiento
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado('✅ ¡Compra realizada exitosamente! Enviando confirmación por correo...', 'success');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje('✅ ¡Compra realizada exitosamente!', 'success');
    }

    // Enviar correo de confirmación
    if (typeof enviarEmailConfirmacion === 'function') {
      enviarEmailConfirmacion(datosCompra)
        .then(resultado => {
          if (resultado.exito) {
            console.log('✅ Correo enviado:', resultado.mensaje);
            // Guardar estado del correo en sessionStorage para mostrarlo en la página de confirmación
            sessionStorage.setItem('emailEnviado', 'true');
            sessionStorage.setItem('emailMensaje', resultado.mensaje);
            if (resultado.simulacion) {
              sessionStorage.setItem('emailSimulado', 'true');
            }
          } else {
            console.warn('⚠️ No se pudo enviar el correo:', resultado.mensaje);
            // Guardar el error pero no bloquear la compra
            sessionStorage.setItem('emailEnviado', 'false');
            sessionStorage.setItem('emailError', resultado.mensaje);
          }
          
          // Redirigir a página de confirmación después de intentar enviar el correo
          setTimeout(() => {
            window.location.href = 'compra-exitosa.html';
          }, 1000);
        })
        .catch(error => {
          console.error('Error al enviar correo:', error);
          // Aún así redirigir a la página de confirmación
          sessionStorage.setItem('emailEnviado', 'false');
          sessionStorage.setItem('emailError', 'Error al enviar correo de confirmación');
          setTimeout(() => {
            window.location.href = 'compra-exitosa.html';
          }, 1000);
        });
    } else {
      // Si no está disponible la función de email, redirigir directamente
      setTimeout(() => {
        window.location.href = 'compra-exitosa.html';
      }, 1500);
    }
  } catch (error) {
    let mensajeError = `Error al procesar la compra: ${error.message}`;
    if (error.message.includes('Espacio')) {
      mensajeError = 'No hay suficiente espacio de almacenamiento. Por favor, libera espacio y intenta nuevamente.';
    } else if (error.message.includes('stock')) {
      mensajeError = 'Uno o más productos no tienen suficiente stock. Por favor, revisa tu carrito.';
    }
    
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado(`❌ ${mensajeError}`, 'error');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje(`❌ ${mensajeError}`, 'error');
    } else {
      if (mensajeDiv) {
        mensajeDiv.textContent = `❌ ${mensajeError}`;
        mensajeDiv.style.display = 'block';
        mensajeDiv.style.backgroundColor = '#fee2e2';
        mensajeDiv.style.color = '#991b1b';
      }
    }
  }
}

/**
 * ========================================
 * INICIALIZACIÓN DE FILTROS
 * ========================================
 */

/**
 * Inicializar los filtros de búsqueda en la vista de tienda
 */
function inicializarFiltrosTienda() {
  const inputBusqueda = document.getElementById('busqueda-texto');
  const selectCategoria = document.getElementById('filtro-categoria');
  const selectStock = document.getElementById('filtro-stock');

  if (!inputBusqueda || !selectCategoria || !selectStock) return;

  /**
   * Aplicar filtros cuando cambian los valores
   */
  function aplicarFiltros() {
    const filtro = {
      texto: inputBusqueda.value.trim(),
      categoria: selectCategoria.value,
      stock: selectStock.value
    };
    // Resetear a página 1 cuando se aplican filtros
    cargarProductosTienda(filtro, 1);
  }

  // Agregar event listeners con debounce para búsqueda
  if (typeof debounce === 'function') {
    const busquedaDebounced = debounce(() => {
      aplicarFiltros();
    }, 300);
    inputBusqueda.addEventListener('input', busquedaDebounced);
  } else {
    inputBusqueda.addEventListener('input', aplicarFiltros);
  }
  
  selectCategoria.addEventListener('change', aplicarFiltros);
  selectStock.addEventListener('change', aplicarFiltros);
}

/**
 * ========================================
 * GESTIÓN DE DETALLE DE PRODUCTO Y OPINIONES
 * ========================================
 */

/**
 * Cargar y mostrar el detalle de un producto con opiniones
 * NO requiere sesión - las opiniones son públicas y accesibles para todos
 */
function cargarDetalleProducto() {
  // Obtener ID del producto desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idProducto = urlParams.get('id');
  const contenidoDiv = document.getElementById('detalle-contenido') || document.getElementById('producto-contenido');

  if (!idProducto || !contenidoDiv) {
    if (contenidoDiv) {
      contenidoDiv.innerHTML = `
        <div class="producto-no-encontrado">
          <h2>❌ ID de producto no especificado</h2>
          <p>Por favor, selecciona un producto desde la tienda.</p>
          <a href="tienda.html" class="boton-volver">Volver a la Tienda</a>
        </div>
      `;
    }
    return;
  }

  // Obtener el producto
  const producto = gestorProductos.obtenerPorId(idProducto);

  if (!producto) {
    contenidoDiv.innerHTML = `
      <div class="producto-no-encontrado">
        <h2>🔍 Producto no encontrado</h2>
        <p>El producto que buscas no existe o ha sido eliminado.</p>
        <a href="tienda.html" class="boton-volver">Volver a la Tienda</a>
      </div>
    `;
    return;
  }

  // Renderizar el detalle del producto (incluye opiniones que se cargan desde localStorage)
  renderizarDetalleProducto(producto, contenidoDiv);
}

/**
 * Renderizar el detalle completo de un producto con opiniones
 * @param {Object} producto - Objeto producto
 * @param {HTMLElement} contenedor - Elemento DOM donde se renderizará
 */
function renderizarDetalleProducto(producto, contenedor) {
  // Obtener información del producto
  const precio = gestorProductos.formatearPrecio(producto.precio);
  const imagen = producto.imagen || '/img/desconocido.jpg';
  
  // Obtener calificación promedio y opiniones
  const calificacionInfo = gestorOpiniones.obtenerCalificacionPromedioFormateada(producto.id);
  const numeroOpiniones = gestorOpiniones.obtenerNumeroOpiniones(producto.id);
  const opiniones = gestorOpiniones.obtenerOpiniones(producto.id);
  
  // Si no hay opiniones pero hay calificación inicial, usarla
  let calificacionMostrar = calificacionInfo;
  if (numeroOpiniones === 0 && producto.calificacionInicial) {
    calificacionMostrar = gestorOpiniones.formatearCalificacion(producto.calificacionInicial);
  }

  // Verificar si hay sesión activa y que NO sea administrador para el botón de agregar al carrito
  const usuario = verificarAutenticacion();
  const tieneSesion = usuario !== null;
  const esAdministrador = tieneSesion && usuario.rol === 'admin';
  const puedeAgregar = tieneSesion && !esAdministrador && producto.stock > 0;

  // Generar HTML del botón según el estado de sesión y rol
  let botonAgregarHTML = '';
  if (!tieneSesion) {
    botonAgregarHTML = `
      <button 
        class="boton-agregar-carrito btn-deshabilitado" 
        onclick="mostrarMensaje('⚠️ Debes iniciar sesión para agregar productos al carrito', 'warning'); setTimeout(() => { window.location.href = '../iniciar-sesion.html'; }, 1500);"
        disabled
        aria-disabled="true"
        aria-label="Inicia sesión para agregar al carrito">
        🔒 Inicia Sesión para Comprar
      </button>
    `;
  } else if (esAdministrador) {
    botonAgregarHTML = `
      <button 
        class="boton-agregar-carrito btn-deshabilitado" 
        disabled
        aria-disabled="true"
        aria-label="Los administradores no pueden realizar compras">
        👨‍💼 Solo Gestión de Productos
      </button>
    `;
  } else if (producto.stock === 0) {
    botonAgregarHTML = `
      <button 
        class="boton-agregar-carrito" 
        disabled
        aria-disabled="true"
        aria-label="Producto sin stock">
        Sin Stock
      </button>
    `;
  } else {
    botonAgregarHTML = `
      <button 
        class="boton-agregar-carrito" 
        onclick="agregarProductoAlCarrito('${producto.id}')" 
        aria-label="Agregar ${sanitizarTexto(producto.nombre)} al carrito">
        🛒 Agregar al Carrito
      </button>
    `;
  }

  // Renderizar el HTML del detalle
  contenedor.innerHTML = `
    <div class="detalle-producto">
      <div class="detalle-header">
        <img 
          src="${imagen}" 
          alt="${sanitizarTexto(producto.nombre)} - ${sanitizarTexto(producto.categoria)}" 
          class="detalle-imagen" 
          loading="lazy"
          onerror="this.src='/img/desconocido.jpg'"
          aria-label="Imagen de ${sanitizarTexto(producto.nombre)}">
        <div class="detalle-info">
          <h1>${sanitizarTexto(producto.nombre)}</h1>
          <div class="categoria" aria-label="Categoría: ${sanitizarTexto(producto.categoria)}">📂 ${sanitizarTexto(producto.categoria)}</div>
          <div class="detalle-calificacion" role="img" aria-label="Calificación: ${calificacionMostrar.promedio > 0 ? calificacionMostrar.texto : 'Sin calificaciones'}">
            ${calificacionMostrar.estrellasHTML}
            <span style="margin-left: 10px; font-size: 1.1em; color: #4a5568;">
              ${calificacionMostrar.promedio > 0 ? calificacionMostrar.texto : 'Sin calificaciones'}
              ${numeroOpiniones > 0 ? `(${numeroOpiniones} ${numeroOpiniones === 1 ? 'opinión' : 'opiniones'})` : ''}
            </span>
          </div>
          <div class="precio" aria-label="Precio: ${precio}">${precio}</div>
          ${producto.descripcion ? `<div class="detalle-descripcion"><strong>Descripción:</strong><br>${sanitizarTexto(producto.descripcion)}</div>` : ''}
          <div class="botones-accion">
            ${botonAgregarHTML}
            <a href="tienda.html" class="boton-volver" aria-label="Volver a la tienda">← Volver a la Tienda</a>
          </div>
        </div>
      </div>

      <!-- Sección de Opiniones -->
      <div class="seccion-opiniones" role="region" aria-label="Opiniones de usuarios">
        <h2>💬 Opiniones de Usuarios</h2>
        
        <!-- Lista de opiniones -->
        <div class="opiniones-lista" id="opiniones-lista" role="list" aria-label="Lista de opiniones">
          ${renderizarOpiniones(opiniones)}
        </div>

        <!-- Formulario para agregar opinión -->
        <div class="formulario-opinion" role="region" aria-label="Formulario para agregar opinión">
          <h3>Deja tu opinión</h3>
          <form id="form-opinion" onsubmit="agregarOpinionProducto(event, '${producto.id}')" aria-label="Formulario de opinión">
            <div class="form-group">
              <label for="nombre-usuario-opinion">Tu nombre *</label>
              <input 
                type="text" 
                id="nombre-usuario-opinion" 
                required 
                placeholder="Ej: Juan Pérez"
                aria-required="true"
                aria-describedby="nombre-usuario-opinion-desc">
              <small id="nombre-usuario-opinion-desc" class="sr-only">Ingresa tu nombre completo</small>
            </div>
            <div class="form-group">
              <label for="calificacion-opinion">Calificación *</label>
              <div class="selector-estrellas" id="selector-estrellas" role="radiogroup" aria-label="Selecciona una calificación de 1 a 5 estrellas" aria-required="true">
                <span class="estrella" data-rating="1" role="radio" aria-label="1 estrella" aria-checked="false" tabindex="0" style="cursor: pointer; font-size: 2em; color: #e5e7eb; margin-right: 5px; outline: none;">☆</span>
                <span class="estrella" data-rating="2" role="radio" aria-label="2 estrellas" aria-checked="false" tabindex="-1" style="cursor: pointer; font-size: 2em; color: #e5e7eb; margin-right: 5px; outline: none;">☆</span>
                <span class="estrella" data-rating="3" role="radio" aria-label="3 estrellas" aria-checked="false" tabindex="-1" style="cursor: pointer; font-size: 2em; color: #e5e7eb; margin-right: 5px; outline: none;">☆</span>
                <span class="estrella" data-rating="4" role="radio" aria-label="4 estrellas" aria-checked="false" tabindex="-1" style="cursor: pointer; font-size: 2em; color: #e5e7eb; margin-right: 5px; outline: none;">☆</span>
                <span class="estrella" data-rating="5" role="radio" aria-label="5 estrellas" aria-checked="false" tabindex="-1" style="cursor: pointer; font-size: 2em; color: #e5e7eb; margin-right: 5px; outline: none;">☆</span>
              </div>
              <input type="hidden" id="calificacion-opinion" required aria-required="true">
              <span id="calificacion-texto" style="margin-left: 10px; color: #4a5568; font-weight: bold;" aria-live="polite"></span>
            </div>
            <div class="form-group">
              <label for="comentario-opinion">Tu comentario *</label>
              <textarea 
                id="comentario-opinion" 
                rows="4" 
                required 
                placeholder="Comparte tu experiencia con este producto..."
                aria-required="true"
                aria-describedby="comentario-opinion-desc"></textarea>
              <small id="comentario-opinion-desc" class="sr-only">Escribe tu comentario sobre el producto</small>
            </div>
            <button type="submit" class="btn-enviar-opinion" aria-label="Enviar opinión">Enviar Opinión</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // Inicializar selector de estrellas
  inicializarSelectorEstrellas();
}

/**
 * Renderizar lista de opiniones
 * Las opiniones se cargan desde localStorage y son públicas (no requieren sesión)
 * @param {Array} opiniones - Array de opiniones
 * @returns {string} - HTML de las opiniones
 */
function renderizarOpiniones(opiniones) {
  if (!opiniones || opiniones.length === 0) {
    return '<p style="color: #718096; text-align: center; padding: 20px;">No hay opiniones aún. ¡Sé el primero en opinar!</p>';
  }

  // Las opiniones ya vienen ordenadas desde obtenerOpiniones, pero por si acaso las ordenamos
  const opinionesOrdenadas = [...opiniones].sort((a, b) => {
    const fechaA = new Date(a.fecha || a.fechaCreacion || 0);
    const fechaB = new Date(b.fecha || b.fechaCreacion || 0);
    return fechaB - fechaA; // Más recientes primero
  });

  return opinionesOrdenadas.map(opinion => {
    // Formatear fecha (usar fechaFormateada si existe, sino formatear)
    let fecha = '';
    if (opinion.fechaFormateada) {
      fecha = opinion.fechaFormateada;
    } else if (opinion.fecha) {
      fecha = new Date(opinion.fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      fecha = 'Fecha no disponible';
    }

    const estrellasHTML = gestorOpiniones.formatearCalificacion(opinion.calificacion).estrellasHTML;
    const nombreUsuario = sanitizarTexto(opinion.nombreUsuario || 'Usuario anónimo');
    const comentario = sanitizarTexto(opinion.comentario || '');

    return `
      <div class="opinion-item" role="listitem" aria-label="Opinión de ${nombreUsuario}">
        <div class="opinion-header">
          <div class="opinion-usuario">
            <strong>${nombreUsuario}</strong>
            <span class="opinion-fecha" aria-label="Fecha de la opinión: ${fecha}">${fecha}</span>
          </div>
          <div class="opinion-estrellas" role="img" aria-label="Calificación: ${opinion.calificacion} de 5 estrellas">
            ${estrellasHTML}
          </div>
        </div>
        <div class="opinion-comentario">
          ${comentario}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Inicializar selector de estrellas para calificación
 */
function inicializarSelectorEstrellas() {
  const estrellas = document.querySelectorAll('.selector-estrellas .estrella');
  const inputCalificacion = document.getElementById('calificacion-opinion');
  const textoCalificacion = document.getElementById('calificacion-texto');

  if (!estrellas.length || !inputCalificacion) return;

  let calificacionSeleccionada = 0;

  estrellas.forEach((estrella, index) => {
    // Evento hover
    estrella.addEventListener('mouseenter', () => {
      actualizarEstrellasHover(index + 1);
    });

    // Evento click
    estrella.addEventListener('click', () => {
      seleccionarCalificacion(index + 1);
    });

    // Navegación por teclado
    estrella.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        seleccionarCalificacion(index + 1);
      } else if (e.key === 'ArrowRight' && index < estrellas.length - 1) {
        e.preventDefault();
        estrellas[index + 1].focus();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        estrellas[index - 1].focus();
      }
    });

    // Focus
    estrella.addEventListener('focus', () => {
      actualizarEstrellasHover(index + 1);
    });
  });

  // Reset al salir del área
  const selectorEstrellas = document.querySelector('.selector-estrellas');
  if (selectorEstrellas) {
    selectorEstrellas.addEventListener('mouseleave', () => {
      if (calificacionSeleccionada === 0) {
        actualizarEstrellasHover(0);
      } else {
        actualizarEstrellasSeleccionadas(calificacionSeleccionada);
      }
    });
  }

  function seleccionarCalificacion(rating) {
    calificacionSeleccionada = rating;
    inputCalificacion.value = calificacionSeleccionada;
    actualizarEstrellasSeleccionadas(calificacionSeleccionada);
    
    // Actualizar aria-checked en todas las estrellas
    estrellas.forEach((estrella, index) => {
      estrella.setAttribute('aria-checked', index < rating ? 'true' : 'false');
    });
    
    if (textoCalificacion) {
      textoCalificacion.textContent = `${calificacionSeleccionada} de 5 estrellas`;
    }
  }

  function actualizarEstrellasHover(rating) {
    estrellas.forEach((estrella, index) => {
      if (index < rating) {
        estrella.textContent = '⭐';
        estrella.style.color = '#fbbf24';
      } else {
        estrella.textContent = '☆';
        estrella.style.color = '#e5e7eb';
      }
    });
  }

  function actualizarEstrellasSeleccionadas(rating) {
    estrellas.forEach((estrella, index) => {
      if (index < rating) {
        estrella.textContent = '⭐';
        estrella.style.color = '#fbbf24';
        estrella.setAttribute('aria-checked', 'true');
      } else {
        estrella.textContent = '☆';
        estrella.style.color = '#e5e7eb';
        estrella.setAttribute('aria-checked', 'false');
      }
    });
  }
}

/**
 * Agregar una opinión a un producto
 * NO requiere sesión activa - las opiniones son públicas y se guardan permanentemente
 * @param {Event} event - Evento del formulario
 * @param {string} productoId - ID del producto
 */
function agregarOpinionProducto(event, productoId) {
  event.preventDefault();

  const nombreUsuario = document.getElementById('nombre-usuario-opinion');
  const calificacion = document.getElementById('calificacion-opinion');
  const comentario = document.getElementById('comentario-opinion');

  if (!nombreUsuario || !calificacion || !comentario) {
    mostrarMensaje('❌ Error: No se encontraron los campos del formulario', 'error');
    return;
  }

  const nombreUsuarioValue = nombreUsuario.value.trim();
  const calificacionValue = calificacion.value;
  const comentarioValue = comentario.value.trim();

  // Validar campos
  if (!nombreUsuarioValue || !calificacionValue || !comentarioValue) {
    mostrarMensaje('❌ Por favor, completa todos los campos requeridos', 'error');
    return;
  }

  // Validar longitud del nombre
  if (nombreUsuarioValue.length < 2) {
    mostrarMensaje('❌ El nombre debe tener al menos 2 caracteres', 'error');
    return;
  }

  if (nombreUsuarioValue.length > 100) {
    mostrarMensaje('❌ El nombre no puede exceder 100 caracteres', 'error');
    return;
  }

  // Validar longitud del comentario
  if (comentarioValue.length < 5) {
    mostrarMensaje('❌ El comentario debe tener al menos 5 caracteres', 'error');
    return;
  }

  if (comentarioValue.length > 1000) {
    mostrarMensaje('❌ El comentario no puede exceder 1000 caracteres', 'error');
    return;
  }

  // Validar calificación
  const calificacionNum = parseInt(calificacionValue);
  if (isNaN(calificacionNum) || calificacionNum < 1 || calificacionNum > 5) {
    mostrarMensaje('❌ La calificación debe estar entre 1 y 5 estrellas', 'error');
    return;
  }

  try {
    // Agregar la opinión (se guarda permanentemente en localStorage)
    const nuevaOpinion = gestorOpiniones.agregarOpinion(productoId, {
      nombreUsuario: nombreUsuarioValue,
      calificacion: calificacionValue,
      comentario: comentarioValue
    });

    // Mostrar mensaje de éxito mejorado
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado('✅ Tu opinión ha sido guardada exitosamente y será visible para todos los usuarios', 'success');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje('✅ Tu opinión ha sido agregada exitosamente', 'success');
    }

    // Limpiar formulario
    document.getElementById('form-opinion').reset();
    const textoCalificacion = document.getElementById('calificacion-texto');
    if (textoCalificacion) {
      textoCalificacion.textContent = '';
    }

    // Resetear estrellas visualmente
    const estrellas = document.querySelectorAll('.selector-estrellas .estrella');
    estrellas.forEach(estrella => {
      estrella.textContent = '☆';
      estrella.style.color = '#e5e7eb';
      estrella.setAttribute('aria-checked', 'false');
    });

    // Recargar el detalle del producto para mostrar la nueva opinión
    setTimeout(() => {
      cargarDetalleProducto();
      
      // Scroll suave a la sección de opiniones para que el usuario vea su opinión
      const seccionOpiniones = document.querySelector('.seccion-opiniones');
      if (seccionOpiniones) {
        seccionOpiniones.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  } catch (error) {
    console.error('Error al agregar opinión:', error);
    const mensajeError = error.message || 'Error desconocido al guardar la opinión';
    
    if (typeof mostrarMensajeMejorado === 'function') {
      mostrarMensajeMejorado(`❌ ${mensajeError}`, 'error');
    } else if (typeof mostrarMensaje === 'function') {
      mostrarMensaje(`❌ ${mensajeError}`, 'error');
    } else {
      alert(`Error: ${mensajeError}`);
    }
  }
}

