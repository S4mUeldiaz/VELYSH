import { Router } from 'express'
import {
  obtenerTiposDocumento,
  crearTipoDocumento,
  actualizarTipoDocumento,
  eliminarTipoDocumento
} from '../controllers/tipoDocumento.controller.js'

const router = Router()

router.get('/', obtenerTiposDocumento)
router.post('/', crearTipoDocumento)
router.put('/:id', actualizarTipoDocumento)
router.delete('/:id', eliminarTipoDocumento)

export default router