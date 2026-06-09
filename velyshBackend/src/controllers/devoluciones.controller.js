import { supabase } from '../config/supabase.js'

export const obtenerDevoluciones = async (req, res) => {
  const { data, error } = await supabase
    .from('devoluciones')
    .select(`
      id_devolucion,
      motivo,
      estado,
      fecha_solicitud,
      fecha_respuesta,
      pedidos ( referencia, numero_documento ),
      factura (
        cantidad,
        precio_unitario,
        stock (
          color,
          tallas ( talla ),
          productos ( nombre )
        )
      )
    `)
    .order('fecha_solicitud', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const obtenerDevolucionPorId = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('devoluciones')
    .select(`
      id_devolucion,
      motivo,
      estado,
      fecha_solicitud,
      fecha_respuesta,
      pedidos ( referencia, numero_documento ),
      factura (
        cantidad,
        precio_unitario,
        stock (
          color,
          tallas ( talla ),
          productos ( nombre )
        )
      )
    `)
    .eq('id_devolucion', id)
    .single()

  if (error) return res.status(404).json({ error: 'Devolución no encontrada' })

  return res.status(200).json(data)
}

export const crearDevolucion = async (req, res) => {
  const { id_pedido, id_detalle_pedido, motivo } = req.body

  const { data, error } = await supabase
    .from('devoluciones')
    .insert({
      id_pedido,
      id_detalle_pedido,
      motivo,
      estado: 'solicitada'
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Devolución solicitada exitosamente', data })
}

export const actualizarDevolucion = async (req, res) => {
  const { id } = req.params
  const { estado } = req.body

  const estadosValidos = ['aprobada', 'rechazada', 'procesada']
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Debe ser: ${estadosValidos.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('devoluciones')
    .update({
      estado,
      fecha_respuesta: new Date().toISOString()
    })
    .eq('id_devolucion', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Devolución actualizada exitosamente', data })
}