import { supabase } from '../config/supabase.js'

export const obtenerFacturaPorPedido = async (req, res) => {
  const { id_pedido } = req.params

  const { data, error } = await supabase
    .from('factura')
    .select(`
      id_detalle,
      cantidad,
      precio_unitario,
      subtotal,
      stock (
        color,
        tallas ( talla ),
        productos ( nombre, referencia, precio )
      )
    `)
    .eq('id_pedido', id_pedido)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearFactura = async (req, res) => {
  const { id_pedido, items } = req.body
  // items = [{ id_stock, cantidad, precio_unitario }]

  // Calcular subtotales
  const detalles = items.map(item => ({
    id_pedido,
    id_stock: item.id_stock,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.cantidad * item.precio_unitario
  }))

  const { data, error } = await supabase
    .from('factura')
    .insert(detalles)
    .select()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Factura creada exitosamente', data })
}