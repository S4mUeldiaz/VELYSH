import { Router } from 'express'

import {
  obtenerTiposDocumento,
  crearTipoDocumento,
  actualizarTipoDocumento,
  eliminarTipoDocumento
} from '../controllers/tipoDocumento.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Tipos de documento
 *   description: Gestión de tipos de documento
 */

/**
 * @swagger
 * /api/tipo-documento:
 *   get:
 *     summary: Obtener tipos de documento
 *     tags: [Tipos de documento]
 *     responses:
 *       200:
 *         description: Lista de tipos de documento obtenida correctamente
 *       400:
 *         description: Error al consultar los tipos de documento
 */
router.get('/', obtenerTiposDocumento)

/**
 * @swagger
 * /api/tipo-documento:
 *   post:
 *     summary: Crear un tipo de documento
 *     tags: [Tipos de documento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: "Cédula de ciudadanía"
 *               descripcion:
 *                 type: string
 *                 example: "Documento de identificación nacional"
 *     responses:
 *       201:
 *         description: Tipo de documento creado exitosamente
 *       400:
 *         description: Error al crear el tipo de documento
 */
router.post('/', crearTipoDocumento)

/**
 * @swagger
 * /api/tipo-documento/{id}:
 *   put:
 *     summary: Actualizar un tipo de documento
 *     tags: [Tipos de documento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Documento de identificación personal"
 *     responses:
 *       200:
 *         description: Tipo de documento actualizado exitosamente
 *       400:
 *         description: Error al actualizar el tipo de documento
 */
router.put('/:id', actualizarTipoDocumento)

/**
 * @swagger
 * /api/tipo-documento/{id}:
 *   delete:
 *     summary: Eliminar un tipo de documento
 *     tags: [Tipos de documento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de documento
 *     responses:
 *       200:
 *         description: Tipo de documento eliminado exitosamente
 *       400:
 *         description: Error al eliminar el tipo de documento
 */
router.delete('/:id', eliminarTipoDocumento)

export default router