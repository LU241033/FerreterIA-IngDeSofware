// ======================= ADMIN.JS =======================
// Lógica específica para la vista de administrador (CRUD de productos)
// Este archivo contiene todas las funciones relacionadas con la gestión de productos por parte del administrador

/**
 * ========================================
 * INICIALIZACIÓN DE LA VISTA DE ADMIN
 * ========================================
 * Se ejecuta cuando se carga una página de administrador
 */
function inicializarVistaAdmin() {
  // Verificar que el usuario sea administrador
  if (!protegerRutaAdmin()) {
    return; // Si no es admin, la función protegerRutaAdmin() ya redirige
  }

  // Actualizar la navegación
  actualizarBotonesAuth();
  
  // Ocultar enlaces al carrito en las vistas de administrador
  // Los administradores no pueden realizar compras, solo gestionar productos
  ocultarEnlacesCarritoAdmin();
}

/**
 * Ocultar enlaces al carrito en las vistas de administrador
 * Los administradores no pueden acceder al carrito ni realizar compras
 */
function ocultarEnlacesCarritoAdmin() {
  // Buscar todos los enlaces que contengan "carrito" en el href
  const enlacesCarrito = document.querySelectorAll('a[href*="carrito"], a[href*="Carrito"]');
  
  enlacesCarrito.forEach(enlace => {
    // Ocultar el elemento <li> padre si existe (para mantener la estructura de la lista)
    const liPadre = enlace.closest('li');
    if (liPadre) {
      liPadre.style.display = 'none';
    } else {
      // Si no hay <li> padre, ocultar directamente el enlace
      enlace.style.display = 'none';
    }
  });
  
  // También ocultar cualquier contador de carrito visible
  const contadoresCarrito = document.querySelectorAll('.contador-carrito');
  contadoresCarrito.forEach(contador => {
    contador.style.display = 'none';
  });
}

/**
 * ========================================
 * GESTIÓN DEL PANEL DE ADMINISTRACIÓN
 * ========================================
 */

/**
 * Cargar y mostrar productos en el panel de administración
 */
