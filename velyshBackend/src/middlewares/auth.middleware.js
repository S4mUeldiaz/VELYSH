import jwt from 'jsonwebtoken'

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const tokenHeader = authHeader && authHeader.split(' ')[1]
  const token = req.cookies?.token || tokenHeader

  if (!token) return res.status(401).json({ error: 'Token requerido' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

export const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' })
    }
    next()
  }
}

// Para rutas de autoservicio con :numero_documento en la URL (editar mi
// perfil, cambiar mi contraseña, eliminar mi cuenta): deja pasar al dueño del
// recurso (su propio numero_documento, tomado del token, no del body/URL) o a
// un admin. Reemplaza a verificarRol('admin') en esas rutas puntuales — ese
// gate bloqueaba también al dueño legítimo, no solo a terceros.
export const verificarPropioOAdmin = (req, res, next) => {
  const esDueño = req.usuario.numero_documento === req.params.numero_documento
  const esAdmin = req.usuario.rol === 'admin'
  if (!esDueño && !esAdmin) {
    return res.status(403).json({ error: 'No tienes permisos para esta acción' })
  }
  next()
}