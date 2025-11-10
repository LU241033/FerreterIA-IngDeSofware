// ======================= UTILIDADES =======================
// Funciones reutilizables para toda la aplicación

// Verificar si el usuario está autenticado
function verificarAutenticacion() {
  try {
    const usuarioStr = localStorage.getItem('usuarioActivo');
    if (!usuarioStr) return null;
    
    const usuario = JSON.parse(usuarioStr);
    
    // Validar que el objeto tenga la estructura correcta
    if (!usuario || typeof usuario !== 'object' || !usuario.usuario) {
      localStorage.removeItem('usuarioActivo');
      return null;
    }
    
    return usuario;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    localStorage.removeItem('usuarioActivo'); // Limpiar sesión corrupta
    return null;
  }
}

// Verificar si el usuario es admin
function esAdmin() {
  const usuario = verificarAutenticacion();
  return usuario && usuario.rol === 'admin';
}

// Proteger rutas de admin
function protegerRutaAdmin() {
  const usuario = verificarAutenticacion();
  
  if (!usuario) {
    mostrarMensaje('⚠️ Debes iniciar sesión para acceder a esta página', 'warning');
    setTimeout(() => {
      window.location.href = '../iniciar-sesion.html';
    }, 1500);
    return false;
  }
  
  if (usuario.rol !== 'admin') {
    mostrarMensaje('⚠️ Acceso denegado. Debes ser administrador para acceder a esta página', 'error');
    setTimeout(() => {
      window.location.href = '../../inicio.html';
    }, 1500);
    return false;
  }
  
  return true;
}

// Proteger rutas de usuario (requiere sesión activa y NO ser administrador)
function protegerRutaUsuario() {
  const usuario = verificarAutenticacion();
  
  if (!usuario) {
    mostrarMensaje('⚠️ Debes iniciar sesión para acceder a esta página', 'warning');
    setTimeout(() => {
      window.location.href = '../iniciar-sesion.html';
    }, 1500);
    return false;
  }
  
  // Los administradores NO pueden acceder a funciones de usuario (carrito, compras)
  if (usuario.rol === 'admin') {
    mostrarMensaje('⚠️ Los administradores no pueden realizar compras. Solo pueden gestionar productos.', 'warning');
    setTimeout(() => {
      window.location.href = '../admin/panel-admin.html';
    }, 2000);
    return false;
  }
  
  return true;
}

// Mostrar mensaje en la UI (reemplaza alert)
function mostrarMensaje(mensaje, tipo = 'info', elemento = null) {
  // Si está disponible la función mejorada, usarla
  if (typeof mostrarMensajeMejorado === 'function') {
    mostrarMensajeMejorado(mensaje, tipo, elemento);
    return;
  }

  // Si no se especifica elemento, crear uno temporal
  const contenedor = elemento || document.body;
  
  // Crear elemento de mensaje
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = `mensaje-ui mensaje-${tipo}`;
  mensajeDiv.setAttribute('role', 'alert');
  mensajeDiv.setAttribute('aria-live', tipo === 'error' ? 'assertive' : 'polite');
  mensajeDiv.textContent = mensaje;
  
  // Estilos inline para el mensaje
  Object.assign(mensajeDiv.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    zIndex: '10000',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    animation: 'slideIn 0.3s ease',
    maxWidth: '400px'
  });

  // Colores según tipo
  const colores = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#d97706'
  };
  mensajeDiv.style.backgroundColor = colores[tipo] || colores.info;

  // Agregar al DOM
  contenedor.appendChild(mensajeDiv);

  // Remover después de 4 segundos (errores se mantienen más tiempo)
  const tiempoMostrar = tipo === 'error' ? 6000 : 4000;
  setTimeout(() => {
    mensajeDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (mensajeDiv.parentNode) {
        mensajeDiv.parentNode.removeChild(mensajeDiv);
      }
    }, 300);
  }, tiempoMostrar);
}

// Actualizar botones de autenticación en la UI
function actualizarBotonesAuth() {
  const botonesDiv = document.getElementById('botonesAuth');
  if (!botonesDiv) return;

  const usuarioActivo = verificarAutenticacion();
  
  if (usuarioActivo) {
    botonesDiv.innerHTML = `
      <span style="color:white; margin-right:10px;">Hola, ${usuarioActivo.usuario}</span>
      <button class="btn-borde" onclick="cerrarSesion()">Cerrar sesión</button>
    `;
  } else {
    // Mantener botones originales si existen
    const rutaActual = window.location.pathname;
    if (rutaActual.includes('iniciar-sesion.html') || rutaActual.includes('Login.html')) {
      botonesDiv.innerHTML = `
        <button class="btn-principal" onclick="location.href='../usuario/registro.html'">Registrarse</button>
      `;
    } else {
      botonesDiv.innerHTML = `
        <button class="btn-borde" onclick="location.href='../iniciar-sesion.html'">Iniciar sesión</button>
        <button class="btn-principal" onclick="location.href='../usuario/registro.html'">Registrarse</button>
      `;
    }
  }
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('usuarioActivo');
  mostrarMensaje('Sesión cerrada exitosamente', 'success');
  setTimeout(() => {
    window.location.href = '/inicio.html';
  }, 1000);
}

// Validar formulario de producto (mejorado)
function validarProducto(datos) {
  const errores = [];

  // Validar nombre
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  } else if (datos.nombre.trim().length > 200) {
    errores.push('El nombre no puede exceder 200 caracteres');
  }

  // Validar categoría
  if (!datos.categoria || datos.categoria.trim().length < 2) {
    errores.push('La categoría debe tener al menos 2 caracteres');
  } else if (datos.categoria.trim().length > 100) {
    errores.push('La categoría no puede exceder 100 caracteres');
  }

  // Validar precio
  if (!datos.precio || datos.precio === '') {
    errores.push('El precio es requerido');
  } else {
    const precio = parseFloat(datos.precio);
    if (isNaN(precio)) {
      errores.push('El precio debe ser un número válido');
    } else if (precio <= 0) {
      errores.push('El precio debe ser mayor a 0');
    } else if (precio > 1000000000) {
      errores.push('El precio no puede exceder 1,000,000,000');
    }
  }

  // Validar stock
  if (datos.stock === undefined || datos.stock === '') {
    errores.push('El stock es requerido');
  } else {
    const stock = parseInt(datos.stock);
    if (isNaN(stock)) {
      errores.push('El stock debe ser un número válido');
    } else if (stock < 0) {
      errores.push('El stock debe ser 0 o mayor');
    } else if (stock > 1000000) {
      errores.push('El stock no puede exceder 1,000,000');
    }
  }

  // Validar descripción (si existe)
  if (datos.descripcion && datos.descripcion.trim().length > 2000) {
    errores.push('La descripción no puede exceder 2000 caracteres');
  }

  // Validar calificación inicial (si existe)
  if (datos.calificacionInicial !== undefined && datos.calificacionInicial !== null && datos.calificacionInicial !== '') {
    const calificacion = parseFloat(datos.calificacionInicial);
    if (isNaN(calificacion)) {
      errores.push('La calificación inicial debe ser un número válido');
    } else if (calificacion < 1 || calificacion > 5) {
      errores.push('La calificación inicial debe estar entre 1 y 5');
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
}
function sanitizarTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

