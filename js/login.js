// ======================= LOGIN.JS =======================
document.addEventListener("DOMContentLoaded", () => {
  // Cargar utilidades
  if (typeof mostrarMensaje === 'undefined') {
    console.error('utils.js debe cargarse antes de login.js');
  }

  // Obtener elementos del DOM
  const botonesDiv = document.getElementById("botonesAuth");
  const formLogin = document.getElementById("formLogin");
  const mensaje = document.getElementById("mensaje-error");

  if (!formLogin || !mensaje) {
    console.error('Elementos del formulario de login no encontrados');
    return;
  }

  // ===== Mostrar saludo si hay sesión activa =====
  try {
    const usuarioActivoStr = localStorage.getItem("usuarioActivo");
    const usuarioActivo = usuarioActivoStr ? JSON.parse(usuarioActivoStr) : null;
    
    if (usuarioActivo && botonesDiv) {
      botonesDiv.innerHTML = `
        <span style="color:white; margin-right:10px;">Hola, ${sanitizarTexto(usuarioActivo.usuario)}</span>
        <button class="btn-borde" onclick="cerrarSesion()">Cerrar sesión</button>
      `;
    }
  } catch (error) {
    console.error('Error al leer sesión activa:', error);
    localStorage.removeItem("usuarioActivo"); // Limpiar sesión corrupta
  }

  // ===== Evento del formulario de inicio de sesión =====
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const email = sanitizarInput(document.getElementById("email").value);
      const password = document.getElementById("password").value;

      // Limpiar mensajes anteriores
      mensaje.textContent = "";
      mensaje.style.color = "red";

      // ===== Validaciones de campos =====
      if (!email || !password) {
        mensaje.textContent = "⚠️ Por favor completa todos los campos.";
        mensaje.style.color = "red";
        return;
      }

      if (!validarEmail(email)) {
        mensaje.textContent = "⚠️ Ingresa un correo electrónico válido.";
        mensaje.style.color = "red";
        return;
      }

      // ===== Sincronizar admins del JSON primero =====
      if (typeof sincronizarAdmins !== 'undefined') {
        try {
          await sincronizarAdmins();
        } catch (error) {
          console.warn('No se pudo sincronizar admins.json:', error);
        }
      }

      // ===== Validar usuario registrado =====
      let usuariosRegistrados = [];
      try {
        const usuariosStr = localStorage.getItem("usuarios");
        usuariosRegistrados = usuariosStr ? JSON.parse(usuariosStr) : [];
      } catch (error) {
        console.error('Error al leer usuarios:', error);
        mensaje.textContent = "❌ Error al acceder a los datos. Por favor, recarga la página.";
        mensaje.style.color = "red";
        return;
      }

      // Buscar usuario por email (con validación)
      let usuarioEncontrado = usuariosRegistrados.find((u) => {
        if (!u || !u.email || typeof u.email !== 'string') return false;
        if (!email || typeof email !== 'string') return false;
        return u.email.toLowerCase() === email.toLowerCase();
      });

      // Si no se encuentra en localStorage, intentar con admins.json
      if (!usuarioEncontrado && typeof verificarLoginConAdmins !== 'undefined') {
        const adminDesdeJSON = await verificarLoginConAdmins(email, password);
        if (adminDesdeJSON) {
          // Crear usuario desde el JSON
          usuarioEncontrado = {
            nombres: adminDesdeJSON.nombres,
            apellidos: adminDesdeJSON.apellidos,
            email: adminDesdeJSON.email,
            password: hashPassword(password), // Hashear la contraseña
            rol: 'admin',
            fechaRegistro: new Date().toISOString()
          };
          
          // Guardar en localStorage
          usuariosRegistrados.push(usuarioEncontrado);
          localStorage.setItem("usuarios", JSON.stringify(usuariosRegistrados));
        }
      }

      if (!usuarioEncontrado) {
        mensaje.textContent = "❌ Correo o contraseña incorrectos.";
        mensaje.style.color = "red";
        return;
      }

      // ===== Verificar contraseña (comparar hash) =====
      const passwordHash = hashPassword(password);
      let passwordValida = false;
      
      if (usuarioEncontrado.password === passwordHash) {
        // Contraseña correcta (hash)
        passwordValida = true;
      } else if (usuarioEncontrado.password === password) {
        // Contraseña en texto plano (migración)
        passwordValida = true;
        // Migrar a hash
        usuarioEncontrado.password = passwordHash;
        try {
          localStorage.setItem("usuarios", JSON.stringify(usuariosRegistrados));
        } catch (error) {
          console.error('Error al actualizar contraseña:', error);
        }
      } else {
        // Contraseña incorrecta
        mensaje.textContent = "❌ Correo o contraseña incorrectos.";
        mensaje.style.color = "red";
        return;
      }

      // ===== Guardar sesión activa =====
      const emailLower = (email && typeof email === 'string') ? email.toLowerCase() : '';
      const usuario = {
        usuario: usuarioEncontrado.nombres || 'Usuario',
        email: emailLower,
        rol: usuarioEncontrado.rol || "usuario",
        fechaLogin: new Date().toISOString()
      };

      try {
        localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
      } catch (error) {
        console.error('Error al guardar sesión:', error);
        mensaje.textContent = "❌ Error al iniciar sesión. Por favor, intenta nuevamente.";
        mensaje.style.color = "red";
        return;
      }

      // ===== Redirigir según el rol =====
      mensaje.style.color = "green";
      mensaje.textContent = "✅ Inicio de sesión exitoso. Redirigiendo...";

      setTimeout(() => {
        if (usuario.rol === "admin") {
          window.location.href = "/html/admin/panel-admin.html";
        } else {
          window.location.href = "/html/usuario/dashboard-usuario.html";
        }
      }, 1200);
    } catch (error) {
      console.error('Error en login:', error);
      mensaje.textContent = "❌ Ocurrió un error inesperado. Por favor, intenta nuevamente.";
      mensaje.style.color = "red";
    }
  });
});

// ===== Función para cerrar sesión =====
function cerrarSesion() {
  try {
    localStorage.removeItem("usuarioActivo");
    if (typeof mostrarMensaje !== 'undefined') {
      mostrarMensaje('Sesión cerrada exitosamente', 'success');
    }
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    window.location.reload();
  }
}
