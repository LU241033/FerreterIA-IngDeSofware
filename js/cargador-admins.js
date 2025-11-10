// ======================= CARGADOR DE ADMINS =======================
// Carga los administradores desde admins.json y los integra con el sistema

async function cargarAdminsDesdeJSON() {
  try {
    // Intentar diferentes rutas posibles
    const rutas = [
      '/data/admins.json',
      '../data/admins.json',
      '../../data/admins.json',
      'data/admins.json'
    ];
    
    let response = null;
    for (const ruta of rutas) {
      try {
        response = await fetch(ruta);
        if (response.ok) break;
      } catch (e) {
        continue;
      }
    }
    
    if (!response || !response.ok) {
      console.warn('No se pudo cargar admins.json desde ninguna ruta');
      return [];
    }
    
    const admins = await response.json();
    return admins.filter(admin => admin.activo !== false);
  } catch (error) {
    console.error('Error al cargar admins.json:', error);
    return [];
  }
}

// Sincronizar admins del JSON con localStorage
async function sincronizarAdmins() {
  try {
    const adminsJSON = await cargarAdminsDesdeJSON();
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Para cada admin del JSON, verificar si existe en localStorage
    adminsJSON.forEach(adminJSON => {
      const existe = usuarios.find(u => u.email.toLowerCase() === adminJSON.email.toLowerCase());
      
      if (!existe) {
        // Crear nuevo usuario admin desde el JSON
        const nuevoAdmin = {
          nombres: adminJSON.email.split('@')[0].charAt(0).toUpperCase() + adminJSON.email.split('@')[0].slice(1),
          apellidos: 'Administrador',
          email: adminJSON.email.toLowerCase(),
          password: hashPassword(adminJSON.password), // Hashear la contraseña
          rol: 'admin',
          fechaRegistro: new Date().toISOString(),
          origen: 'admins.json'
        };
        
        usuarios.push(nuevoAdmin);
        console.log('✅ Admin cargado desde JSON:', adminJSON.email);
      } else {
        // Si existe pero no es admin, actualizar a admin
        if (existe.rol !== 'admin') {
          existe.rol = 'admin';
          console.log('✅ Usuario actualizado a admin:', existe.email);
        }
        
        // Si la contraseña está en texto plano (del JSON antiguo), actualizar a hash
        if (existe.password && existe.password.length < 50 && !existe.password.match(/^[a-f0-9]+$/)) {
          // Parece que es texto plano, actualizar a hash
          existe.password = hashPassword(adminJSON.password);
          console.log('✅ Contraseña actualizada a hash para:', existe.email);
        }
      }
    });
    
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return usuarios;
  } catch (error) {
    console.error('Error al sincronizar admins:', error);
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
  }
}

// Verificar login con admins del JSON (para compatibilidad)
async function verificarLoginConAdmins(email, password) {
  try {
    const adminsJSON = await cargarAdminsDesdeJSON();
    const adminEncontrado = adminsJSON.find(
      admin => admin.email.toLowerCase() === email.toLowerCase() && admin.activo !== false
    );
    
    if (adminEncontrado) {
      // Verificar contraseña
      if (adminEncontrado.password === password) {
        // Contraseña correcta (texto plano del JSON)
        // Sincronizar este admin a localStorage
        await sincronizarAdmins();
        return {
          nombres: adminEncontrado.email.split('@')[0].charAt(0).toUpperCase() + adminEncontrado.email.split('@')[0].slice(1),
          apellidos: 'Administrador',
          email: adminEncontrado.email.toLowerCase(),
          rol: 'admin'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al verificar login con admins:', error);
    return null;
  }
}

