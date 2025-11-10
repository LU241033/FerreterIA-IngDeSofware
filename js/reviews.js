// ======================= GESTIÓN DE OPINIONES Y CALIFICACIONES =======================
// Sistema de opiniones y calificaciones para productos usando localStorage

class GestorOpiniones {
  constructor() {
    this.storageKey = 'opiniones';
    this.init();
  }

  // Inicializar: crear estructura de opiniones si no existe
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({}));
    }
  }

  // Obtener todas las opiniones de un producto
  // Las opiniones son públicas y accesibles sin sesión
  obtenerOpiniones(productoId) {
    try {
      if (!productoId) {
        return [];
      }

      const opinionesStr = localStorage.getItem(this.storageKey);
      if (!opinionesStr) {
        return [];
      }

      const opiniones = JSON.parse(opinionesStr);
      const opinionesProducto = opiniones[productoId] || [];
      
      // Ordenar por fecha (más recientes primero)
      return opinionesProducto.sort((a, b) => {
        const fechaA = new Date(a.fecha || a.fechaCreacion || 0);
        const fechaB = new Date(b.fecha || b.fechaCreacion || 0);
        return fechaB - fechaA; // Más recientes primero
      });
    } catch (error) {
      console.error('Error al obtener opiniones:', error);
      // Si hay error, intentar recuperar datos corruptos
      try {
        localStorage.removeItem(this.storageKey);
        localStorage.setItem(this.storageKey, JSON.stringify({}));
      } catch (e) {
        console.error('Error al limpiar opiniones corruptas:', e);
      }
      return [];
    }
  }

  // Agregar una nueva opinión
  // Las opiniones se guardan permanentemente en localStorage y NO requieren sesión
  agregarOpinion(productoId, opinion) {
    try {
      // Validar parámetros
      if (!productoId || !opinion) {
        throw new Error('Producto ID y opinión son requeridos');
      }

      if (!opinion.nombreUsuario || !opinion.comentario || !opinion.calificacion) {
        throw new Error('Todos los campos de la opinión son requeridos');
      }

      // Obtener opiniones existentes o crear objeto vacío
      let opiniones = {};
      try {
        const opinionesStr = localStorage.getItem(this.storageKey);
        if (opinionesStr) {
          opiniones = JSON.parse(opinionesStr);
        }
      } catch (error) {
        console.warn('Error al leer opiniones existentes, creando nueva estructura:', error);
        opiniones = {};
      }
      
      // Si no existe el producto, crear array vacío
      if (!opiniones[productoId]) {
        opiniones[productoId] = [];
      }

      // Validar calificación antes de crear la opinión
      const calificacionNum = parseInt(opinion.calificacion);
      if (isNaN(calificacionNum) || calificacionNum < 1 || calificacionNum > 5) {
        throw new Error('La calificación debe estar entre 1 y 5 estrellas');
      }

      // Crear nueva opinión con ID único más robusto
      const nuevaOpinion = {
        id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ID único más robusto
        productoId: productoId, // Guardar también el ID del producto para referencia
        nombreUsuario: opinion.nombreUsuario.trim(),
        comentario: opinion.comentario.trim(),
        calificacion: calificacionNum, // 1-5 estrellas
        fecha: new Date().toISOString(),
        fechaFormateada: new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      // Validar que el nombre y comentario no estén vacíos después del trim
      if (nuevaOpinion.nombreUsuario.length === 0) {
        throw new Error('El nombre de usuario no puede estar vacío');
      }

      if (nuevaOpinion.comentario.length === 0) {
        throw new Error('El comentario no puede estar vacío');
      }

      // Agregar la opinión al array del producto
      opiniones[productoId].push(nuevaOpinion);

      // Guardar en localStorage con manejo de errores
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(opiniones));
        console.log('✅ Opinión guardada exitosamente en localStorage');
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        if (error.name === 'QuotaExceededError') {
          throw new Error('No hay suficiente espacio de almacenamiento. Por favor, libera espacio y intenta nuevamente.');
        }
        throw new Error('Error al guardar la opinión. Por favor, intenta nuevamente.');
      }

      return nuevaOpinion;
    } catch (error) {
      console.error('Error al agregar opinión:', error);
      throw error;
    }
  }

  // Calcular calificación promedio de un producto
  calcularCalificacionPromedio(productoId) {
    const opiniones = this.obtenerOpiniones(productoId);
    
    if (opiniones.length === 0) {
      return 0; // Sin calificaciones
    }

    const suma = opiniones.reduce((total, opinion) => total + opinion.calificacion, 0);
    const promedio = suma / opiniones.length;
    
    // Redondear a 1 decimal
    return Math.round(promedio * 10) / 10;
  }

  // Obtener calificación promedio formateada (con estrellas)
  obtenerCalificacionPromedioFormateada(productoId) {
    const promedio = this.calcularCalificacionPromedio(productoId);
    return this.formatearCalificacion(promedio);
  }

  // Formatear calificación con estrellas (⭐)
  formatearCalificacion(calificacion) {
    if (calificacion === 0) {
      return { promedio: 0, estrellas: 'Sin calificaciones', estrellasHTML: '<span style="color: #ccc;">Sin calificaciones</span>' };
    }

    const estrellasLlenas = Math.floor(calificacion);
    const tieneMediaEstrella = calificacion % 1 >= 0.5;
    const estrellasVacias = 5 - estrellasLlenas - (tieneMediaEstrella ? 1 : 0);

    let estrellasHTML = '';
    
    // Estrellas llenas
    for (let i = 0; i < estrellasLlenas; i++) {
      estrellasHTML += '<span style="color: #fbbf24;">⭐</span>';
    }
    
    // Media estrella
    if (tieneMediaEstrella) {
      estrellasHTML += '<span style="color: #fbbf24;">⭐</span>';
    }
    
    // Estrellas vacías
    for (let i = 0; i < estrellasVacias; i++) {
      estrellasHTML += '<span style="color: #e5e7eb;">☆</span>';
    }

    return {
      promedio: calificacion,
      estrellas: `${calificacion.toFixed(1)}/5.0`,
      estrellasHTML: estrellasHTML,
      texto: `${calificacion.toFixed(1)} de 5 estrellas`
    };
  }

  // Obtener número total de opiniones de un producto
  obtenerNumeroOpiniones(productoId) {
    return this.obtenerOpiniones(productoId).length;
  }

  // Eliminar una opinión (opcional, para futuras funcionalidades)
  eliminarOpinion(productoId, opinionId) {
    try {
      const opiniones = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      
      if (!opiniones[productoId]) {
        throw new Error('No hay opiniones para este producto');
      }

      // Filtrar la opinión a eliminar
      const opinionesFiltradas = opiniones[productoId].filter(op => op.id !== opinionId);
      opiniones[productoId] = opinionesFiltradas;

      // Guardar en localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(opiniones));

      return true;
    } catch (error) {
      console.error('Error al eliminar opinión:', error);
      throw error;
    }
  }
}

// Instancia global del gestor de opiniones
const gestorOpiniones = new GestorOpiniones();

