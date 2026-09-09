import { Router } from 'express'

import { login, registro, logout, yo } from '../controllers/auth.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registro, inicio y cierre de sesión
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Permite a un usuario iniciar sesión con su correo y contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "usuario@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales incorrectas
 *       403:
 *         description: Usuario inactivo
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/login', login)

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar usuario
 *     description: Registra un nuevo usuario en el sistema.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_documento
 *               - id_tipo_documento
 *               - nombre
 *               - apellido
 *               - correo
 *               - password
 *             properties:
 *               numero_documento:
 *                 type: string
 *                 example: "1234567890"
 *               id_tipo_documento:
 *                 type: integer
 *                 example: 1
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "juan@gmail.com"
 *               telefono:
 *                 type: string
 *                 example: "3001234567"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               id_rol:
 *                 type: integer
 *                 example: 2
 *                 description: Si no se envía, se asigna el rol 2 por defecto.
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error al registrar el usuario
 */
router.post('/registro', registro)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Elimina la cookie de autenticación del usuario.
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
router.post('/logout', logout)

/**
 * @swagger
 * /api/auth/yo:
 *   get:
 *     summary: Obtener usuario autenticado
 *     description: Obtiene los datos del usuario que tiene una sesión activa.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/yo', verificarToken, yo)

export default router;

