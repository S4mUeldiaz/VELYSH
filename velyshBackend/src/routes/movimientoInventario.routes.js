import { Router } from 'express'

import {
  obtenerMovimientos,
  obtenerMovimientosPorStock,
  crearMovimiento
} from '../controllers/movimientoInventario.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Movimientos de inventario
 *   description: Gestión de movimientos del inventario
 */

/**
 * @swagger
 * /api/movimientos-inventario:
 *   get:
 *     summary: Obtener movimientos de inventario
 *     tags: [Movimientos de inventario]
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida correctamente
 *       400:
 *         description: Error al consultar los movimientos
 */
router.get('/', obtenerMovimientos)

/**
 * @swagger
 * /api/movimientos-inventario/stock/{id_stock}:
 *   get:
 *     summary: Obtener movimientos por stock
 *     tags: [Movimientos de inventario]
 *     parameters:
 *       - in: path
 *         name: id_stock
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del stock
 *     responses:
 *       200:
 *         description: Movimientos del stock obtenidos correctamente
 *       400:
 *         description: Error al consultar los movimientos
 */
router.get('/stock/:id_stock', obtenerMovimientosPorStock)

/**
 * @swagger
 * /api/movimientos-inventario:
 *   post:
 *     summary: Crear un movimiento de inventario
 *     tags: [Movimientos de inventario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_stock
 *               - tipo_movimiento
 *               - cantidad
 *               - numero_documento
 *             properties:
 *               id_stock:
 *                 type: integer
 *                 example: 1
 *               tipo_movimiento:
 *                 type: string
 *                 example: "entrada"
 *               cantidad:
 *                 type: integer
 *                 example: 10
 *               motivo:
 *                 type: string
 *                 example: "Ingreso de mercancía"
 *               id_pedido:
 *                 type: integer
 *                 example: 5
 *               numero_documento:
 *                 type: string
 *                 example: "1234567890"
 *               notas:
 *                 type: string
 *                 example: "Ingreso de nuevo producto"
 *     responses:
 *       201:
 *         description: Movimiento registrado exitosamente
 *       400:
 *         description: Error al registrar el movimiento
 *       404:
 *         description: Stock no encontrado
 */
router.post('/', crearMovimiento)

export default router