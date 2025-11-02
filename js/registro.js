// ======================= REGISTRO.JS =======================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // ===== Obtener valores del formulario =====
    const nombres = document.getElementById("nombres").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;
    const terminos = document.getElementById("terminos").checked;

    // ===== Validar campos vacíos =====
    if (!nombres || !apellidos || !email || !password || !confirmar) {
      alert("⚠️ Por favor, completa todos los campos.");
      return;
    }

    // ===== Validar correo =====
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Permite más dominios (.com, .net, .co, etc.)
    if (!emailRegex.test(email)) {
      alert("⚠️ Ingresa un correo electrónico válido.");
      return;
    }

    // ===== Validar contraseñas =====
    if (password !== confirmar) {
      alert("⚠️ Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      alert("⚠️ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // ===== Validar aceptación de términos =====
    if (!terminos) {
      alert("⚠️ Debes aceptar los términos y condiciones.");
      return;
    }

    // ===== Verificar si ya existe el usuario =====
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const existe = usuarios.find(u => u.email === email);

    if (existe) {
      alert("⚠️ Ya existe una cuenta registrada con este correo.");
      return;
    }

    // ===== Crear nuevo usuario =====
    const nuevoUsuario = {
      nombres,
      apellidos,
      email,
      password,
      rol: usuarios.length === 0 ? "admin" : "usuario" // 🔹 El primer usuario será admin
    };

    // ===== Guardar usuario =====
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("✅ Cuenta creada exitosamente. Redirigiendo al inicio de sesión...");
    location.href = "login.html";
  });
});
