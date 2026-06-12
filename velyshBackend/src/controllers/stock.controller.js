import { supabase } from '../config/supabase.js'

export const obtenerStock = async (req, res) => {
  const { data, error } = await supabase
    .from('stock')
    .select(`
      id_stock,
      color,
      stock_actual,
      stock_minimo,
      stock_maximo,
      estado,
      ubicacion_almacen,
      fecha_actualizacion,
      productos ( nombre, referencia, precio ),
      tallas ( talla )
    `)
    .order('id_stock')

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const obtenerStockPorProducto = async (req, res) => {
  const { id_producto } = req.params

  const { data, error } = await supabase
    .from('stock')
    .select(`
      id_stock,
      color,
      stock_actual,
      stock_minimo,
      stock_maximo,
      estado,
      ubicacion_almacen,
      tallas ( talla )
    `)
    .eq('id_producto', id_producto)
    .order('id_stock')

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearStock = async (req, res) => {
  const {
    id_producto,
    id_talla,
    color,
    stock_actual,
    stock_minimo,
    stock_maximo,
    ubicacion_almacen
  } = req.body

  // Determinar estado según stock
  let estado = 'disponible'
  if (stock_actual === 0) estado = 'agotado'
  else if (stock_actual <= (stock_minimo || 5)) estado = 'bajo'

  const { data, error } = await supabase
    .from('stock')
    .insert({
      id_producto,
      id_talla,
      color,
      stock_actual: stock_actual || 0,
      stock_minimo: stock_minimo || 5,
      stock_maximo: stock_maximo || 100,
      estado,
      ubicacion_almacen: ubicacion_almacen || ''
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Stock creado exitosamente', data })
}

export const actualizarStock = async (req, res) => {
  const { id } = req.params
  const {
    stock_actual,
    stock_minimo,
    stock_maximo,
    ubicacion_almacen
  } = req.body

  // Recalcular estado según nuevo stock
  let estado = 'disponible'
  if (stock_actual === 0) estado = 'agotado'
  else if (stock_actual <= (stock_minimo || 5)) estado = 'bajo'

  const { data, error } = await supabase
    .from('stock')
    .update({
      stock_actual,
      stock_minimo,
      stock_maximo,
      ubicacion_almacen,
      estado,
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id_stock', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Stock actualizado exitosamente', data })
}

export const eliminarStock = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('stock')
    .delete()
    .eq('id_stock', id)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Stock eliminado exitosamente' })
}