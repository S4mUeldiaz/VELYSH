import { supabase } from '../config/supabase.js'

const BUCKET = 'fotos-perfil'
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']

export const subirFotoPerfil = async (req, res) => {
  const { numero_documento } = req.params

  if (req.usuario.numero_documento !== numero_documento) {
    return res.status(403).json({ error: 'No puedes modificar la foto de otro usuario' })
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' })
  }

  if (!TIPOS_PERMITIDOS.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Formato no soportado. Usa JPG, PNG o WebP' })
  }

  const extension = req.file.mimetype === 'image/png' ? 'png' : req.file.mimetype === 'image/webp' ? 'webp' : 'jpg'
  const ruta = `${numero_documento}.${extension}`

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    })

  if (errorSubida) return res.status(400).json({ error: errorSubida.message })

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(ruta)
  const url_foto_perfil = `${publicData.publicUrl}?v=${Date.now()}`

  const { error: errorUpdate } = await supabase
    .from('usuarios')
    .update({ url_foto_perfil })
    .eq('numero_documento', numero_documento)

  if (errorUpdate) return res.status(400).json({ error: errorUpdate.message })

  return res.status(200).json({ url_foto_perfil })
}
