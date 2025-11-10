// ======================= REGISTRO.JS =======================
document.addEventListener("DOMContentLoaded", () => {
  // Cargar utilidades
  if (typeof mostrarMensaje === 'undefined') {
    console.error('utils.js debe cargarse antes de registro.js');
  }

  const form = document.getElementById("formRegistro");
  if (!form) {
    console.error('Formulario de registro no encontrado');
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Verificar que las funciones estén disponibles
    if (typeof sanitizarInput === 'undefined') {
      console.error('sanitizarInput no está definido. Asegúrate de cargar security.js');
      alert('Error: Falta cargar security.js. Por favor, recarga la página.');
      return;
    }

    if (typeof validarEmail === 'undefined') {
      console.error('validarEmail no está definido. Asegúrate de cargar security.js');
      alert('Error: Falta cargar security.js. Por favor, recarga la página.');
      return;
    }

    if (typeof hashPassword === 'undefined') {
      console.error('hashPassword no está definido. Asegúrate de cargar security.js');
      alert('Error: Falta cargar security.js. Por favor, recarga la página.');
      return;
    }

    if (typeof mostrarMensaje === 'undefined') {
      console.error('mostrarMensaje no está definido. Asegúrate de cargar utils.js');
      alert('Error: Falta cargar utils.js. Por favor, recarga la página.');
      return;
    }

    try {
      // ===== Obtener valores del formulario =====
      const nombresInput = document.getElementById("nombres");
      const apellidosInput = document.getElementById("apellidos");
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const confirmarInput = document.getElementById("confirmar");
      const terminosInput = document.getElementById("terminos");
      
      // Validar que los elementos existan
      if (!nombresInput || !apellidosInput || !emailInput || !passwordInput || !confirmarInput || !terminosInput) {
        console.error('Algunos elementos del formulario no se encontraron');
        mostrarMensaje("❌ Error: Formulario incompleto. Por favor, recarga la página.", "error");
        return;
      }
      
      const nombres = sanitizarInput(nombresInput.value || '');
      const apellidos = sanitizarInput(apellidosInput.value || '');
      const email = sanitizarInput(emailInput.value || '');
      const password = passwordInput.value || '';
      const confirmar = confirmarInput.value || '';
      const terminos = terminosInput.checked || false;

      console.log('Intentando registrar usuario:', { 
        nombres: nombres ? nombres.substring(0, 10) + '...' : 'vacío',
        email: email ? email.substring(0, 10) + '...' : 'vacío',
        passwordLength: password ? password.length : 0,
        emailType: typeof email,
        emailIsString: typeof email === 'string'
      });

      // ===== Validar campos vacíos =====
      if (!nombres || nombres.length === 0) {
        mostrarMensaje("⚠️ El campo Nombres es requerido.", "warning");
        return;
      }
      
      if (!apellidos || apellidos.length === 0) {
        mostrarMensaje("⚠️ El campo Apellidos es requerido.", "warning");
        return;
      }
      
      if (!email || email.length === 0) {
        mostrarMensaje("⚠️ El campo Email es requerido.", "warning");
        return;
      }
      
      if (!password || password.length === 0) {
        mostrarMensaje("⚠️ El campo Contraseña es requerido.", "warning");
        return;
      }
      
      if (!confirmar || confirmar.length === 0) {
        mostrarMensaje("⚠️ El campo Confirmar contraseña es requerido.", "warning");
        return;
      }

      // ===== Validar correo =====
      if (!validarEmail(email)) {
        mostrarMensaje("⚠️ Ingresa un correo electrónico válido.", "warning");
        return;
      }

      // ===== Validar contraseñas =====
      if (password !== confirmar) {
        mostrarMensaje("⚠️ Las contraseñas no coinciden.", "error");
        return;
      }

      // ===== Validar fortaleza de contraseña =====
      if (typeof validarFortalezaPassword === 'undefined') {
        console.error('validarFortalezaPassword no está definido');
        // Validación básica sin la función
        if (password.length < 6) {
          mostrarMensaje("⚠️ La contraseña debe tener al menos 6 caracteres.", "error");
          return;
        }
      } else {
        try {
          const validacionPassword = validarFortalezaPassword(password);
          if (!validacionPassword || !validacionPassword.valido) {
            const errores = validacionPassword?.errores || ['La contraseña no cumple los requisitos mínimos'];
            mostrarMensaje("⚠️ " + errores.join(", "), "error");
            return;
          }
          
          // Mostrar recomendaciones si existen (no bloquean)
          if (validacionPassword.recomendaciones && validacionPassword.recomendaciones.length > 0) {
            console.log('Recomendaciones de contraseña:', validacionPassword.recomendaciones.join(", "));
          }
        } catch (validacionError) {
          console.error('Error en validación de contraseña:', validacionError);
          // Validación básica de respaldo
          if (password.length < 6) {
            mostrarMensaje("⚠️ La contraseña debe tener al menos 6 caracteres.", "error");
            return;
          }
        }
      }

      // ===== Validar aceptación de términos =====
      if (!terminos) {
        mostrarMensaje("⚠️ Debes aceptar los términos y condiciones.", "warning");
        return;
      }

      // ===== Verificar si ya existe el usuario =====
      let usuarios = [];
      try {
        const usuariosStr = localStorage.getItem("usuarios");
        usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];
      } catch (error) {
        console.error('Error al leer usuarios:', error);
        mostrarMensaje("❌ Error al acceder a los datos. Por favor, recarga la página.", "error");
        return;
      }

      // Verificar si ya existe el usuario (con validación de email)
      const existe = usuarios.find(u => {
        // Validar que tanto el usuario almacenado como el nuevo email existan
        if (!u || !u.email || typeof u.email !== 'string') return false;
        if (!email || typeof email !== 'string') return false;
        return u.email.toLowerCase() === email.toLowerCase();
      });
      
      if (existe) {
        mostrarMensaje("⚠️ Ya existe una cuenta registrada con este correo.", "warning");
        return;
      }

      // ===== Crear nuevo usuario con contraseña hasheada =====
      console.log('Creando usuario...');
      let passwordHash;
      
      if (typeof hashPassword === 'undefined') {
        console.error('hashPassword no está definido');
        mostrarMensaje("❌ Error: Funciones de seguridad no cargadas. Por favor, recarga la página.", "error");
        return;
      }
      
      try {
        if (!password || password.length === 0) {
          throw new Error('La contraseña está vacía');
        }
        passwordHash = hashPassword(password);
        
        if (!passwordHash || passwordHash.length === 0) {
          throw new Error('El hash de la contraseña está vacío');
        }
        
        console.log('Contraseña hasheada correctamente, longitud del hash:', passwordHash.length);
      } catch (hashError) {
        console.error('Error al hashear contraseña:', hashError);
        console.error('Error details:', {
          message: hashError.message,
          name: hashError.name,
          stack: hashError.stack
        });
        mostrarMensaje("❌ Error al procesar la contraseña: " + (hashError.message || 'Error desconocido'), "error");
        return;
      }
      
      // Validar que email no esté vacío antes de usar toLowerCase
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        mostrarMensaje("❌ El email no es válido. Por favor, verifica los datos.", "error");
        return;
      }
      
      const nuevoUsuario = {
        nombres: nombres || '',
        apellidos: apellidos || '',
        email: email.trim().toLowerCase(),
        password: passwordHash, // 🔐 Contraseña hasheada
        rol: usuarios.length === 0 ? "admin" : "usuario",
        fechaRegistro: new Date().toISOString()
      };
      
      console.log('Usuario creado (sin password):', { ...nuevoUsuario, password: '***' });

      // ===== Guardar usuario =====
      console.log('Guardando usuario en localStorage...');
      usuarios.push(nuevoUsuario);
      
      try {
        const usuariosJSON = JSON.stringify(usuarios);
        console.log('JSON generado, tamaño:', usuariosJSON.length);
        localStorage.setItem("usuarios", usuariosJSON);
        console.log('Usuario guardado exitosamente');
        
        mostrarMensaje("✅ Cuenta creada exitosamente. Redirigiendo al inicio de sesión...", "success");
        
        setTimeout(() => {
          window.location.href = "/html/iniciar-sesion.html";
        }, 1500);
      } catch (error) {
        console.error('Error al guardar usuario:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        let mensaje = "❌ Error al guardar la cuenta. ";
        if (error.name === 'QuotaExceededError') {
          mensaje += "Espacio de almacenamiento insuficiente. Limpia el localStorage.";
        } else {
          mensaje += "Detalles: " + error.message;
        }
        
        mostrarMensaje(mensaje, "error");
      }
    } catch (error) {
      console.error('Error en registro:', error);
      console.error('Stack trace:', error.stack);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        tipo: typeof error
      });
      
      // Mostrar mensaje más específico
      let mensajeError = "❌ Ocurrió un error inesperado. ";
      
      if (error.message) {
        mensajeError += "Detalles: " + error.message;
      } else if (error.name) {
        mensajeError += "Tipo: " + error.name;
      } else {
        mensajeError += "Por favor, intenta nuevamente.";
      }
      
      // Si mostrarMensaje no está disponible, usar alert
      if (typeof mostrarMensaje !== 'undefined') {
        mostrarMensaje(mensajeError, "error");
      } else {
        alert(mensajeError + "\n\nRevisa la consola (F12) para más detalles.");
      }
    }
  });
});
