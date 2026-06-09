import { supabase } from '../config/supabase.js'

export const obtenerTallas = async (req, res) => {
  const { data, error } = await supabase
    .from('tallas')
    .select('*')
    .order('orden')

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearTalla = async (req, res) => {
  const { talla, orden } = req.body

  const { data, error } = await supabase
    .from('tallas')
    .insert({ talla, orden: orden || 0 })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Talla creada exitosamente', data })
}

export const actualizarTalla = async (req, res) => {
  const { id } = req.params
  const { talla, orden } = req.body

  const { data, error } = await supabase
    .from('tallas')
    .update({ talla, orden })
    .eq('id_talla', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Talla actualizada exitosamente', data })
}

export const eliminarTalla = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('tallas')
    .delete()
    .eq('id_talla', id)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Talla eliminada exitosamente' })
}