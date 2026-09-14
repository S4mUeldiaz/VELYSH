import { Router } from 'express'

import {
  obtenerFacturaPorPedido,
  crearFactura
} from '../controllers/factura.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Factura
 *   description: Gestión de facturas de los pedidos
 */

/**
 * @swagger
 * /api/factura/{id_pedido}:
 *   get:
 *     summary: Obtener factura de un pedido
 *     tags: [Factura]
 *     parameters:
 *       - in: path
 *         name: id_pedido
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Factura obtenida correctamente
 *       400:
 *         description: Error al consultar la factura
 */
router.get('/:id_pedido', obtenerFacturaPorPedido)

/**
 * @swagger
 * /api/factura:
 *   post:
 *     summary: Crear una factura
 *     tags: [Factura]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_pedido
 *               - items
 *             properties:
 *               id_pedido:
 *                 type: integer
 *                 example: 10
 *               items:
 *                 type: array
 *                 example:
 *                   - id_stock: 5
 *                     cantidad: 2
 *                     precio_unitario: 85000
 *                   - id_stock: 8
 *                     cantidad: 1
 *                     precio_unitario: 95000
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *       400:
 *         description: Error al crear la factura
 */
router.post('/', crearFactura)

export default router