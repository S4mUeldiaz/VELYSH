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

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Gestión del inventario y existencias de productos
 */

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Obtener todo el stock
 *     description: Consulta todas las existencias registradas junto con información del producto y talla.
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: Stock obtenido correctamente
 *       400:
 *         description: Error al consultar el stock
 */
router.get('/', obtenerStock)

/**
 * @swagger
 * /api/stock/producto/{id_producto}:
 *   get:
 *     summary: Obtener stock por producto
 *     description: Consulta las diferentes existencias y variantes de un producto específico.
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: id_producto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Stock del producto obtenido correctamente
 *       400:
 *         description: Error al consultar el stock
 */
router.get('/producto/:id_producto', obtenerStockPorProducto)

/**
 * @swagger
 * /api/stock:
 *   post:
 *     summary: Crear un registro de stock
 *     description: Registra una nueva existencia de producto. El estado se determina automáticamente según la cantidad disponible.
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - id_talla
 *               - color
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 1
 *               id_talla:
 *                 type: integer
 *                 example: 3
 *               color:
 *                 type: string
 *                 example: "Negro"
 *               stock_actual:
 *                 type: integer
 *                 example: 20
 *               stock_minimo:
 *                 type: integer
 *                 example: 5
 *               stock_maximo:
 *                 type: integer
 *                 example: 100
 *               ubicacion_almacen:
 *                 type: string
 *                 example: "Bodega principal"
 *     responses:
 *       201:
 *         description: Stock creado exitosamente
 *       400:
 *         description: Error al crear el stock
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o usuario sin permisos de administrador
 */
router.post('/', verificarToken, verificarRol('admin'), crearStock)

/**
 * @swagger
 * /api/stock/{id}:
 *   put:
 *     summary: Actualizar un registro de stock
 *     description: Actualiza las cantidades y ubicación del stock. El estado se recalcula automáticamente.
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock_actual:
 *                 type: integer
 *                 example: 15
 *               stock_minimo:
 *                 type: integer
 *                 example: 5
 *               stock_maximo:
 *                 type: integer
 *                 example: 100
 *               ubicacion_almacen:
 *                 type: string
 *                 example: "Bodega principal"
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *       400:
 *         description: Error al actualizar el stock
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o usuario sin permisos de administrador
 */
router.put('/:id', verificarToken, verificarRol('admin'), actualizarStock)

/**
 * @swagger
 * /api/stock/{id}:
 *   delete:
 *     summary: Eliminar un registro de stock
 *     description: Elimina un registro de stock mediante su ID.
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de stock
 *     responses:
 *       200:
 *         description: Stock eliminado exitosamente
 *       400:
 *         description: Error al eliminar el stock
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o usuario sin permisos de administrador
 */
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarStock)

export default router