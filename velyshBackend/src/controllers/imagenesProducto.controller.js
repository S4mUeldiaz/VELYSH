import { supabase } from '../config/supabase.js'

export const obtenerImagenesPorProducto = async (req, res) => {
  const { id_producto } = req.params

  const { data, error } = await supabase
    .from('imagenes_producto')
    .select('*')
    .eq('id_producto', id_producto)
    .order('orden')

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const agregarImagen = async (req, res) => {
  const { id_producto, url_imagen, orden } = req.body

  const { data, error } = await supabase
    .from('imagenes_producto')
    .insert({
      id_producto,
      url_imagen,
      orden: orden || 0
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Imagen agregada exitosamente', data })
}

export const actualizarImagen = async (req, res) => {
  const { id } = req.params
  const { url_imagen, orden } = req.body

  const { data, error } = await supabase
    .from('imagenes_producto')
    .update({ url_imagen, orden })
    .eq('id_imagen', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Imagen actualizada exitosamente', data })
}

export const eliminarImagen = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('imagenes_producto')
    .delete()
    .eq('id_imagen', id)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Imagen eliminada exitosamente' })
}