function cargarProductosAdmin() {
  // Obtener todos los productos
  const productos = gestorProductos.obtenerTodos();
  
  // Obtener el elemento tbody de la tabla
  const tbody = document.querySelector('.tabla-productos tbody');
  
  if (!tbody) {
    console.error('No se encontró el elemento tbody de la tabla');
    return;
  }

  // Actualizar estadísticas
  actualizarEstadisticasAdmin();

  // Limpiar la tabla
  tbody.innerHTML = '';

  // Si no hay productos, mostrar mensaje
  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
          No hay productos registrados. <a href="registrar-producto.html">Registra el primero aquí</a>
        </td>
      </tr>
    `;
    return;
  }

  // Renderizar cada producto en la tabla
  productos.forEach(producto => {
    const fila = crearFilaProductoAdmin(producto);
    tbody.appendChild(fila);
  });

  // Actualizar selector de categorías en los filtros
  actualizarSelectorCategoriasAdmin(productos);
}

/**
 * Actualizar las estadísticas en el panel de administración
 */
function actualizarEstadisticasAdmin() {
  // Obtener estadísticas del gestor de productos
  const stats = gestorProductos.obtenerEstadisticas();
  
  // Obtener elementos del DOM
  const tarjetasEstadisticas = document.querySelectorAll('.estadisticas .tarjeta-estadistica');
  
  if (tarjetasEstadisticas.length < 4) {
    console.error('No se encontraron las tarjetas de estadísticas');
    return;
  }

  // Actualizar cada estadística
  tarjetasEstadisticas[0].querySelector('.valor').textContent = stats.total;
  tarjetasEstadisticas[1].querySelector('.valor').textContent = stats.stockBajo;
  tarjetasEstadisticas[2].querySelector('.valor').textContent = stats.categorias;
  
  // Formatear el valor del inventario
  const valorInventario = `$${(stats.valorInventario / 1000000).toFixed(1)}M`;
  tarjetasEstadisticas[3].querySelector('.valor').textContent = valorInventario;
}

/**
 * Crear una fila HTML para un producto en la tabla de administración
 * @param {Object} producto - Objeto producto
 * @returns {HTMLElement} - Elemento DOM de la fila (tr)
 */
function crearFilaProductoAdmin(producto) {
  // Obtener información del producto
  const estadoStock = gestorProductos.obtenerEstadoStock(producto.stock);
  const precioFormateado = gestorProductos.formatearPrecio(producto.precio);
  
  // Crear elemento de fila
  const fila = document.createElement('tr');
  
  // Generar HTML de la fila
  fila.innerHTML = `
    <td>#${producto.id}</td>
    <td>${sanitizarTexto(producto.nombre)}</td>
    <td>${sanitizarTexto(producto.categoria)}</td>
    <td>${precioFormateado}</td>
    <td>${producto.stock}</td>
    <td><span class="estado-stock ${estadoStock.clase}">${estadoStock.texto}</span></td>
    <td class="acciones-tabla">
      <a href="actualizar-producto.html?id=${producto.id}" class="boton-accion-tabla boton-actualizar">Actualizar</a>
      <a href="eliminar-producto.html?id=${producto.id}" class="boton-accion-tabla boton-eliminar">Eliminar</a>
    </td>
  `;

  return fila;
}

/**
 * Actualizar el selector de categorías en los filtros del panel de admin
 * @param {Array} productos - Array de productos
 */
function actualizarSelectorCategoriasAdmin(productos) {
  const selectCategoria = document.querySelector('.busqueda-filtros select');
  if (!selectCategoria) return;

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map(p => p.categoria))].filter(Boolean);
  
  // Limpiar opciones existentes (excepto "Todas las categorías")
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
 * ========================================
 * FILTROS Y BÚSQUEDA EN EL PANEL DE ADMIN
 * ========================================
 */

/**
 * Inicializar los filtros de búsqueda en el panel de administración
 */
function inicializarFiltrosAdmin() {
  const inputBusqueda = document.querySelector('.grupo-busqueda input');
  const selectCategoria = document.querySelector('.busqueda-filtros select');
  const tbody = document.querySelector('.tabla-productos tbody');

  if (!inputBusqueda || !selectCategoria || !tbody) return;

  /**
   * Filtrar la tabla según los criterios de búsqueda
   */
  function filtrarTabla() {
    const texto = inputBusqueda.value.toLowerCase();
    const categoria = selectCategoria.value.toLowerCase();
    const filas = tbody.querySelectorAll('tr');

    filas.forEach(fila => {
      // Saltar la fila de "sin productos"
      if (fila.querySelector('td[colspan]')) return;
      
      // Obtener el texto de la fila y la categoría
      const textoFila = fila.textContent.toLowerCase();
      const categoriaFila = fila.cells[2].textContent.toLowerCase();

      // Verificar si coincide con los filtros
      const coincideBusqueda = !texto || textoFila.includes(texto);
      const coincideCategoria = categoria === 'todas las categorías' || categoriaFila.includes(categoria);

      // Mostrar u ocultar la fila según los filtros
      fila.style.display = (coincideBusqueda && coincideCategoria) ? '' : 'none';
    });
  }

  // Agregar event listeners
  inputBusqueda.addEventListener('input', filtrarTabla);
  selectCategoria.addEventListener('change', filtrarTabla);
}

/**
 * ========================================
 * REGISTRO DE PRODUCTOS
 * ========================================
 */

/**
 * Inicializar el formulario de registro de productos
 */
function inicializarFormularioRegistro() {
  const form = document.getElementById('formRegistrarProducto');
  const mensajeDiv = document.getElementById('mensaje-formulario');

  if (!form || !mensajeDiv) return;

  /**
   * Manejar el envío del formulario
   */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtener datos del formulario
        const datos = {
          nombre: document.getElementById('nombre').value.trim(),
          categoria: document.getElementById('categoria').value.trim(),
          precio: document.getElementById('precio').value,
          stock: document.getElementById('stock').value,
          imagen: document.getElementById('imagen') ? document.getElementById('imagen').value.trim() : '',
          descripcion: document.getElementById('descripcion') ? document.getElementById('descripcion').value.trim() : '',
          calificacionInicial: document.getElementById('calificacion-inicial') && document.getElementById('calificacion-inicial').value
            ? parseFloat(document.getElementById('calificacion-inicial').value)
            : null
        };
        
        // Validar calificación inicial si se proporciona
        if (datos.calificacionInicial !== null) {
          if (datos.calificacionInicial < 1 || datos.calificacionInicial > 5) {
            mostrarMensajeEnFormulario('La calificación inicial debe estar entre 1 y 5', 'error', mensajeDiv);
            return;
          }
        }

    // Validar datos
    const validacion = validarProducto(datos);
    if (!validacion.valido) {
      mostrarMensajeEnFormulario(validacion.errores.join(', '), 'error', mensajeDiv);
      return;
    }

        try {
          // Crear el producto
          const nuevoProducto = gestorProductos.crear(datos);
          
          // Si se proporcionó una calificación inicial, crear una opinión automática
          if (datos.calificacionInicial && datos.calificacionInicial >= 1 && datos.calificacionInicial <= 5) {
            try {
              gestorOpiniones.agregarOpinion(nuevoProducto.id, {
                nombreUsuario: 'Administrador',
                calificacion: datos.calificacionInicial,
                comentario: 'Calificación inicial del producto'
              });
            } catch (error) {
              console.error('Error al crear opinión inicial:', error);
              // No fallar la creación del producto si falla la opinión
            }
          }
          
          // Mostrar mensaje de éxito
          mostrarMensajeEnFormulario(
            `✅ Producto "${nuevoProducto.nombre}" registrado exitosamente (ID: #${nuevoProducto.id})`,
            'success',
            mensajeDiv
          );
          
          // Limpiar formulario
          form.reset();
          
          // Redirigir al panel de administración después de 2 segundos
          setTimeout(() => {
            window.location.href = 'panel-admin.html';
          }, 2000);
        } catch (error) {
          // Mostrar mensaje de error
          mostrarMensajeEnFormulario(`❌ Error: ${error.message}`, 'error', mensajeDiv);
        }
  });
}

