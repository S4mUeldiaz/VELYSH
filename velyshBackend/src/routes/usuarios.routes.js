// Este router solo lleva verificarToken desde index.js. Cada ruta decide acá
// mismo si exige rol admin (gestión de OTROS usuarios: listar, activar/
// desactivar) o si basta con ser el dueño del recurso (autoservicio: editar
// mi perfil, cambiar mi contraseña, eliminar mi cuenta) vía
// verificarPropioOAdmin. La foto de perfil vive aparte, en perfil.routes.js.
import { Router } from 'express'
import { verificarRol, verificarPropioOAdmin } from '../middlewares/auth.middleware.js'

import {
  obtenerUsuarios,
  obtenerUsuarioPorDocumento,
  actualizarUsuario,
  cambiarEstadoUsuario,
  cambiarPassword,
  eliminarCuenta,
  obtenerDirecciones,
  agregarDireccion,
  eliminarDireccion
} from '../controllers/usuarios.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y direcciones
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *       400:
 *         description: Error al consultar los usuarios
 */
router.get('/', verificarRol('admin'), obtenerUsuarios)

/**
 * @swagger
 * /api/usuarios/{numero_documento}:
 *   get:
 *     summary: Obtener un usuario por documento
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:numero_documento', verificarRol('admin'), obtenerUsuarioPorDocumento)

/**
 * @swagger
 * /api/usuarios/{numero_documento}:
 *   put:
 *     summary: Actualizar información de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               telefono:
 *                 type: string
 *                 example: "3001234567"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Error al actualizar el usuario
 */
router.put('/:numero_documento', verificarPropioOAdmin, actualizarUsuario)

/**
 * @swagger
 * /api/usuarios/{numero_documento}/estado:
 *   patch:
 *     summary: Cambiar estado de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
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
 *                 example: "activo"
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado exitosamente
 *       400:
 *         description: Estado inválido o error al actualizar
 */
router.patch('/:numero_documento/estado', verificarRol('admin'), cambiarEstadoUsuario)

/**
 * @swagger
 * /api/usuarios/{numero_documento}/password:
 *   patch:
 *     summary: Cambiar contraseña de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password_actual
 *               - password_nueva
 *             properties:
 *               password_actual:
 *                 type: string
 *                 example: "123456"
 *               password_nueva:
 *                 type: string
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Datos de contraseña inválidos
 *       401:
 *         description: La contraseña actual no es correcta
 *       404:
 *         description: Usuario no encontrado
 */
router.patch('/:numero_documento/password', verificarPropioOAdmin, cambiarPassword)

/**
 * @swagger
 * /api/usuarios/{numero_documento}/cuenta:
 *   delete:
 *     summary: Eliminar cuenta de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *       401:
 *         description: La contraseña no es correcta
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:numero_documento/cuenta', verificarPropioOAdmin, eliminarCuenta)

/**
 * @swagger
 * /api/usuarios/{numero_documento}/direcciones:
 *   get:
 *     summary: Obtener direcciones de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     responses:
 *       200:
 *         description: Lista de direcciones obtenida correctamente
 *       400:
 *         description: Error al consultar las direcciones
 */
router.get('/:numero_documento/direcciones', verificarRol('admin'), obtenerDirecciones)

/**
 * @swagger
 * /api/usuarios/{numero_documento}/direcciones:
 *   post:
 *     summary: Agregar una dirección a un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - direccion
 *             properties:
 *               direccion:
 *                 type: string
 *                 example: "Calle 50 # 20-30"
 *               ciudad:
 *                 type: string
 *                 example: "Bogotá"
 *               departamento:
 *                 type: string
 *                 example: "Cundinamarca"
 *               codigo_postal:
 *                 type: string
 *                 example: "110111"
 *     responses:
 *       201:
 *         description: Dirección agregada exitosamente
 *       400:
 *         description: Error al agregar la dirección
 */
router.post('/:numero_documento/direcciones', verificarRol('admin'), agregarDireccion)

/**
 * @swagger
 * /api/usuarios/{numero_documento}/direcciones/{id_direccion}:
 *   delete:
 *     summary: Eliminar una dirección
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del usuario
 *       - in: path
 *         name: id_direccion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la dirección
 *     responses:
 *       200:
 *         description: Dirección eliminada exitosamente
 *       400:
 *         description: Error al eliminar la dirección
 */
router.delete('/:numero_documento/direcciones/:id_direccion', verificarRol('admin'), eliminarDireccion)

export default router