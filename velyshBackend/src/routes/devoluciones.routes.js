import { Router } from 'express'
import {
  obtenerDevoluciones,
  obtenerDevolucionPorId,
  crearDevolucion,
  actualizarDevolucion
} from '../controllers/devoluciones.controller.js'

const router = Router()

router.get('/', obtenerDevoluciones)
router.get('/:id', obtenerDevolucionPorId)
router.post('/', crearDevolucion)
router.put('/:id', actualizarDevolucion)

export default router