import { Router } from 'express'
import {
  obtenerMovimientos,
  obtenerMovimientosPorStock,
  crearMovimiento
} from '../controllers/movimientoInventario.controller.js'

const router = Router()

router.get('/', obtenerMovimientos)
router.get('/stock/:id_stock', obtenerMovimientosPorStock)
router.post('/', crearMovimiento)

export default router