/**
 * ========================================
 * ACTUALIZACIÓN DE PRODUCTOS
 * ========================================
 */

/**
 * Inicializar el formulario de actualización de productos
 */
function inicializarFormularioActualizacion() {
  // Obtener ID del producto desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idProducto = urlParams.get('id');

  if (!idProducto) {
    mostrarMensaje('No se especificó un ID de producto', 'error');
    setTimeout(() => {
      window.location.href = 'panel-admin.html';
    }, 2000);
    return;
  }

  // Cargar el producto
  const producto = gestorProductos.obtenerPorId(idProducto);
  
  if (!producto) {
    mostrarMensaje('Producto no encontrado', 'error');
    setTimeout(() => {
      window.location.href = 'panel-admin.html';
    }, 2000);
    return;
  }

  // Llenar el formulario con los datos del producto
  llenarFormularioActualizacion(producto);

  // Configurar el evento de envío del formulario
  configurarEnvioFormularioActualizacion(idProducto);
}

/**
 * Llenar el formulario con los datos del producto
 * @param {Object} producto - Objeto producto
 */
function llenarFormularioActualizacion(producto) {
  // Obtener elementos del formulario
  const idInput = document.getElementById('id-producto');
  const nombreInput = document.getElementById('nuevo-nombre');
  const categoriaInput = document.getElementById('nueva-categoria');
  const precioInput = document.getElementById('nuevo-precio');
  const stockInput = document.getElementById('nuevo-stock');
  const imagenInput = document.getElementById('nueva-imagen');
  const descripcionInput = document.getElementById('nueva-descripcion');

  // Llenar los campos
  const calificacionInput = document.getElementById('nueva-calificacion-inicial');
  
  if (idInput) idInput.value = producto.id;
  if (nombreInput) nombreInput.value = producto.nombre;
  if (categoriaInput) categoriaInput.value = producto.categoria;
  if (precioInput) precioInput.value = producto.precio;
  if (stockInput) stockInput.value = producto.stock;
  if (imagenInput) imagenInput.value = producto.imagen || '';
  if (descripcionInput) descripcionInput.value = producto.descripcion || '';
  if (calificacionInput) calificacionInput.value = producto.calificacionInicial || '';
}

