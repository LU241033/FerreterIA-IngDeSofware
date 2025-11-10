// ======================= GESTIÓN DE CORREO ELECTRÓNICO =======================
// Módulo para enviar correos de confirmación de compra
// Utiliza EmailJS para envío desde el frontend (sin necesidad de backend)

/**
 * ========================================
 * CONFIGURACIÓN DE EMAILJS
 * ========================================
 * 
 * Para usar EmailJS:
 * 1. Crear cuenta en https://www.emailjs.com/
 * 2. Crear un servicio de email (Gmail, Outlook, etc.)
 * 3. Crear una plantilla de email
 * 4. Obtener tu Public Key, Service ID y Template ID
 * 5. Reemplazar los valores en CONFIG_EMAILJS abajo
 * 
 * Si no quieres usar EmailJS, la función enviarEmailConfirmacion
 * mostrará un mensaje simulando el envío (útil para desarrollo)
 */

const CONFIG_EMAILJS = {
  // Cambiar estos valores por los tuyos de EmailJS
  PUBLIC_KEY: 'TU_PUBLIC_KEY_AQUI', // Tu Public Key de EmailJS
  SERVICE_ID: 'TU_SERVICE_ID_AQUI', // ID del servicio de email
  TEMPLATE_ID: 'TU_TEMPLATE_ID_AQUI', // ID de la plantilla de email
  
  // Email de la empresa (remitente)
  EMAIL_EMPRESA: 'info@ferreteria.com',
  NOMBRE_EMPRESA: 'FerreterIA'
};

/**
 * ========================================
 * VERIFICAR SI EMAILJS ESTÁ CONFIGURADO
 * ========================================
 */
function emailJSConfigurado() {
  return (
    typeof emailjs !== 'undefined' &&
    CONFIG_EMAILJS.PUBLIC_KEY !== 'TU_PUBLIC_KEY_AQUI' &&
    CONFIG_EMAILJS.SERVICE_ID !== 'TU_SERVICE_ID_AQUI' &&
    CONFIG_EMAILJS.TEMPLATE_ID !== 'TU_TEMPLATE_ID_AQUI'
  );
}

/**
 * ========================================
 * ENVIAR CORREO DE CONFIRMACIÓN DE COMPRA
 * ========================================
 * 
 * Envía un correo electrónico de confirmación al cliente después de una compra exitosa.
 * 
 * @param {Object} datosCompra - Objeto con los datos de la compra
 *   - datosCompra.nombre: {string} Nombre del cliente
 *   - datosCompra.email: {string} Email del cliente
 *   - datosCompra.telefono: {string} Teléfono del cliente
 *   - datosCompra.direccion: {string} Dirección de envío
 *   - datosCompra.ciudad: {string} Ciudad de envío
 *   - datosCompra.codigoPostal: {string} Código postal
 *   - datosCompra.metodoPago: {string} Método de pago seleccionado
 *   - datosCompra.notas: {string} Notas adicionales
 *   - datosCompra.items: {Array} Array de productos comprados
 *   - datosCompra.total: {number} Total de la compra
 *   - datosCompra.fecha: {string} Fecha de la compra (ISO string)
 * 
 * @returns {Promise<Object>} Promesa que resuelve con { exito: boolean, mensaje: string }
 * 
 * EJEMPLO DE USO:
 * enviarEmailConfirmacion(datosCompra)
 *   .then(resultado => {
 *     if (resultado.exito) {
 *       console.log('Correo enviado:', resultado.mensaje);
 *     } else {
 *       console.error('Error:', resultado.mensaje);
 *     }
 *   });
 */
