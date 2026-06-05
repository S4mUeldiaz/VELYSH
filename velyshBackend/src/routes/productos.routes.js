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

router.get('/categoria', obtenerCategorias)
router.get('/', obtenerProductos)
router.get('/:id', obtenerProductoPorId)
router.post('/categoria', crearCategoria)
router.post('/', crearProducto)
router.put('/categoria/:id', actualizarCategoria)
router.put('/:id', actualizarProducto)
router.delete('/categoria/:id', eliminarCategoria)
router.delete('/:id', eliminarProducto)

export default router