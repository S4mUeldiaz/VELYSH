import { Router } from 'express'

import {
  obtenerDevoluciones,
  obtenerDevolucionPorId,
  crearDevolucion,
  actualizarDevolucion
} from '../controllers/devoluciones.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Devoluciones
 *   description: Gestión de devoluciones de pedidos
 */

/**
 * @swagger
 * /api/devoluciones:
 *   get:
 *     summary: Obtener todas las devoluciones
 *     description: Consulta todas las devoluciones registradas, ordenadas desde la más reciente.
 *     tags: [Devoluciones]
 *     responses:
 *       200:
 *         description: Lista de devoluciones obtenida correctamente
 *       400:
 *         description: Error al consultar las devoluciones
 */
router.get('/', obtenerDevoluciones)

/**
 * @swagger
 * /api/devoluciones/{id}:
 *   get:
 *     summary: Obtener una devolución por ID
 *     description: Consulta la información detallada de una devolución específica.
 *     tags: [Devoluciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la devolución
 *     responses:
 *       200:
 *         description: Devolución encontrada correctamente
 *       404:
 *         description: Devolución no encontrada
 */
router.get('/:id', obtenerDevolucionPorId)

/**
 * @swagger
 * /api/devoluciones:
 *   post:
 *     summary: Crear una devolución
 *     description: Registra una nueva solicitud de devolución para un pedido.
 *     tags: [Devoluciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_pedido
 *               - id_detalle_pedido
 *               - motivo
 *             properties:
 *               id_pedido:
 *                 type: integer
 *                 example: 15
 *               id_detalle_pedido:
 *                 type: integer
 *                 example: 8
 *               motivo:
 *                 type: string
 *                 example: "La talla no corresponde"
 *     responses:
 *       201:
 *         description: Devolución solicitada exitosamente
 *       400:
 *         description: Error al crear la devolución
 */
router.post('/', crearDevolucion)

/**
 * @swagger
 * /api/devoluciones/{id}:
 *   put:
 *     summary: Actualizar una devolución
 *     description: Actualiza el estado de una devolución y registra la fecha de respuesta.
 *     tags: [Devoluciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la devolución
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum:
 *                   - aprobada
 *                   - rechazada
 *                   - procesada
 *                 example: "aprobada"
 *     responses:
 *       200:
 *         description: Devolución actualizada exitosamente
 *       400:
 *         description: Estado inválido o error al actualizar la devolución
 */
router.put('/:id', actualizarDevolucion)

export default router