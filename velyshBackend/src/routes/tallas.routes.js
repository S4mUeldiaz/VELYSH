import { Router } from 'express'

import {
  obtenerTallas,
  crearTalla,
  actualizarTalla,
  eliminarTalla
} from '../controllers/tallas.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Tallas
 *   description: Gestión de tallas de productos
 */

/**
 * @swagger
 * /api/tallas:
 *   get:
 *     summary: Obtener todas las tallas
 *     description: Consulta todas las tallas registradas y las ordena según el campo orden.
 *     tags: [Tallas]
 *     responses:
 *       200:
 *         description: Lista de tallas obtenida correctamente
 *       400:
 *         description: Error al consultar las tallas
 */
router.get('/', obtenerTallas)

/**
 * @swagger
 * /api/tallas:
 *   post:
 *     summary: Crear una talla
 *     description: Registra una nueva talla en el sistema.
 *     tags: [Tallas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - talla
 *             properties:
 *               talla:
 *                 type: string
 *                 example: "38"
 *               orden:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Talla creada exitosamente
 *       400:
 *         description: Error al crear la talla
 */
router.post('/', crearTalla)

/**
 * @swagger
 * /api/tallas/{id}:
 *   put:
 *     summary: Actualizar una talla
 *     description: Actualiza la información de una talla existente.
 *     tags: [Tallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la talla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - talla
 *               - orden
 *             properties:
 *               talla:
 *                 type: string
 *                 example: "39"
 *               orden:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Talla actualizada exitosamente
 *       400:
 *         description: Error al actualizar la talla
 */
router.put('/:id', actualizarTalla)

/**
 * @swagger
 * /api/tallas/{id}:
 *   delete:
 *     summary: Eliminar una talla
 *     description: Elimina una talla del sistema mediante su ID.
 *     tags: [Tallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la talla
 *     responses:
 *       200:
 *         description: Talla eliminada exitosamente
 *       400:
 *         description: Error al eliminar la talla
 */
router.delete('/:id', eliminarTalla)

export default router