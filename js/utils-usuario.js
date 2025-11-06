// ======================= UTILIDADES PARA USUARIOS =======================
// Funciones específicas para la vista de usuario

// Verificar si el usuario está autenticado (función más permisiva)
function verificarUsuarioAutenticado() {
  const usuario = verificarAutenticacion();
  
  // Los usuarios pueden ver el catálogo sin estar autenticados
  // pero si están autenticados, mostramos su información
  return usuario;
}

// Mostrar información del usuario en el dashboard
function mostrarInfoUsuario() {
  const usuario = verificarAutenticacion();
  const botonesDiv = document.getElementById('botonesAuth');
  
  if (usuario && botonesDiv) {
    botonesDiv.innerHTML = `
      <span style="color:white; margin-right:10px;">Hola, ${usuario.usuario}</span>
      ${usuario.rol === 'admin' 
        ? '<a href="../admin/panel-admin.html" class="btn-borde" style="margin-right:10px;">Admin</a>'
        : ''
      }
      <button class="btn-borde" onclick="cerrarSesion()">Cerrar sesión</button>
    `;
  }
}


