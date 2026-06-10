import { Router } from 'express'
import {
  obtenerRoles,
  crearRol,
  actualizarRol,
  eliminarRol
} from '../controllers/roles.controller.js'

const router = Router()

router.get('/', obtenerRoles)
router.post('/', crearRol)
router.put('/:id', actualizarRol)
router.delete('/:id', eliminarRol)

export default router