import { supabase } from '../config/supabase.js'

export const obtenerUsuarios = async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      numero_documento,
      nombre,
      apellido,
      correo,
      telefono,
      estado,
      fecha_registro,
      fecha_ultima_actividad,
      roles ( nombre_rol ),
      tipo_documento ( tipo, descripcion )
    `)
    .order('fecha_registro', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const obtenerUsuarioPorDocumento = async (req, res) => {
  const { numero_documento } = req.params

  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      numero_documento,
      nombre,
      apellido,
      correo,
      telefono,
      estado,
      fecha_registro,
      fecha_ultima_actividad,
      roles ( nombre_rol ),
      tipo_documento ( tipo, descripcion ),
      direcciones ( id_direccion, direccion, ciudad, departamento, codigo_postal )
    `)
    .eq('numero_documento', numero_documento)
    .single()

  if (error) return res.status(404).json({ error: 'Usuario no encontrado' })

  return res.status(200).json(data)
}

export const actualizarUsuario = async (req, res) => {
  const { numero_documento } = req.params
  const { nombre, apellido, telefono } = req.body

  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, apellido, telefono })
    .eq('numero_documento', numero_documento)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Usuario actualizado exitosamente', data })
}

export const cambiarEstadoUsuario = async (req, res) => {
  const { numero_documento } = req.params
  const { estado } = req.body

  const estadosValidos = ['activo', 'inactivo']
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser: activo o inactivo' })
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update({ estado })
    .eq('numero_documento', numero_documento)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: `Usuario ${estado} exitosamente`, data })
}

export const obtenerDirecciones = async (req, res) => {
  const { numero_documento } = req.params

  const { data, error } = await supabase
    .from('direcciones')
    .select('*')
    .eq('numero_documento', numero_documento)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}

export const agregarDireccion = async (req, res) => {
  const { numero_documento } = req.params
  const { direccion, ciudad, departamento, codigo_postal } = req.body

  const { data, error } = await supabase
    .from('direcciones')
    .insert({
      numero_documento,
      direccion,
      ciudad: ciudad || 'Bogotá',
      departamento: departamento || 'Cundinamarca',
      codigo_postal: codigo_postal || ''
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ mensaje: 'Dirección agregada exitosamente', data })
}

export const eliminarDireccion = async (req, res) => {
  const { id_direccion } = req.params

  const { error } = await supabase
    .from('direcciones')
    .delete()
    .eq('id_direccion', id_direccion)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ mensaje: 'Dirección eliminada exitosamente' })
}