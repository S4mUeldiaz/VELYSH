import { Router } from 'express'
import { login, registro, logout, yo } from '../controllers/auth.controller.js'
import { verificarToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', login)
router.post('/registro', registro)
router.post('/logout', logout)
router.get('/yo', verificarToken, yo)

export default router