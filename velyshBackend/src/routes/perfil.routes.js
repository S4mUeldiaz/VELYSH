import { Router } from 'express'
import multer from 'multer'
import { subirFotoPerfil } from '../controllers/perfil.controller.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

/**
 * @swagger
 * tags:
 *   name: Perfil
 *   description: Autoservicio del propio usuario autenticado (no requiere rol admin)
 */

/**
 * @swagger
 * /api/perfil/{numero_documento}/foto:
 *   post:
 *     summary: Subir o reemplazar la foto de perfil del usuario autenticado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Debe coincidir con el usuario del token; si no, responde 403
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto subida exitosamente
 *       400:
 *         description: Archivo faltante o formato no soportado
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido/expirado, o intento de modificar la foto de otro usuario
 */
router.post('/:numero_documento/foto', upload.single('foto'), subirFotoPerfil)

export default router
