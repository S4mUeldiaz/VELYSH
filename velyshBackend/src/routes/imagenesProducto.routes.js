import { Router } from 'express'

import {
  obtenerImagenesPorProducto,
  agregarImagen,
  actualizarImagen,
  eliminarImagen
} from '../controllers/imagenesProducto.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Imágenes de producto
 *   description: Gestión de imágenes asociadas a los productos
 */

/**
 * @swagger
 * /api/imagenes-producto/{id_producto}:
 *   get:
 *     summary: Obtener imágenes de un producto
 *     description: Consulta las imágenes asociadas a un producto específico.
 *     tags: [Imágenes de producto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_producto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de imágenes obtenida correctamente
 *       400:
 *         description: Error al consultar las imágenes
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.get('/:id_producto', obtenerImagenesPorProducto)

/**
 * @swagger
 * /api/imagenes-producto:
 *   post:
 *     summary: Agregar una imagen a un producto
 *     description: Registra una nueva imagen asociada a un producto.
 *     tags: [Imágenes de producto]
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
 *               - url_imagen
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 15
 *               url_imagen:
 *                 type: string
 *                 example: "https://ejemplo.com/zapato.jpg"
 *               orden:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Imagen agregada exitosamente
 *       400:
 *         description: Error al agregar la imagen
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.post('/', agregarImagen)

/**
 * @swagger
 * /api/imagenes-producto/{id}:
 *   put:
 *     summary: Actualizar una imagen
 *     description: Actualiza la información de una imagen existente.
 *     tags: [Imágenes de producto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url_imagen:
 *                 type: string
 *                 example: "https://ejemplo.com/zapato-nuevo.jpg"
 *               orden:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Imagen actualizada exitosamente
 *       400:
 *         description: Error al actualizar la imagen
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.put('/:id', actualizarImagen)

/**
 * @swagger
 * /api/imagenes-producto/{id}:
 *   delete:
 *     summary: Eliminar una imagen
 *     description: Elimina una imagen asociada a un producto.
 *     tags: [Imágenes de producto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *       400:
 *         description: Error al eliminar la imagen
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.delete('/:id', eliminarImagen)

export default router