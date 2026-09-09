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

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión de pedidos y compras de VELYSH
 */

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Obtener todos los pedidos
 *     description: Consulta todos los pedidos registrados, ordenados desde el más reciente.
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida correctamente
 *       400:
 *         description: Error al consultar los pedidos
 */
router.get('/', obtenerPedidos)

/**
 * @swagger
 * /api/pedidos/usuario/{numero_documento}:
 *   get:
 *     summary: Obtener pedidos de un usuario
 *     description: Consulta todos los pedidos realizados por un usuario específico.
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     responses:
 *       200:
 *         description: Pedidos del usuario obtenidos correctamente
 *       400:
 *         description: Error al consultar los pedidos
 */
router.get('/usuario/:numero_documento', obtenerPedidosPorUsuario)

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     description: Consulta la información detallada de un pedido específico.
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado correctamente
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', obtenerPedidoPorId)

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear un nuevo pedido
 *     description: Crea un pedido, registra la dirección, genera el detalle de factura y descuenta el stock disponible.
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_documento
 *               - metodo_pago
 *               - items
 *               - direccion
 *             properties:
 *               numero_documento:
 *                 type: string
 *                 example: "1234567890"
 *               metodo_pago:
 *                 type: string
 *                 example: "tarjeta"
 *               costo_envio:
 *                 type: number
 *                 example: 10000
 *               direccion:
 *                 type: string
 *                 example: "Carrera 80 # 45-20"
 *               ciudad:
 *                 type: string
 *                 example: "Bogotá"
 *               departamento:
 *                 type: string
 *                 example: "Cundinamarca"
 *               codigo_postal:
 *                 type: string
 *                 example: "110821"
 *               items:
 *                 type: array
 *                 description: Productos que hacen parte del pedido
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_stock
 *                     - cantidad
 *                     - precio_unitario
 *                   properties:
 *                     id_stock:
 *                       type: integer
 *                       example: 1
 *                     cantidad:
 *                       type: integer
 *                       example: 2
 *                     precio_unitario:
 *                       type: number
 *                       example: 120000
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       400:
 *         description: Error en los datos o stock insuficiente
 */
router.post('/', crearPedido)

/**
 * @swagger
 * /api/pedidos/{id}:
 *   put:
 *     summary: Actualizar el estado de un pedido
 *     description: Permite actualizar el estado del pedido, el estado del pago y la fecha estimada de entrega.
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_pedido:
 *                 type: string
 *                 example: "enviado"
 *               estado_pago:
 *                 type: string
 *                 example: "pagado"
 *               fecha_estimada_entrega:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-15T10:00:00Z"
 *     responses:
 *       200:
 *         description: Pedido actualizado exitosamente
 *       400:
 *         description: Error al actualizar el pedido
 */
router.put('/:id', actualizarEstadoPedido)

/**
 * @swagger
 * /api/pedidos/{id}:
 *   delete:
 *     summary: Cancelar un pedido
 *     description: Cambia el estado del pedido a cancelado.
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido cancelado exitosamente
 *       400:
 *         description: Error al cancelar el pedido
 */
router.delete('/:id', cancelarPedido)

export default router