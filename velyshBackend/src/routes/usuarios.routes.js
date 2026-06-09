import { Router } from 'express'
import {
  obtenerUsuarios,
  obtenerUsuarioPorDocumento,
  actualizarUsuario,
  cambiarEstadoUsuario,
  obtenerDirecciones,
  agregarDireccion,
  eliminarDireccion
} from '../controllers/usuarios.controller.js'

const router = Router()

router.get('/', obtenerUsuarios)
router.get('/:numero_documento', obtenerUsuarioPorDocumento)
router.put('/:numero_documento', actualizarUsuario)
router.patch('/:numero_documento/estado', cambiarEstadoUsuario)
router.get('/:numero_documento/direcciones', obtenerDirecciones)
router.post('/:numero_documento/direcciones', agregarDireccion)
router.delete('/:numero_documento/direcciones/:id_direccion', eliminarDireccion)

export default router