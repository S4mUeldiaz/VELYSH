import { Router } from 'express'
import {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito
} from '../controllers/favoritos.controller.js'

const router = Router()

router.get('/:numero_documento', obtenerFavoritos)
router.post('/', agregarFavorito)
router.delete('/:numero_documento/:id_producto', eliminarFavorito)

export default router