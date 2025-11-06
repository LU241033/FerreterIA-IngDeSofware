// ======================= GESTIÓN DE PRODUCTOS =======================
// Módulo centralizado para el CRUD de productos usando localStorage

class GestorProductos {
  constructor() {
    this.storageKey = 'productos';
    this.contadorIdKey = 'productoContadorId';
    this.init();
  }

  // Inicializar: cargar productos o crear array vacío
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
      localStorage.setItem(this.contadorIdKey, '0');
    }
  }

  // Obtener todos los productos
  obtenerTodos() {
    try {
      const productos = localStorage.getItem(this.storageKey);
      if (!productos) return [];
      return JSON.parse(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      // Limpiar datos corruptos
      localStorage.removeItem(this.storageKey);
      localStorage.setItem(this.storageKey, JSON.stringify([]));
      return [];
    }
  }

  // Obtener un producto por ID
  obtenerPorId(id) {
    const productos = this.obtenerTodos();
    return productos.find(p => p.id === id);
  }

  // Buscar productos por criterio
  buscar(criterio, valor) {
    const productos = this.obtenerTodos();
    const valorLower = valor.toLowerCase();

    switch(criterio) {
      case 'id':
        return productos.filter(p => p.id.toLowerCase().includes(valorLower));
      case 'nombre':
        return productos.filter(p => p.nombre.toLowerCase().includes(valorLower));
      case 'categoria':
        return productos.filter(p => p.categoria.toLowerCase().includes(valorLower));
      default:
        return productos;
    }
  }

  // Crear nuevo producto
  crear(producto) {
    const productos = this.obtenerTodos();
    
    // Validar que no exista un producto con el mismo nombre
    const existe = productos.find(p => p.nombre.toLowerCase() === producto.nombre.toLowerCase());
    if (existe) {
      throw new Error('Ya existe un producto con ese nombre');
    }

    // Generar ID único
    let contador = parseInt(localStorage.getItem(this.contadorIdKey) || '0');
    contador++;
    const nuevoId = String(contador).padStart(3, '0');

    const nuevoProducto = {
      id: nuevoId,
      nombre: producto.nombre.trim(),
      categoria: producto.categoria.trim(),
      precio: parseFloat(producto.precio),
      stock: parseInt(producto.stock),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    productos.push(nuevoProducto);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(productos));
      localStorage.setItem(this.contadorIdKey, String(contador));
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw new Error('No se pudo guardar el producto. Espacio de almacenamiento insuficiente.');
    }

    return nuevoProducto;
  }

  // Actualizar producto existente
  actualizar(id, datosActualizados) {
    if (!id) {
      throw new Error('ID de producto es requerido');
    }

    const productos = this.obtenerTodos();
    const indice = productos.findIndex(p => p.id === id);

    if (indice === -1) {
      throw new Error('Producto no encontrado');
    }

    // Mantener datos originales no modificados
    const productoActual = productos[indice];
    const productoActualizado = {
      ...productoActual,
      ...datosActualizados,
      id: productoActual.id, // No permitir cambiar el ID
      fechaActualizacion: new Date().toISOString()
    };

    // Validar nombre único si se cambió
    if (datosActualizados.nombre && datosActualizados.nombre.toLowerCase() !== productoActual.nombre.toLowerCase()) {
      const existeOtro = productos.find((p, i) => 
        i !== indice && p.nombre.toLowerCase() === datosActualizados.nombre.toLowerCase()
      );
      if (existeOtro) {
        throw new Error('Ya existe otro producto con ese nombre');
      }
      productoActualizado.nombre = datosActualizados.nombre.trim();
    }

    if (datosActualizados.categoria) {
      productoActualizado.categoria = datosActualizados.categoria.trim();
    }
    if (datosActualizados.precio !== undefined) {
      productoActualizado.precio = parseFloat(datosActualizados.precio);
    }
    if (datosActualizados.stock !== undefined) {
      productoActualizado.stock = parseInt(datosActualizados.stock);
    }

    productos[indice] = productoActualizado;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(productos));
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw new Error('No se pudo actualizar el producto. Espacio de almacenamiento insuficiente.');
    }

    return productoActualizado;
  }

  // Eliminar producto
  eliminar(id) {
    if (!id) {
      throw new Error('ID de producto es requerido');
    }

    const productos = this.obtenerTodos();
    const productosFiltrados = productos.filter(p => p.id !== id);

    if (productos.length === productosFiltrados.length) {
      throw new Error('Producto no encontrado');
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(productosFiltrados));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw new Error('No se pudo eliminar el producto. Espacio de almacenamiento insuficiente.');
    }

    return true;
  }

  // Obtener estadísticas
  obtenerEstadisticas() {
    const productos = this.obtenerTodos();
    const stockBajo = productos.filter(p => p.stock < 5).length;
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const valorInventario = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);

    return {
      total: productos.length,
      stockBajo,
      categorias: categorias.length,
      valorInventario: valorInventario.toFixed(2)
    };
  }

  // Determinar estado del stock
  obtenerEstadoStock(stock) {
    if (stock < 5) return { estado: 'bajo', texto: 'Bajo', clase: 'stock-bajo' };
    if (stock < 15) return { estado: 'medio', texto: 'Medio', clase: 'stock-medio' };
    return { estado: 'alto', texto: 'Alto', clase: 'stock-alto' };
  }

  // Formatear precio
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}

// Instancia global del gestor
const gestorProductos = new GestorProductos();

