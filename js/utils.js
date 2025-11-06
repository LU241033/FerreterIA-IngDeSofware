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
      window.location.href = '../Login.html';
    }, 1500);
    return false;
  }
  
  if (usuario.rol !== 'admin') {
    mostrarMensaje('⚠️ Acceso denegado. Debes ser administrador para acceder a esta página', 'error');
    setTimeout(() => {
      window.location.href = '../../Index.html';
    }, 1500);
    return false;
  }
  
  return true;
}

// Mostrar mensaje en la UI (reemplaza alert)
function mostrarMensaje(mensaje, tipo = 'info', elemento = null) {
  // Si no se especifica elemento, crear uno temporal
  const contenedor = elemento || document.body;
  
  // Crear elemento de mensaje
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = `mensaje-ui mensaje-${tipo}`;
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
    info: '#3b82f6'
  };
  mensajeDiv.style.backgroundColor = colores[tipo] || colores.info;

  // Agregar al DOM
  contenedor.appendChild(mensajeDiv);

  // Remover después de 4 segundos
  setTimeout(() => {
    mensajeDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (mensajeDiv.parentNode) {
        mensajeDiv.parentNode.removeChild(mensajeDiv);
      }
    }, 300);
  }, 4000);
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
    if (rutaActual.includes('Login.html')) {
      botonesDiv.innerHTML = `
        <button class="btn-principal" onclick="location.href='../usuario/registro.html'">Registrarse</button>
      `;
    } else {
      botonesDiv.innerHTML = `
        <button class="btn-borde" onclick="location.href='../Login.html'">Iniciar sesión</button>
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
    window.location.href = '/Index.html';
  }, 1000);
}

// Validar formulario de producto
function validarProducto(datos) {
  const errores = [];

  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!datos.categoria || datos.categoria.trim().length < 2) {
    errores.push('La categoría debe tener al menos 2 caracteres');
  }

  if (!datos.precio || datos.precio <= 0) {
    errores.push('El precio debe ser mayor a 0');
  }

  if (datos.stock === undefined || datos.stock < 0) {
    errores.push('El stock debe ser 0 o mayor');
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

// Sanitizar entrada de texto (protección básica XSS)
function sanitizarTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

