import { Router } from 'express'
import {
  obtenerImagenesPorProducto,
  agregarImagen,
  actualizarImagen,
  eliminarImagen
} from '../controllers/imagenesProducto.controller.js'

const router = Router()

router.get('/:id_producto', obtenerImagenesPorProducto)
router.post('/', agregarImagen)
router.put('/:id', actualizarImagen)
router.delete('/:id', eliminarImagen)

export default router