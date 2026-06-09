import { Router } from 'express'
import {
  obtenerTallas,
  crearTalla,
  actualizarTalla,
  eliminarTalla
} from '../controllers/tallas.controller.js'

const router = Router()

router.get('/', obtenerTallas)
router.post('/', crearTalla)
router.put('/:id', actualizarTalla)
router.delete('/:id', eliminarTalla)

export default router