import { supabase } from '../config/supabase.js'

export const registro = async (req, res) => {
  const { numero_documento, id_tipo_documento, nombre, apellido, correo, telefono, password, id_rol } = req.body

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true
  })

  if (authError) return res.status(400).json({ error: authError.message })

  const { error: dbError } = await supabase
    .from('usuarios')
    .insert({ numero_documento, id_tipo_documento, nombre, apellido, correo, telefono, password_hash: authData.user.id, id_rol: id_rol || 2 })

  if (dbError) return res.status(400).json({ error: dbError.message })

  return res.status(201).json({ mensaje: 'Usuario registrado exitosamente' })
}

export const login = async (req, res) => {
  const { correo, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password })

  if (error) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('numero_documento, nombre, apellido, correo, telefono, estado, roles ( nombre_rol )')
    .eq('correo', correo)
    .single()

  return res.status(200).json({ token: data.session.access_token, usuario })
}