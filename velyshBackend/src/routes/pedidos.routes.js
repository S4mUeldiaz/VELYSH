import { Router } from 'express'
import {
  obtenerPedidos,
  obtenerPedidoPorId,
  obtenerPedidosPorUsuario,
  crearPedido,
  actualizarEstadoPedido,
  cancelarPedido
} from '../controllers/pedidos.controller.js'

const router = Router()

router.get('/', obtenerPedidos)
router.get('/usuario/:numero_documento', obtenerPedidosPorUsuario)
router.get('/:id', obtenerPedidoPorId)
router.post('/', crearPedido)
router.put('/:id', actualizarEstadoPedido)
router.delete('/:id', cancelarPedido)

export default router