/**
 * Configurar el evento de envío del formulario de actualización
 * @param {string} idProducto - ID del producto a actualizar
 */
function configurarEnvioFormularioActualizacion(idProducto) {
  const form = document.getElementById('formActualizarProducto');
  const mensajeDiv = document.getElementById('mensaje-formulario');

  if (!form || !mensajeDiv) return;

  /**
   * Manejar el envío del formulario
   */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtener datos del formulario
        const datosActualizados = {
          nombre: document.getElementById('nuevo-nombre').value.trim(),
          categoria: document.getElementById('nueva-categoria').value.trim(),
          precio: document.getElementById('nuevo-precio').value,
          stock: document.getElementById('nuevo-stock').value,
          imagen: document.getElementById('nueva-imagen') ? document.getElementById('nueva-imagen').value.trim() : '',
          descripcion: document.getElementById('nueva-descripcion') ? document.getElementById('nueva-descripcion').value.trim() : '',
          calificacionInicial: document.getElementById('nueva-calificacion-inicial') && document.getElementById('nueva-calificacion-inicial').value
            ? parseFloat(document.getElementById('nueva-calificacion-inicial').value)
            : null
        };
        
        // Validar calificación inicial si se proporciona
        if (datosActualizados.calificacionInicial !== null) {
          if (datosActualizados.calificacionInicial < 1 || datosActualizados.calificacionInicial > 5) {
            mostrarMensajeEnFormulario('La calificación inicial debe estar entre 1 y 5', 'error', mensajeDiv);
            return;
          }
        }

    // Validar datos
    const validacion = validarProducto({
      nombre: datosActualizados.nombre,
      categoria: datosActualizados.categoria,
      precio: datosActualizados.precio,
      stock: datosActualizados.stock
    });

    if (!validacion.valido) {
      mostrarMensajeEnFormulario(validacion.errores.join(', '), 'error', mensajeDiv);
      return;
    }

    try {
      // Actualizar el producto
      const productoActualizado = gestorProductos.actualizar(idProducto, datosActualizados);
      
      // Mostrar mensaje de éxito
      mostrarMensajeEnFormulario(
        `✅ Producto "${productoActualizado.nombre}" actualizado exitosamente`,
        'success',
        mensajeDiv
      );
      
      // Redirigir al panel de administración después de 2 segundos
      setTimeout(() => {
        window.location.href = 'panel-admin.html';
      }, 2000);
    } catch (error) {
      // Mostrar mensaje de error
      mostrarMensajeEnFormulario(`❌ Error: ${error.message}`, 'error', mensajeDiv);
    }
  });
}

/**
 * ========================================
 * ELIMINACIÓN DE PRODUCTOS
 * ========================================
 */

/**
 * Inicializar la vista de eliminación de productos
 */
