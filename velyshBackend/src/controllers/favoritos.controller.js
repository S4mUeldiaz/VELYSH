import { supabase } from '../config/supabase.js'

export const obtenerFavoritos = async (req, res) => {
  const { numero_documento } = req.params

  const { data, error } = await supabase
    .from('favoritos')
    .select(`
      id_favorito,
      fecha_agregado,
      productos (
        id_producto,
        nombre,
        precio,
        referencia,
        imagenes_producto ( url_imagen, orden )
      )
    `)
    .eq('numero_documento', numero_documento)
    .order('fecha_agregado', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const agregarFavorito = async (req, res) => {
  const { numero_documento, id_producto } = req.body

  const { data, error } = await supabase
    .from('favoritos')
    .insert({ numero_documento, id_producto })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Producto agregado a favoritos', data })
}

export const eliminarFavorito = async (req, res) => {
  const { numero_documento, id_producto } = req.params

  const { error } = await supabase
    .from('favoritos')
    .delete()
    .eq('numero_documento', numero_documento)
    .eq('id_producto', id_producto)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Producto eliminado de favoritos' })
}