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
      direcciones ( direccion, ciudad, departamento )
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
        cantidad,
        subtotal,
        stock (
          color,
          tallas ( talla ),
          productos ( nombre, referencia )
        )
      )
    `)
    .eq('numero_documento', numero_documento)
    .order('fecha_pedido', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearPedido = async (req, res) => {
  const {
    numero_documento,
    id_direccion,
    metodo_pago,
    costo_envio,
    items
  } = req.body
  // items = [{ id_stock, cantidad, precio_unitario }]

  // 1. Calcular precio total
  const precio_total = items.reduce((acc, item) => {
    return acc + item.cantidad * item.precio_unitario
  }, costo_envio || 0)

  // 2. Generar referencia única
  const referencia = `VLY-${Date.now()}`

  // 3. Crear el pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      numero_documento,
      id_direccion,
      referencia,
      precio_total,
      costo_envio: costo_envio || 0,
      metodo_pago,
      estado_pago: 'pendiente',
      estado_pedido: 'pendiente'
    })
    .select()
    .single()

  if (pedidoError) return res.status(400).json({ error: pedidoError.message })

  // 4. Crear la factura
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

  if (facturaError) return res.status(400).json({ error: facturaError.message })

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