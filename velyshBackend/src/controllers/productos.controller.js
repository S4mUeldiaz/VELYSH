import { supabase } from '../config/supabase.js'

export const crearCategoria = async (req, res) => {
  const { nombre_categoria, descripcion, orden } = req.body

  const { data, error } = await supabase
    .from('categorias')
    .insert({
      nombre_categoria,
      descripcion: descripcion || '',
      orden: orden || 0
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Categoría creada exitosamente', data })
}

export const crearProducto = async (req, res) => {
  const { id_categoria, referencia, nombre, descripcion, marca, precio } = req.body

  const { data, error } = await supabase
    .from('productos')
    .insert({
      id_categoria,
      referencia,
      nombre,
      descripcion: descripcion || '',
      marca: marca || 'VELYSH',
      precio
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Producto creado exitosamente', data })
}
  export const obtenerCategorias = async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('estado', 'activo')
    .order('orden')

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}
export const obtenerProductos = async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id_producto,
      id_categoria,
      referencia,
      nombre,
      descripcion,
      marca,
      precio,
      estado,
      total_ventas,
      categorias ( nombre_categoria ),
      imagenes_producto ( url_imagen, orden )
    `)
    .eq('estado', 'activo')
    .order('total_ventas', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const obtenerProductoPorId = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('productos')
    .select(`
      id_producto,
      id_categoria,
      referencia,
      nombre,
      descripcion,
      marca,
      precio,
      estado,
      categorias ( nombre_categoria ),
      imagenes_producto ( url_imagen, orden ),
      stock ( id_stock, color, stock_actual, estado, tallas ( talla ) )
    `)
    .eq('id_producto', id)
    .single()

  if (error) return res.status(404).json({ error: 'Producto no encontrado' })

  return res.status(200).json(data)
}

export const actualizarCategoria = async (req, res) => {
  const { id } = req.params
  const { nombre_categoria, descripcion, orden, estado } = req.body

  const { data, error } = await supabase
    .from('categorias')
    .update({ nombre_categoria, descripcion, orden, estado })
    .eq('id_categoria', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Categoría actualizada exitosamente', data })
}

export const actualizarProducto = async (req, res) => {
  const { id } = req.params
  const { nombre, descripcion, marca, precio, estado, id_categoria } = req.body

  const { data, error } = await supabase
    .from('productos')
    .update({ nombre, descripcion, marca, precio, estado, id_categoria })
    .eq('id_producto', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Producto actualizado exitosamente', data })
}

export const eliminarCategoria = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('categorias')
    .update({ estado: 'inactivo' })
    .eq('id_categoria', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Categoría desactivada exitosamente', data })
}

export const eliminarProducto = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id_producto', id)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Producto eliminado exitosamente' })
}