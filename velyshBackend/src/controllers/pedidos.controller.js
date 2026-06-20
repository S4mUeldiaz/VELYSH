import { supabase } from '../config/supabase.js'

export const obtenerPedidos = async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id_pedido,
      referencia,
      fecha_pedido,
      precio_total,
      costo_envio,
      metodo_pago,
      estado_pago,
      estado_pedido,
      usuarios ( nombre, apellido, correo ),
      direcciones ( direccion, ciudad, departamento ),
      factura ( id_detalle, cantidad, precio_unitario, subtotal )
    `)
    .order('fecha_pedido', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const obtenerPedidoPorId = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id_pedido,
      referencia,
      fecha_pedido,
      fecha_estimada_entrega,
      fecha_entregado,
      precio_total,
      costo_envio,
      metodo_pago,
      estado_pago,
      estado_pedido,
      usuarios ( nombre, apellido, correo, telefono ),
      direcciones ( direccion, ciudad, departamento, codigo_postal ),
      factura (
        id_detalle,
        cantidad,
        precio_unitario,
        subtotal,
        stock (
          color,
          tallas ( talla ),
          productos ( nombre, referencia )
        )
      )
    `)
    .eq('id_pedido', id)
    .single()

  if (error) return res.status(404).json({ error: 'Pedido no encontrado' })

  return res.status(200).json(data)
}

