// ======================= LOGIN.JS =======================
document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  const botonesDiv = document.getElementById("botonesAuth");
  const formLogin = document.getElementById("formLogin");
  const mensaje = document.getElementById("mensaje-error");

  // ===== Mostrar saludo si hay sesión activa =====
  if (usuarioActivo) {
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
    const usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];

    const usuarioEncontrado = usuariosRegistrados.find(
      (u) => u.email === email && u.password === password
    );

    if (!usuarioEncontrado) {
      mensaje.textContent = "❌ Usuario no registrado o contraseña incorrecta.";
      return;
    }

    // ===== Guardar sesión activa =====
    const usuario = {
      usuario: email.split("@")[0],
      email: email
    };
    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

    // Mostrar mensaje de éxito y redirigir
    mensaje.style.color = "green";
    mensaje.textContent = "✅ Inicio de sesión exitoso. Redirigiendo...";
    setTimeout(() => {
      location.href = "PanelAdministrador.html";
    }, 1500);
  });
});

// ===== Función para cerrar sesión =====
function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  location.reload();
}
