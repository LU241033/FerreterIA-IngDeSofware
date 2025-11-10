// ======================= MEJORAS DE UI/UX =======================
// Módulo para mejoras de interfaz de usuario

/**
 * ========================================
 * ESTADOS DE CARGA (LOADING STATES)
 * ========================================
 */

/**
 * Mostrar skeleton loader mientras se cargan los productos
 * @param {HTMLElement} contenedor - Elemento donde se mostrará el skeleton
 * @param {number} cantidad - Cantidad de skeletons a mostrar
 */
function mostrarSkeletonLoader(contenedor, cantidad = 6) {
  if (!contenedor) return;
  
  contenedor.innerHTML = '';
  contenedor.style.display = 'grid';
  
  for (let i = 0; i < cantidad; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.setAttribute('aria-label', 'Cargando producto');
    skeleton.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-line-title"></div>
        <div class="skeleton-line skeleton-line-category"></div>
        <div class="skeleton-line skeleton-line-description"></div>
        <div class="skeleton-line skeleton-line-price"></div>
        <div class="skeleton-line skeleton-line-button"></div>
      </div>
    `;
    contenedor.appendChild(skeleton);
  }
}

/**
 * Ocultar skeleton loader
 * @param {HTMLElement} contenedor - Elemento donde se ocultará el skeleton
 */
function ocultarSkeletonLoader(contenedor) {
  if (!contenedor) return;
  // El contenido se reemplazará por los productos reales
}

/**
 * ========================================
 * PAGINACIÓN
 * ========================================
 */

/**
 * Configuración de paginación
 */
const CONFIG_PAGINACION = {
  productosPorPagina: 12,
  paginaActual: 1,
  totalPaginas: 1
};

/**
 * Calcular total de páginas
 * @param {number} totalProductos - Total de productos
 * @param {number} productosPorPagina - Productos por página
 * @returns {number} - Total de páginas
 */
function calcularTotalPaginas(totalProductos, productosPorPagina = CONFIG_PAGINACION.productosPorPagina) {
  return Math.ceil(totalProductos / productosPorPagina);
}

/**
 * Paginar array de productos
 * @param {Array} productos - Array de productos
 * @param {number} pagina - Página actual
 * @param {number} productosPorPagina - Productos por página
 * @returns {Array} - Productos de la página actual
 */
function paginarProductos(productos, pagina = 1, productosPorPagina = CONFIG_PAGINACION.productosPorPagina) {
  const inicio = (pagina - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  return productos.slice(inicio, fin);
}

/**
 * Renderizar controles de paginación
 * @param {HTMLElement} contenedor - Elemento donde se renderizará la paginación
 * @param {number} paginaActual - Página actual
 * @param {number} totalPaginas - Total de páginas
 * @param {Function} callback - Función a ejecutar al cambiar de página (opcional, se usará cambiarPaginaTienda si no se proporciona)
 */
function renderizarPaginacion(contenedor, paginaActual, totalPaginas, callback = null) {
  if (!contenedor || totalPaginas <= 1) {
    if (contenedor) contenedor.innerHTML = '';
    return;
  }

  let paginacionHTML = '<div class="paginacion" role="navigation" aria-label="Paginación de productos">';
  
  // Botón Anterior
  paginacionHTML += `
    <button 
      class="btn-paginacion ${paginaActual === 1 ? 'disabled' : ''}" 
      ${paginaActual === 1 ? 'disabled aria-disabled="true"' : ''}
      onclick="cambiarPaginaTienda(${paginaActual - 1}, ${totalPaginas})"
      aria-label="Página anterior">
      ← Anterior
    </button>
  `;

  // Números de página
  const maxPaginasVisibles = 5;
  let inicio = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
  let fin = Math.min(totalPaginas, inicio + maxPaginasVisibles - 1);
  
  if (fin - inicio < maxPaginasVisibles - 1) {
    inicio = Math.max(1, fin - maxPaginasVisibles + 1);
  }

  if (inicio > 1) {
    paginacionHTML += `
      <button class="btn-paginacion" onclick="cambiarPaginaTienda(1, ${totalPaginas})" aria-label="Ir a página 1">1</button>
      ${inicio > 2 ? '<span class="paginacion-ellipsis">...</span>' : ''}
    `;
  }

  for (let i = inicio; i <= fin; i++) {
    paginacionHTML += `
      <button 
        class="btn-paginacion ${i === paginaActual ? 'active' : ''}" 
        ${i === paginaActual ? 'aria-current="page"' : ''}
        onclick="cambiarPaginaTienda(${i}, ${totalPaginas})"
        aria-label="Ir a página ${i}">
        ${i}
      </button>
    `;
  }

  if (fin < totalPaginas) {
    paginacionHTML += `
      ${fin < totalPaginas - 1 ? '<span class="paginacion-ellipsis">...</span>' : ''}
      <button class="btn-paginacion" onclick="cambiarPaginaTienda(${totalPaginas}, ${totalPaginas})" aria-label="Ir a página ${totalPaginas}">${totalPaginas}</button>
    `;
  }

  // Botón Siguiente
  paginacionHTML += `
    <button 
      class="btn-paginacion ${paginaActual === totalPaginas ? 'disabled' : ''}" 
      ${paginaActual === totalPaginas ? 'disabled aria-disabled="true"' : ''}
      onclick="cambiarPaginaTienda(${paginaActual + 1}, ${totalPaginas})"
      aria-label="Página siguiente">
      Siguiente →
    </button>
  `;

  paginacionHTML += '</div>';
  
  // Información de paginación
  paginacionHTML += `
    <div class="paginacion-info" aria-live="polite" aria-atomic="true">
      Página ${paginaActual} de ${totalPaginas}
    </div>
  `;

  contenedor.innerHTML = paginacionHTML;
}

/**
 * Cambiar de página en la tienda
 * @param {number} nuevaPagina - Nueva página
 * @param {number} totalPaginas - Total de páginas
 */
function cambiarPaginaTienda(nuevaPagina, totalPaginas) {
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
  
  CONFIG_PAGINACION.paginaActual = nuevaPagina;
  
  // Obtener filtros actuales
  const inputBusqueda = document.getElementById('busqueda-texto');
  const selectCategoria = document.getElementById('filtro-categoria');
  const selectStock = document.getElementById('filtro-stock');
  
  const filtro = {
    texto: inputBusqueda ? inputBusqueda.value.trim() : '',
    categoria: selectCategoria ? selectCategoria.value : '',
    stock: selectStock ? selectStock.value : ''
  };
  
  // Cargar productos con la nueva página
  if (typeof cargarProductosTienda === 'function') {
    cargarProductosTienda(filtro, nuevaPagina);
  }
  
  // Scroll al inicio de los productos
  const gridProductos = document.getElementById('grid-productos');
  if (gridProductos) {
    gridProductos.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * ========================================
 * DEBOUNCE PARA BÚSQUEDAS
 * ========================================
 */

/**
 * Función debounce para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} - Función con debounce aplicado
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * ========================================
 * MEJORAS DE MENSAJES
 * ========================================
 */

/**
 * Mostrar mensaje de error mejorado
 * @param {string} mensaje - Mensaje de error
 * @param {string} tipo - Tipo de mensaje (error, warning, info, success)
 * @param {HTMLElement} contenedor - Contenedor donde mostrar el mensaje (opcional)
 */
function mostrarMensajeMejorado(mensaje, tipo = 'error', contenedor = null) {
  // Usar la función existente si está disponible
  if (typeof mostrarMensaje === 'function') {
    mostrarMensaje(mensaje, tipo);
    return;
  }

  // Crear elemento de mensaje
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = `mensaje-mejorado mensaje-${tipo}`;
  mensajeDiv.setAttribute('role', 'alert');
  mensajeDiv.setAttribute('aria-live', 'assertive');
  
  const icono = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  }[tipo] || 'ℹ️';

  mensajeDiv.innerHTML = `
    <span class="mensaje-icono">${icono}</span>
    <span class="mensaje-texto">${mensaje}</span>
    <button class="mensaje-cerrar" onclick="this.parentElement.remove()" aria-label="Cerrar mensaje">×</button>
  `;

  // Agregar al contenedor o al body
  if (contenedor) {
    contenedor.appendChild(mensajeDiv);
  } else {
    document.body.appendChild(mensajeDiv);
  }

  // Auto-eliminar después de 5 segundos (excepto errores importantes)
  if (tipo !== 'error') {
    setTimeout(() => {
      if (mensajeDiv.parentElement) {
        mensajeDiv.style.opacity = '0';
        mensajeDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => mensajeDiv.remove(), 300);
      }
    }, 5000);
  }
}

/**
 * ========================================
 * UTILIDADES DE VALIDACIÓN MEJORADA
 * ========================================
 */

/**
 * Validar y sanitizar email
 * @param {string} email - Email a validar
 * @returns {Object} - { valido: boolean, error: string }
 */
function validarEmail(email) {
  if (!email || !email.trim()) {
    return { valido: false, error: 'El email es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valido: false, error: 'El formato del email no es válido. Ejemplo: usuario@dominio.com' };
  }

  return { valido: true, error: null };
}

/**
 * Validar y sanitizar teléfono
 * @param {string} telefono - Teléfono a validar
 * @returns {Object} - { valido: boolean, error: string }
 */
function validarTelefono(telefono) {
  if (!telefono || !telefono.trim()) {
    return { valido: false, error: 'El teléfono es requerido' };
  }

  // Remover caracteres no numéricos
  const telefonoLimpio = telefono.replace(/\D/g, '');
  
  if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15) {
    return { valido: false, error: 'El teléfono debe tener entre 7 y 15 dígitos' };
  }

  return { valido: true, error: null, telefonoLimpio };
}

/**
 * Validar texto (prevenir XSS)
 * @param {string} texto - Texto a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima
 * @returns {Object} - { valido: boolean, error: string, textoSanitizado: string }
 */
function validarTexto(texto, minLength = 2, maxLength = 500) {
  if (!texto || !texto.trim()) {
    return { valido: false, error: 'Este campo es requerido', textoSanitizado: '' };
  }

  const textoSanitizado = sanitizarTexto(texto.trim());
  
  if (textoSanitizado.length < minLength) {
    return { valido: false, error: `Este campo debe tener al menos ${minLength} caracteres`, textoSanitizado };
  }

  if (textoSanitizado.length > maxLength) {
    return { valido: false, error: `Este campo no puede exceder ${maxLength} caracteres`, textoSanitizado };
  }

  // Verificar caracteres peligrosos (básico)
  const caracteresPeligrosos = /<script|javascript:|onerror=|onload=/i;
  if (caracteresPeligrosos.test(textoSanitizado)) {
    return { valido: false, error: 'El texto contiene caracteres no permitidos', textoSanitizado: '' };
  }

  return { valido: true, error: null, textoSanitizado };
}

/**
 * Validar número
 * @param {string|number} valor - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {Object} - { valido: boolean, error: string, numero: number }
 */
function validarNumero(valor, min = 0, max = Infinity) {
  if (valor === null || valor === undefined || valor === '') {
    return { valido: false, error: 'Este campo es requerido', numero: null };
  }

  const numero = parseFloat(valor);
  
  if (isNaN(numero)) {
    return { valido: false, error: 'Debe ser un número válido', numero: null };
  }

  if (numero < min) {
    return { valido: false, error: `El valor debe ser mayor o igual a ${min}`, numero };
  }

  if (numero > max) {
    return { valido: false, error: `El valor debe ser menor o igual a ${max}`, numero };
  }

  return { valido: true, error: null, numero };
}