export const obtenerPedidosPorUsuario = async (req, res) => {
  const { numero_documento } = req.params

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id_pedido,
      referencia,
      fecha_pedido,
      precio_total,
      estado_pago,
      estado_pedido,
      factura (
        id_detalle,
        cantidad,
        subtotal,
        stock (
          color,
          tallas ( talla ),
          productos ( nombre, referencia, imagenes_producto ( url_imagen, orden ) )
        )
      )
    `)
    .eq('numero_documento', numero_documento)
    .order('fecha_pedido', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearPedido = async (req, res) => {
  console.log('body recibido:', req.body)
  const { numero_documento, metodo_pago, costo_envio, items, direccion, ciudad, departamento, codigo_postal } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'El pedido no tiene productos' })
  }

  // 1. VALIDAR STOCK DISPONIBLE ANTES DE CREAR NADA
  // Se consulta el stock_actual real de cada id_stock solicitado y se compara
  // contra la cantidad pedida. Si algo falla, se aborta todo el pedido.
  const idsStock = items.map(item => item.id_stock)

  const { data: stocks, error: stockError } = await supabase
    .from('stock')
    .select('id_stock, stock_actual, stock_minimo, productos ( nombre )')
    .in('id_stock', idsStock)

  if (stockError) {
    console.log('error consultando stock:', stockError)
    return res.status(400).json({ error: stockError.message })
  }

  for (const item of items) {
    const variante = stocks.find(s => s.id_stock === item.id_stock)

    if (!variante) {
      return res.status(400).json({ error: `La variante de producto solicitada (id_stock ${item.id_stock}) no existe` })
    }

    if (item.cantidad > variante.stock_actual) {
      const nombreProducto = variante.productos?.nombre || 'producto'
      return res.status(400).json({
        error: `Stock insuficiente para "${nombreProducto}". Disponible: ${variante.stock_actual}, solicitado: ${item.cantidad}`
      })
    }
  }

  // 2. CREAR DIRECCIÓN
  const { data: dir, error: dirError } = await supabase
    .from('direcciones')
    .insert({
      numero_documento,
      direccion,
      ciudad: ciudad || 'Bogotá',
      departamento: departamento || 'Cundinamarca',
      codigo_postal: codigo_postal || ''
    })
    .select()
    .single()

  if (dirError) {
    console.log('error direccion:', dirError)
    return res.status(400).json({ error: dirError.message })
  }

  // 3. CREAR PEDIDO
  const precio_total = items.reduce((acc, item) => {
    return acc + item.cantidad * item.precio_unitario
  }, costo_envio || 0)

  const referencia = `VLY-${Date.now()}`

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      numero_documento,
      id_direccion: dir.id_direccion,
      referencia,
      precio_total,
      costo_envio: costo_envio || 0,
      metodo_pago,
      estado_pago: 'pendiente',
      estado_pedido: 'pendiente'
    })
    .select()
    .single()

  if (pedidoError) {
    console.log('error pedido:', pedidoError)
    return res.status(400).json({ error: pedidoError.message })
  }

  // 4. CREAR DETALLE DE FACTURA
  const detalles = items.map(item => ({
    id_pedido: pedido.id_pedido,
    id_stock: item.id_stock,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.cantidad * item.precio_unitario
  }))

  const { error: facturaError } = await supabase
    .from('factura')
    .insert(detalles)

  if (facturaError) {
    console.log('error factura:', facturaError)
    return res.status(400).json({ error: facturaError.message })
  }

  // 5. DESCONTAR STOCK Y RECALCULAR ESTADO POR CADA VARIANTE COMPRADA
  for (const item of items) {
    const variante = stocks.find(s => s.id_stock === item.id_stock)
    const nuevoStock = variante.stock_actual - item.cantidad

    let nuevoEstado = 'disponible'
    if (nuevoStock === 0) nuevoEstado = 'agotado'
    else if (nuevoStock <= (variante.stock_minimo || 5)) nuevoEstado = 'bajo'

    const { error: stockUpdateError } = await supabase
      .from('stock')
      .update({
        stock_actual: nuevoStock,
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id_stock', item.id_stock)

    if (stockUpdateError) {
      // El pedido y la factura ya se crearon; esto solo se registra para revisión manual,
      // no se revierte el pedido para no complicar la transacción con múltiples tablas.
      console.log('error actualizando stock tras el pedido:', stockUpdateError)
    }
  }

  // 6. INCREMENTAR total_ventas DEL PRODUCTO (usado en Reportes -> productos más vendidos)
  // Se busca el id_producto real consultando stock, ya que items solo trae id_stock.
  const { data: stockConProducto, error: stockProductoError } = await supabase
    .from('stock')
    .select('id_stock, id_producto')
    .in('id_stock', idsStock)

  if (stockProductoError) {
    console.log('error consultando id_producto para actualizar total_ventas:', stockProductoError)
  } else {
    for (const item of items) {
      const variante = stockConProducto.find(s => s.id_stock === item.id_stock)
      if (!variante) continue

      const { data: productoActual, error: productoError } = await supabase
        .from('productos')
        .select('total_ventas')
        .eq('id_producto', variante.id_producto)
        .single()

      if (productoError) {
        console.log('error consultando total_ventas:', productoError)
        continue
      }

      const { error: ventasError } = await supabase
        .from('productos')
        .update({ total_ventas: productoActual.total_ventas + item.cantidad })
        .eq('id_producto', variante.id_producto)

      if (ventasError) {
        console.log('error actualizando total_ventas:', ventasError)
      }
    }
  }

  return res.status(201).json({ mensaje: 'Pedido creado exitosamente', data: pedido })
}

export const actualizarEstadoPedido = async (req, res) => {
  const { id } = req.params
  const { estado_pedido, estado_pago, fecha_estimada_entrega } = req.body

  const campos = {}
  if (estado_pedido) campos.estado_pedido = estado_pedido
  if (estado_pago) campos.estado_pago = estado_pago
  if (fecha_estimada_entrega) campos.fecha_estimada_entrega = fecha_estimada_entrega
  if (estado_pedido === 'entregado') campos.fecha_entregado = new Date().toISOString()

  const { data, error } = await supabase
    .from('pedidos')
    .update(campos)
    .eq('id_pedido', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Pedido actualizado exitosamente', data })
}

export const cancelarPedido = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('pedidos')
    .update({ estado_pedido: 'cancelado' })
    .eq('id_pedido', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Pedido cancelado exitosamente', data })
}