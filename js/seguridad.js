// ======================= SEGURIDAD =======================
// Funciones de seguridad: hash de contraseñas y validaciones

// NOTA: En producción se debe usar bcrypt o similar
// Esta es una implementación básica para demostración

// Simulación de hash simple (NO usar en producción real)
// En producción: usar bcrypt, argon2, o scrypt
function hashPassword(password) {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('La contraseña debe ser una cadena de texto válida');
    }
    
    if (password.length === 0) {
      throw new Error('La contraseña no puede estar vacía');
    }
    
    // Simulación básica - En producción usar bcrypt
    // Ejemplo: bcrypt.hash(password, 10)
    
    // Para este proyecto usaremos una simulación simple
    // que al menos no guarda contraseñas en texto plano
    let hash = 0;
    const str = password + 'FerreterIA_Salt_2025';
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    
    // Convertir a string hexadecimal
    const hashString = Math.abs(hash).toString(16) + password.length.toString(16);
    
    if (!hashString || hashString.length === 0) {
      throw new Error('Error al generar el hash de la contraseña');
    }
    
    return hashString;
  } catch (error) {
    console.error('Error en hashPassword:', error);
    throw error; // Re-lanzar para que el código que llama pueda manejarlo
  }
}

// Verificar contraseña (comparar hash)
function verifyPassword(password, hash) {
  const newHash = hashPassword(password);
  return newHash === hash;
}

// Validar fortaleza de contraseña (versión más flexible)
function validarFortalezaPassword(password) {
  try {
    if (!password || typeof password !== 'string') {
      return {
        valido: false,
        errores: ['La contraseña debe ser una cadena de texto válida'],
        recomendaciones: [],
        fortaleza: 'desconocida'
      };
    }
    
    const errores = [];
    
    // Validación mínima: solo longitud
    if (password.length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Recomendaciones (no bloquean el registro)
    const recomendaciones = [];
    if (password.length < 8) {
      recomendaciones.push('Se recomienda usar al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
      recomendaciones.push('Se recomienda usar letras');
    }
    
    // Si hay errores críticos, retornar error
    if (errores.length > 0) {
      return {
        valido: false,
        errores: errores,
        recomendaciones: recomendaciones,
        fortaleza: calcularFortaleza(password)
      };
    }
    
    // Si solo hay recomendaciones, permitir pero mostrar advertencia
    if (recomendaciones.length > 0) {
      return {
        valido: true,
        errores: [],
        recomendaciones: recomendaciones,
        fortaleza: calcularFortaleza(password)
      };
    }
    
    return {
      valido: true,
      errores: [],
      recomendaciones: [],
      fortaleza: calcularFortaleza(password)
    };
  } catch (error) {
    console.error('Error en validarFortalezaPassword:', error);
    // Retornar validación básica en caso de error
    return {
      valido: password && password.length >= 6,
      errores: password && password.length < 6 ? ['La contraseña debe tener al menos 6 caracteres'] : [],
      recomendaciones: [],
      fortaleza: 'desconocida'
    };
  }
}

// Calcular fortaleza de contraseña
function calcularFortaleza(password) {
  let puntuacion = 0;
  
  if (password.length >= 8) puntuacion += 1;
  if (password.length >= 12) puntuacion += 1;
  if (/[A-Z]/.test(password)) puntuacion += 1;
  if (/[a-z]/.test(password)) puntuacion += 1;
  if (/[0-9]/.test(password)) puntuacion += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) puntuacion += 1;
  
  if (puntuacion <= 2) return 'débil';
  if (puntuacion <= 4) return 'media';
  return 'fuerte';
}

// Sanitizar y validar entrada de usuario
function sanitizarInput(input) {
  try {
    if (input === null || input === undefined) return '';
    if (typeof input !== 'string') {
      // Convertir a string si es posible
      return String(input).trim();
    }
    
    // Eliminar espacios al inicio y final
    let sanitized = input.trim();
    
    // Eliminar caracteres peligrosos para XSS
    sanitized = sanitized.replace(/[<>]/g, '');
    
    return sanitized;
  } catch (error) {
    console.error('Error en sanitizarInput:', error);
    return '';
  }
}

// Validar email
function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generar token simple (para sesiones)
function generarTokenSesion() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validar token de sesión
function validarTokenSesion(token) {
  // Validación básica - en producción usar JWT
  return token && token.length > 10;
}


