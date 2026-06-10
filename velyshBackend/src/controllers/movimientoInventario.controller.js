import { supabase } from '../config/supabase.js'

export const obtenerMovimientos = async (req, res) => {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select(`
      id_movimiento,
      tipo_movimiento,
      cantidad,
      stock_anterior,
      stock_nuevo,
      motivo,
      notas,
      fecha_movimiento,
      stock (
        color,
        tallas ( talla ),
        productos ( nombre, referencia )
      ),
      pedidos ( referencia ),
      usuarios ( nombre, apellido )
    `)
    .order('fecha_movimiento', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const obtenerMovimientosPorStock = async (req, res) => {
  const { id_stock } = req.params

  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select(`
      id_movimiento,
      tipo_movimiento,
      cantidad,
      stock_anterior,
      stock_nuevo,
      motivo,
      notas,
      fecha_movimiento,
      usuarios ( nombre, apellido )
    `)
    .eq('id_stock', id_stock)
    .order('fecha_movimiento', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearMovimiento = async (req, res) => {
  const {
    id_stock,
    tipo_movimiento,
    cantidad,
    motivo,
    id_pedido,
    numero_documento,
    notas
  } = req.body

  // 1. Obtener stock actual
  const { data: stockData, error: stockError } = await supabase
    .from('stock')
    .select('stock_actual, stock_minimo')
    .eq('id_stock', id_stock)
    .single()

  if (stockError) return res.status(404).json({ error: 'Stock no encontrado' })

  const stock_anterior = stockData.stock_actual

  // 2. Calcular nuevo stock según tipo de movimiento
  let stock_nuevo
  if (tipo_movimiento === 'entrada' || tipo_movimiento === 'devolucion') {
    stock_nuevo = stock_anterior + cantidad
  } else if (tipo_movimiento === 'salida') {
    stock_nuevo = stock_anterior - cantidad
    if (stock_nuevo < 0) return res.status(400).json({ error: 'Stock insuficiente' })
  } else if (tipo_movimiento === 'ajuste') {
    stock_nuevo = cantidad
  }

  // 3. Determinar nuevo estado
  let estado = 'disponible'
  if (stock_nuevo === 0) estado = 'agotado'
  else if (stock_nuevo <= stockData.stock_minimo) estado = 'bajo'

  // 4. Actualizar stock
  const { error: updateError } = await supabase
    .from('stock')
    .update({
      stock_actual: stock_nuevo,
      estado,
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id_stock', id_stock)

  if (updateError) return res.status(400).json({ error: updateError.message })

  // 5. Registrar movimiento
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .insert({
      id_stock,
      tipo_movimiento,
      cantidad,
      stock_anterior,
      stock_nuevo,
      motivo: motivo || '',
      id_pedido: id_pedido || null,
      numero_documento,
      notas: notas || ''
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Movimiento registrado exitosamente', data })
}