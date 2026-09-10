import { Router } from 'express'

import {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito
} from '../controllers/favoritos.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Favoritos
 *   description: Gestión de productos favoritos de los usuarios
 */

/**
 * @swagger
 * /api/favoritos/{numero_documento}:
 *   get:
 *     summary: Obtener favoritos de un usuario
 *     description: Consulta los productos que un usuario tiene agregados como favoritos.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     responses:
 *       200:
 *         description: Lista de favoritos obtenida correctamente
 *       400:
 *         description: Error al consultar los favoritos
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.get('/:numero_documento', obtenerFavoritos)

/**
 * @swagger
 * /api/favoritos:
 *   post:
 *     summary: Agregar un producto a favoritos
 *     description: Agrega un producto a la lista de favoritos de un usuario.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_documento
 *               - id_producto
 *             properties:
 *               numero_documento:
 *                 type: string
 *                 example: "1234567890"
 *               id_producto:
 *                 type: integer
 *                 example: 15
 *     responses:
 *       201:
 *         description: Producto agregado a favoritos
 *       400:
 *         description: Error al agregar el producto a favoritos
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.post('/', agregarFavorito)

/**
 * @swagger
 * /api/favoritos/{numero_documento}/{id_producto}:
 *   delete:
 *     summary: Eliminar un producto de favoritos
 *     description: Elimina un producto de la lista de favoritos de un usuario.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *       - in: path
 *         name: id_producto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado de favoritos
 *       400:
 *         description: Error al eliminar el producto de favoritos
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Token inválido o expirado
 */
router.delete('/:numero_documento/:id_producto', eliminarFavorito)

export default router