import { Router } from 'express'
import {
  obtenerStock,
  obtenerStockPorProducto,
  crearStock,
  actualizarStock,
  eliminarStock
} from '../controllers/stock.controller.js'

const router = Router()

router.get('/', obtenerStock)
router.get('/producto/:id_producto', obtenerStockPorProducto)
router.post('/', crearStock)
router.put('/:id', actualizarStock)
router.delete('/:id', eliminarStock)

export default router