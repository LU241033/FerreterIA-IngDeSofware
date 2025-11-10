// ======================= GESTIÓN DE CARRITO DE COMPRAS =======================
// Sistema de carrito de compras usando localStorage

class GestorCarrito {
  constructor() {
    this.storageKey = 'carrito';
    this.init();
  }

  // Inicializar carrito vacío si no existe
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Obtener todos los items del carrito
  obtenerItems() {
    try {
      const carrito = localStorage.getItem(this.storageKey);
      if (!carrito) return [];
      return JSON.parse(carrito);
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      localStorage.setItem(this.storageKey, JSON.stringify([]));
      return [];
    }
  }

  // Agregar producto al carrito
  agregarProducto(productoId, cantidad = 1) {
    const producto = gestorProductos.obtenerPorId(productoId);
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    if (producto.stock < cantidad) {
      throw new Error(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`);
    }

    const items = this.obtenerItems();
    const itemExistente = items.find(item => item.productoId === productoId);

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (producto.stock < nuevaCantidad) {
        throw new Error(`Stock insuficiente. Solo puedes agregar ${producto.stock - itemExistente.cantidad} unidades más`);
      }
      itemExistente.cantidad = nuevaCantidad;
    } else {
      items.push({
        productoId: productoId,
        cantidad: cantidad,
        agregadoEn: new Date().toISOString()
      });
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.actualizarContadorCarrito();
    return true;
  }

  // Eliminar producto del carrito
  eliminarProducto(productoId) {
    const items = this.obtenerItems();
    const itemsFiltrados = items.filter(item => item.productoId !== productoId);
    localStorage.setItem(this.storageKey, JSON.stringify(itemsFiltrados));
    this.actualizarContadorCarrito();
    return true;
  }

  // Actualizar cantidad de un producto
  actualizarCantidad(productoId, cantidad) {
    if (cantidad <= 0) {
      return this.eliminarProducto(productoId);
    }

    const producto = gestorProductos.obtenerPorId(productoId);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    if (producto.stock < cantidad) {
      throw new Error(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`);
    }

    const items = this.obtenerItems();
    const item = items.find(item => item.productoId === productoId);
    
    if (item) {
      item.cantidad = cantidad;
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.actualizarContadorCarrito();
      return true;
    }

    return false;
  }

  // Limpiar carrito
  limpiar() {
    localStorage.setItem(this.storageKey, JSON.stringify([]));
    this.actualizarContadorCarrito();
    return true;
  }

  // Obtener items con información completa del producto
  obtenerItemsCompletos() {
    const items = this.obtenerItems();
    return items.map(item => {
      const producto = gestorProductos.obtenerPorId(item.productoId);
      if (!producto) {
        return null;
      }
      return {
        ...item,
        producto: producto,
        subtotal: producto.precio * item.cantidad
      };
    }).filter(item => item !== null);
  }

  // Obtener total del carrito
  obtenerTotal() {
    const items = this.obtenerItemsCompletos();
    return items.reduce((total, item) => total + item.subtotal, 0);
  }

  // Obtener cantidad total de items
  obtenerCantidadTotal() {
    const items = this.obtenerItems();
    return items.reduce((total, item) => total + item.cantidad, 0);
  }

  // Verificar si el carrito está vacío
  estaVacio() {
    return this.obtenerItems().length === 0;
  }

  // Actualizar contador de carrito en la UI
  // Solo muestra el contador si hay una sesión activa de USUARIO (NO administrador)
  actualizarContadorCarrito() {
    // Verificar si hay sesión activa y que NO sea administrador
    const usuario = typeof verificarAutenticacion === 'function' ? verificarAutenticacion() : null;
    
    if (!usuario) {
      // Si no hay sesión, ocultar todos los contadores
      const contadores = document.querySelectorAll('.contador-carrito');
      contadores.forEach(contador => {
        contador.style.display = 'none';
      });
      return;
    }

    // Si es administrador, ocultar el contador (los admins no pueden comprar)
    if (usuario.rol === 'admin') {
      const contadores = document.querySelectorAll('.contador-carrito');
      contadores.forEach(contador => {
        contador.style.display = 'none';
      });
      return;
    }

    const cantidad = this.obtenerCantidadTotal();
    const contadores = document.querySelectorAll('.contador-carrito');
    
    contadores.forEach(contador => {
      if (cantidad > 0) {
        contador.textContent = cantidad;
        contador.style.display = 'inline-block';
      } else {
        contador.style.display = 'none';
      }
    });
  }

  // Validar stock antes de checkout
  validarStock() {
    const items = this.obtenerItemsCompletos();
    const errores = [];

    items.forEach(item => {
      const producto = gestorProductos.obtenerPorId(item.productoId);
      if (!producto) {
        errores.push(`El producto "${item.producto.nombre}" ya no está disponible`);
      } else if (producto.stock < item.cantidad) {
        errores.push(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`);
      }
    });

    return {
      valido: errores.length === 0,
      errores: errores
    };
  }
}

// Instancia global del gestor de carrito
const gestorCarrito = new GestorCarrito();

