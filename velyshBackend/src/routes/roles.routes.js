import { Router } from 'express'

import {
  obtenerRoles,
  crearRol,
  actualizarRol,
  eliminarRol
} from '../controllers/roles.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuarios
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Lista de roles obtenida correctamente
 *       400:
 *         description: Error al consultar los roles
 */
router.get('/', obtenerRoles)

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_rol
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 example: "Administrador"
 *               descripcion:
 *                 type: string
 *                 example: "Rol con permisos administrativos"
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       400:
 *         description: Error al crear el rol
 */
router.post('/', crearRol)

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar un rol
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_rol
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 example: "Administrador"
 *               descripcion:
 *                 type: string
 *                 example: "Rol con permisos administrativos"
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *       400:
 *         description: Error al actualizar el rol
 */
router.put('/:id', actualizarRol)

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *       400:
 *         description: Error al eliminar el rol
 */
router.delete('/:id', eliminarRol)

export default router