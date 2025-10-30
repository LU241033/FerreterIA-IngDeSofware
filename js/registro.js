document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const nombres = document.getElementById("nombres").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;
    const terminos = document.getElementById("terminos").checked;

    // ✅ Validar campos vacíos (ya sin tipoCuenta)
    if (!nombres || !apellidos || !email || !password || !confirmar) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Validar que el correo contenga '@' y termine en '.com'
    if (!email.includes("@") || !email.endsWith(".com")) {
      alert("El correo debe contener '@' y terminar en '.com'.");
      return;
    }

    // Validar contraseñas
    if (password !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Validar aceptación de términos
    if (!terminos) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }

    // Verificar si ya existe el usuario
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const existe = usuarios.find(u => u.email === email);

    if (existe) {
      alert("Ya existe una cuenta registrada con este correo.");
      return;
    }

    // Crear objeto usuario
    const nuevoUsuario = {
      nombres,
      apellidos,
      email,
      password
    };

    // Guardar el nuevo usuario
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Cuenta creada exitosamente. Redirigiendo al inicio de sesión...");
    location.href = "Login.html";
  });
});
