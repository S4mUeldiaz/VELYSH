import { supabase } from '../config/supabase.js'

export const obtenerRoles = async (req, res) => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('id_rol')

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const crearRol = async (req, res) => {
  const { nombre_rol, descripcion } = req.body

  const { data, error } = await supabase
    .from('roles')
    .insert({
      nombre_rol,
      descripcion: descripcion || ''
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Rol creado exitosamente', data })
}

export const actualizarRol = async (req, res) => {
  const { id } = req.params
  const { nombre_rol, descripcion } = req.body

  const { data, error } = await supabase
    .from('roles')
    .update({ nombre_rol, descripcion })
    .eq('id_rol', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Rol actualizado exitosamente', data })
}

export const eliminarRol = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id_rol', id)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Rol eliminado exitosamente' })
}