import { Router } from 'express'
import {
  obtenerFacturaPorPedido,
  crearFactura
} from '../controllers/factura.controller.js'

const router = Router()

router.get('/:id_pedido', obtenerFacturaPorPedido)
router.post('/', crearFactura)

export default router