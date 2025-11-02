// ======================= LOGIN.JS =======================
document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  const botonesDiv = document.getElementById("botonesAuth");
  const formLogin = document.getElementById("formLogin");
  const mensaje = document.getElementById("mensaje-error");

  // ===== Mostrar saludo si hay sesión activa =====
  if (usuarioActivo && botonesDiv) {
    botonesDiv.innerHTML = `
      <span style="color:white; margin-right:10px;">Hola, ${usuarioActivo.usuario}</span>
      <button class="btn-borde" onclick="cerrarSesion()">Cerrar sesión</button>
    `;
  }

  // ===== Evento del formulario de inicio de sesión =====
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Limpiar mensajes anteriores
    mensaje.textContent = "";
    mensaje.style.color = "red";

    // ===== Validaciones de campos =====
    if (!email || !password) {
      mensaje.textContent = "⚠️ Por favor completa todos los campos.";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mensaje.textContent = "⚠️ Ingresa un correo electrónico válido.";
      return;
    }

    // ===== Validar usuario registrado =====
    const usuariosRegistrados = JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuarioEncontrado = usuariosRegistrados.find(
      (u) => u.email === email && u.password === password
    );

    if (!usuarioEncontrado) {
      mensaje.textContent = "❌ Correo o contraseña incorrectos.";
      return;
    }

    // ===== Guardar sesión activa =====
    const usuario = {
      usuario: usuarioEncontrado.nombres,
      email: email,
      rol: usuarioEncontrado.rol || "usuario"
    };
    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

    // ===== Redirigir según el rol =====
    mensaje.style.color = "green";
    mensaje.textContent = "✅ Inicio de sesión exitoso. Redirigiendo...";

    setTimeout(() => {
      if (usuario.rol === "admin") {
        location.href = "../admin/panel-admin.html";
      } else {
        location.href = "../comunes/acerca-de-nosotros.html";
      }
    }, 1200);
  });
});

// ===== Función para cerrar sesión =====
function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  location.reload();
}