function inicializarEliminacionProducto() {
  // Obtener ID del producto desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idProducto = urlParams.get('id');

  if (!idProducto) {
    mostrarMensaje('No se especificó un ID de producto', 'error');
    setTimeout(() => {
      window.location.href = 'panel-admin.html';
    }, 2000);
    return;
  }

  // Cargar el producto
  const producto = gestorProductos.obtenerPorId(idProducto);
  
  if (!producto) {
    mostrarMensaje('Producto no encontrado', 'error');
    setTimeout(() => {
      window.location.href = 'panel-admin.html';
    }, 2000);
    return;
  }

  // Mostrar información del producto a eliminar
  mostrarInformacionProductoEliminar(producto);

  // Configurar el evento de confirmación de eliminación
  configurarEliminacionProducto(idProducto);
}

/**
 * Mostrar información del producto que se va a eliminar
 * @param {Object} producto - Objeto producto
 */
function mostrarInformacionProductoEliminar(producto) {
  // Buscar elementos del DOM donde mostrar la información
  const elementosInfo = document.querySelectorAll('[data-producto-info]');
  
  elementosInfo.forEach(elemento => {
    const campo = elemento.getAttribute('data-producto-info');
    if (producto[campo] !== undefined) {
      elemento.textContent = producto[campo];
    }
  });

  // Si hay un elemento específico para mostrar toda la información
  const contenedorInfo = document.getElementById('info-producto-eliminar');
  if (contenedorInfo) {
    const precioFormateado = gestorProductos.formatearPrecio(producto.precio);
    contenedorInfo.innerHTML = `
      <div class="info-producto">
        <h3>${sanitizarTexto(producto.nombre)}</h3>
        <p><strong>ID:</strong> #${producto.id}</p>
        <p><strong>Categoría:</strong> ${sanitizarTexto(producto.categoria)}</p>
        <p><strong>Precio:</strong> ${precioFormateado}</p>
        <p><strong>Stock:</strong> ${producto.stock} unidades</p>
      </div>
    `;
  }
}

/**
 * Configurar el evento de confirmación de eliminación
 * @param {string} idProducto - ID del producto a eliminar
 */
function configurarEliminacionProducto(idProducto) {
  const formEliminar = document.getElementById('formEliminarProducto');
  const botonEliminar = document.getElementById('boton-eliminar-producto');

  // Función para eliminar el producto
  function eliminarProducto() {
    try {
      // Eliminar el producto
      gestorProductos.eliminar(idProducto);
      
      // Mostrar mensaje de éxito
      mostrarMensaje('✅ Producto eliminado exitosamente', 'success');
      
      // Redirigir al panel de administración después de 1.5 segundos
      setTimeout(() => {
        window.location.href = 'panel-admin.html';
      }, 1500);
    } catch (error) {
      // Mostrar mensaje de error
      mostrarMensaje(`❌ Error: ${error.message}`, 'error');
    }
  }

  // Si hay un formulario, agregar el evento al submit
  if (formEliminar) {
    formEliminar.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Confirmar eliminación
      if (confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        eliminarProducto();
      }
    });
  }

  // Si hay un botón, agregar el evento al click
  if (botonEliminar) {
    botonEliminar.addEventListener('click', () => {
      // Confirmar eliminación
      if (confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        eliminarProducto();
      }
    });
  }
}

/**
 * ========================================
 * UTILIDADES
 * ========================================
 */

/**
 * Mostrar mensaje en un formulario
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (success, error)
 * @param {HTMLElement} mensajeDiv - Elemento DOM donde se mostrará el mensaje
 */
function mostrarMensajeEnFormulario(mensaje, tipo, mensajeDiv) {
  if (!mensajeDiv) return;

  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.display = 'block';
  mensajeDiv.style.backgroundColor = tipo === 'success' ? '#10b981' : '#ef4444';
  mensajeDiv.style.color = 'white';
  mensajeDiv.style.padding = '12px';
  mensajeDiv.style.borderRadius = '8px';
  mensajeDiv.style.marginBottom = '15px';
  
  // Ocultar el mensaje después de 5 segundos
  setTimeout(() => {
    mensajeDiv.style.display = 'none';
  }, 5000);
}

