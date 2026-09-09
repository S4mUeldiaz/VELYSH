import { Router } from 'express'

import {
  crearCategoria,
  crearProducto,
  obtenerCategorias,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarCategoria,
  actualizarProducto,
  eliminarCategoria,
  eliminarProducto,
} from '../controllers/productos.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos y categorías
 */

/**
 * @swagger
 * /api/productos/categoria:
 *   get:
 *     summary: Obtener categorías
 *     description: Obtiene todas las categorías activas ordenadas.
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida correctamente
 *       400:
 *         description: Error al obtener las categorías
 */
router.get('/categoria', obtenerCategorias)

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener productos
 *     description: Obtiene los productos activos. Permite filtrar por categoría y género.
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *       - in: query
 *         name: genero
 *         required: false
 *         schema:
 *           type: string
 *         description: Género del producto
 *         example: "unisex"
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 *       400:
 *         description: Error al obtener los productos
 */
router.get('/', obtenerProductos)

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Obtiene la información de un producto específico.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     responses:
 *       200:
 *         description: Producto encontrado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', obtenerProductoPorId)

/**
 * @swagger
 * /api/productos/categoria:
 *   post:
 *     summary: Crear categoría
 *     description: Crea una nueva categoría de productos.
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_categoria
 *             properties:
 *               nombre_categoria:
 *                 type: string
 *                 example: "Tenis"
 *               descripcion:
 *                 type: string
 *                 example: "Categoría de tenis para dama y caballero"
 *               orden:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       400:
 *         description: Error al crear la categoría
 */
router.post('/categoria', crearCategoria)

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear producto
 *     description: Registra un nuevo producto en el catálogo.
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_categoria
 *               - referencia
 *               - nombre
 *               - precio
 *             properties:
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *               referencia:
 *                 type: string
 *                 example: "VEL-001"
 *               nombre:
 *                 type: string
 *                 example: "Tenis deportivos"
 *               descripcion:
 *                 type: string
 *                 example: "Tenis deportivos para dama"
 *               marca:
 *                 type: string
 *                 example: "VELYSH"
 *               precio:
 *                 type: number
 *                 example: 150000
 *               genero:
 *                 type: string
 *                 example: "unisex"
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Error al crear el producto
 */
router.post('/', crearProducto)

/**
 * @swagger
 * /api/productos/categoria/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     description: Actualiza los datos de una categoría existente.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_categoria:
 *                 type: string
 *                 example: "Tenis deportivos"
 *               descripcion:
 *                 type: string
 *                 example: "Tenis para dama y caballero"
 *               orden:
 *                 type: integer
 *                 example: 2
 *               estado:
 *                 type: string
 *                 example: "activo"
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       400:
 *         description: Error al actualizar la categoría
 */
router.put('/categoria/:id', actualizarCategoria)

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     description: Actualiza la información de un producto existente.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Tenis deportivos VELYSH"
 *               descripcion:
 *                 type: string
 *                 example: "Tenis deportivos actualizados"
 *               marca:
 *                 type: string
 *                 example: "VELYSH"
 *               precio:
 *                 type: number
 *                 example: 180000
 *               estado:
 *                 type: string
 *                 example: "activo"
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *               genero:
 *                 type: string
 *                 example: "unisex"
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Error al actualizar el producto
 */
router.put('/:id', actualizarProducto)

/**
 * @swagger
 * /api/productos/categoria/{id}:
 *   delete:
 *     summary: Desactivar categoría
 *     description: Cambia el estado de una categoría a inactivo.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría desactivada exitosamente
 *       400:
 *         description: Error al desactivar la categoría
 */
router.delete('/categoria/:id', eliminarCategoria)

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     description: Elimina un producto del sistema.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       400:
 *         description: Error al eliminar el producto
 */
router.delete('/:id', eliminarProducto)

export default router