async function enviarEmailConfirmacion(datosCompra) {
  try {
    // Validar que tenemos un email válido
    if (!datosCompra.email || !datosCompra.email.includes('@')) {
      return {
        exito: false,
        mensaje: 'Email inválido. No se pudo enviar la confirmación.'
      };
    }

    // Formatear la lista de productos para el correo
    const listaProductos = datosCompra.items.map(item => {
      const producto = item.producto;
      const precioUnitario = gestorProductos.formatearPrecio(producto.precio);
      const subtotal = gestorProductos.formatearPrecio(item.subtotal);
      
      return `
        • ${producto.nombre}
          Cantidad: ${item.cantidad}
          Precio unitario: ${precioUnitario}
          Subtotal: ${subtotal}
      `;
    }).join('\n');

    // Formatear el total
    const totalFormateado = gestorProductos.formatearPrecio(datosCompra.total);

    // Formatear la fecha
    const fechaFormateada = new Date(datosCompra.fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Preparar datos para el correo
    const datosEmail = {
      // Datos del cliente
      nombre_cliente: datosCompra.nombre,
      email_cliente: datosCompra.email,
      telefono_cliente: datosCompra.telefono,
      
      // Datos de envío
      direccion_envio: datosCompra.direccion,
      ciudad_envio: datosCompra.ciudad,
      codigo_postal: datosCompra.codigoPostal || 'No especificado',
      
      // Datos de la compra
      fecha_compra: fechaFormateada,
      metodo_pago: datosCompra.metodoPago,
      total_compra: totalFormateado,
      numero_productos: datosCompra.items.length,
      
      // Lista de productos (formateada)
      lista_productos: listaProductos,
      
      // Notas adicionales
      notas_adicionales: datosCompra.notas || 'Ninguna',
      
      // Datos de la empresa
      nombre_empresa: CONFIG_EMAILJS.NOMBRE_EMPRESA,
      email_empresa: CONFIG_EMAILJS.EMAIL_EMPRESA
    };

    // Intentar enviar con EmailJS si está configurado
    if (emailJSConfigurado()) {
      // Inicializar EmailJS si no está inicializado
      if (!emailjs.init) {
        emailjs.init(CONFIG_EMAILJS.PUBLIC_KEY);
      }

      // Enviar el correo usando EmailJS
      const resultado = await emailjs.send(
        CONFIG_EMAILJS.SERVICE_ID,
        CONFIG_EMAILJS.TEMPLATE_ID,
        datosEmail
      );

      if (resultado.status === 200) {
        return {
          exito: true,
          mensaje: 'Correo de confirmación enviado exitosamente'
        };
      } else {
        throw new Error('Error al enviar correo con EmailJS');
      }
    } else {
      // Modo simulación (para desarrollo sin EmailJS configurado)
      console.log('📧 [SIMULACIÓN] Correo de confirmación que se enviaría:');
      console.log('==========================================');
      console.log('Para:', datosCompra.email);
      console.log('Asunto: Confirmación de compra - FerreterIA');
      console.log('==========================================');
      console.log('Estimado/a', datosCompra.nombre + ',');
      console.log('');
      console.log('Gracias por tu compra en FerreterIA.');
      console.log('');
      console.log('Detalles de tu pedido:');
      console.log('Fecha:', fechaFormateada);
      console.log('Total:', totalFormateado);
      console.log('Método de pago:', datosCompra.metodoPago);
      console.log('');
      console.log('Productos:');
      console.log(listaProductos);
      console.log('');
      console.log('Dirección de envío:');
      console.log(datosCompra.direccion);
      console.log(datosCompra.ciudad, datosCompra.codigoPostal);
      console.log('');
      console.log('Te contactaremos pronto para confirmar los detalles de entrega.');
      console.log('');
      console.log('Saludos,');
      console.log('Equipo FerreterIA');
      console.log('==========================================');

      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        exito: true,
        mensaje: 'Correo de confirmación simulado (modo desarrollo)',
        simulacion: true
      };
    }
  } catch (error) {
    console.error('Error al enviar correo de confirmación:', error);
    return {
      exito: false,
      mensaje: `Error al enviar correo: ${error.message || 'Error desconocido'}`
    };
  }
}

/**
 * ========================================
 * GENERAR RESUMEN DE COMPRA PARA CORREO
 * ========================================
 * 
 * Genera un resumen formateado de la compra para incluir en el correo.
 * 
 * @param {Object} datosCompra - Datos de la compra
 * @returns {string} Resumen formateado en HTML/texto plano
 */
function generarResumenCompra(datosCompra) {
  const items = datosCompra.items.map(item => {
    const producto = item.producto;
    return `${item.cantidad}x ${producto.nombre} - ${gestorProductos.formatearPrecio(item.subtotal)}`;
  }).join('\n');

  return `
RESUMEN DE COMPRA
==================
Fecha: ${new Date(datosCompra.fecha).toLocaleDateString('es-CO')}
Total: ${gestorProductos.formatearPrecio(datosCompra.total)}
Método de pago: ${datosCompra.metodoPago}

PRODUCTOS:
${items}

DIRECCIÓN DE ENVÍO:
${datosCompra.direccion}
${datosCompra.ciudad} ${datosCompra.codigoPostal || ''}
  `.trim();
}


