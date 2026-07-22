import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import { verificarToken, verificarRol } from './middlewares/auth.middleware.js'
import authRoutes from './routes/auth.routes.js'
import productosRoutes from './routes/productos.routes.js'
import favoritosRoutes from './routes/favoritos.routes.js'
import facturaRoutes from './routes/factura.routes.js'
import tipoDocumentoRoutes from './routes/tipoDocumento.routes.js'
import tallasRoutes from './routes/tallas.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import devolucionesRoutes from './routes/devoluciones.routes.js'
import stockRoutes from './routes/stock.routes.js'
import imagenesProductoRoutes from './routes/imagenesProducto.routes.js'
import rolesRoutes from './routes/roles.routes.js'
import movimientoInventarioRoutes from './routes/movimientoInventario.routes.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,   // permite enviar/recibir la cookie httpOnly
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/productos',      productosRoutes)
app.use('/api/tallas',         tallasRoutes)
app.use('/api/tipo-documento', tipoDocumentoRoutes)

// ── RUTAS PROTEGIDAS

app.use('/api/pedidos',      verificarToken, pedidosRoutes)
app.use('/api/favoritos',    verificarToken, favoritosRoutes)

app.use('/api/stock', stockRoutes)
app.use('/api/factura',      verificarToken, facturaRoutes)
app.use('/api/devoluciones', verificarToken, devolucionesRoutes)
app.use('/api/imagenes-producto', verificarToken, imagenesProductoRoutes)
app.use('/api/usuarios', verificarToken, verificarRol('admin'), usuariosRoutes)
app.use('/api/roles', verificarToken, verificarRol('admin'), rolesRoutes)
app.use('/api/movimiento-inventario', verificarToken, verificarRol('admin', 'operador'), movimientoInventarioRoutes)
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)

app.use('/api/usuarios', verificarToken, usuariosRoutes)
app.use('/api/movimiento-inventario', verificarToken, verificarRol('admin', 'operador'), movimientoInventarioRoutes)

app.use('/api/productos', productosRoutes)
app.use('/api/favoritos', favoritosRoutes)
app.use('/api/factura', facturaRoutes)
app.use('/api/tipo-documento', tipoDocumentoRoutes)
app.use('/api/tallas', tallasRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/devoluciones', devolucionesRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/imagenes-producto', imagenesProductoRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/movimiento-inventario', movimientoInventarioRoutes)

})
