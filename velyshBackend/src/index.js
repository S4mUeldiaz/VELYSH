import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes from './routes/auth.routes.js'
import productosRoutes from './routes/productos.routes.js'
import favoritosRoutes from './routes/favoritos.routes.js'
import facturaRoutes from './routes/factura.routes.js'
import tipoDocumentoRoutes from './routes/tipoDocumento.routes.js'


const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)

app.use('/api/productos', productosRoutes)
app.use('/api/favoritos', favoritosRoutes)
app.use('/api/factura', facturaRoutes)
app.use('/api/tipo-documento', tipoDocumentoRoutes)
})