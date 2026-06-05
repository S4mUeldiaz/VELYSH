import { supabase } from '../config/supabase.js'

export const obtenerTiposDocumento = async (req, res) => {
  const { data, error } = await supabase
    .from('tipo_documento')
    .select('*')
    .order('id_tipo_documento')

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearTipoDocumento = async (req, res) => {
  const { tipo, descripcion } = req.body

  const { data, error } = await supabase
    .from('tipo_documento')
    .insert({ tipo, descripcion: descripcion || '' })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Tipo de documento creado exitosamente', data })
}

export const actualizarTipoDocumento = async (req, res) => {
  const { id } = req.params
  const { descripcion } = req.body

  const { data, error } = await supabase
    .from('tipo_documento')
    .update({ descripcion })
    .eq('id_tipo_documento', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Tipo de documento actualizado exitosamente', data })
}

export const eliminarTipoDocumento = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('tipo_documento')
    .delete()
    .eq('id_tipo_documento', id)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Tipo de documento eliminado exitosamente' })
}