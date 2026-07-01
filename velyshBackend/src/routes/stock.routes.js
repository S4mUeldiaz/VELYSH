import { Router } from 'express'
import {
  obtenerStock,
  obtenerStockPorProducto,
  crearStock,
  actualizarStock,
  eliminarStock
} from '../controllers/stock.controller.js'
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', obtenerStock)
router.get('/producto/:id_producto', obtenerStockPorProducto)

router.post('/',    verificarToken, verificarRol('admin'), crearStock)
router.put('/:id',  verificarToken, verificarRol('admin'), actualizarStock)
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarStock)

export default router