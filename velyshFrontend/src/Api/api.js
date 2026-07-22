import axios from 'axios'

const BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // manda la cookie httpOnly en cada request
})

export async function login(correo, password) {
  const { data } = await api.post('/auth/login', { correo, password })
  const usuario = {
    ...data.usuario,
    nombre_rol: data.usuario.roles?.nombre_rol ?? ''
  }
  sessionStorage.setItem('usuario', JSON.stringify(usuario))
  return usuario
}

export async function registrar(datos) {
  const { data } = await api.post('/auth/registro', datos)
  return data
}

export async function logout() {
  await api.post('/auth/logout')      // ahora es async: invalida la cookie en el servidor
  sessionStorage.removeItem('usuario')
}

export async function getSesion() {
  const { data } = await api.get('/auth/yo')   // rehidrata la sesión tras recargar
  const usuario = {
    ...data.usuario,
    nombre_rol: data.usuario.roles?.nombre_rol ?? ''
  }
  sessionStorage.setItem('usuario', JSON.stringify(usuario))
  return usuario
}

export function getUsuarioActual() {
  const raw = sessionStorage.getItem('usuario')
  return raw ? JSON.parse(raw) : null
}

// ── CATEGORÍAS ─────────────────────────────────────────────────────────────────

export async function getCategorias() {
  const { data } = await api.get('/productos/categoria')
  return data
}

export async function crearCategoria(datos) {
  const { data } = await api.post('/productos/categoria', datos)
  return data
}

export async function editarCategoria(id, datos) {
  const { data } = await api.put(`/productos/categoria/${id}`, datos)
  return data
}

export async function eliminarCategoria(id) {
  const { data } = await api.delete(`/productos/categoria/${id}`)
  return data
}

// ── PRODUCTOS ──────────────────────────────────────────────────────────────────

export async function getProductos() {
  const { data } = await api.get('/productos')
  return data.map(p => ({
    ...p,
    nombre_categoria: p.categorias?.nombre_categoria ?? ''
  }))
}

export async function getProductoPorId(id) {
  const { data } = await api.get(`/productos/${id}`)
  return data
}

export async function crearProducto(datos) {
  const { data } = await api.post('/productos', datos)
  return {
    ...data,
    nombre_categoria: data.categorias?.nombre_categoria ?? ''
  }
}

export async function editarProducto(id, datos) {
  const { data } = await api.put(`/productos/${id}`, datos)
  return {
    ...data,
    nombre_categoria: data.categorias?.nombre_categoria ?? ''
  }
}

export async function eliminarProducto(id) {
  const { data } = await api.delete(`/productos/${id}`)
  return data
}

// ── TALLAS ─────────────────────────────────────────────────────────────────────

export async function getTallas() {
  const { data } = await api.get('/tallas')
  return data
}

// ── STOCK ──────────────────────────────────────────────────────────────────────

export async function getStock() {
  const { data } = await api.get('/stock')
  return data.map(s => ({
    ...s,
    nombre_producto: s.productos?.nombre ?? '',
    talla: s.tallas?.talla ?? '',
    precio: s.productos?.precio ?? 0
  }))
}

export async function getStockPorProducto(id) {
  const { data } = await api.get(`/stock/producto/${id}`)
  return data
}

export async function crearStock(datos) {
  const { data } = await api.post('/stock', datos)
  return {
    ...data,
    nombre_producto: data.productos?.nombre ?? '',
    talla: data.tallas?.talla ?? ''
  }
}

export async function actualizarStock(id, datos) {
  const { data } = await api.put(`/stock/${id}`, datos)
  return {
    ...data,
    nombre_producto: data.productos?.nombre ?? '',
    talla: data.tallas?.talla ?? ''
  }
}

export async function eliminarStock(id) {
  const { data } = await api.delete(`/stock/${id}`)
  return data
}

// ── PEDIDOS ────────────────────────────────────────────────────────────────────

export async function getPedidos() {
  const { data } = await api.get('/pedidos')
  return data.map(p => ({
    ...p,
    detalles: (p.factura ?? []).map(d => ({
      ...d,
      id_detalle: d.id_detalle,
      nombre_producto: d.stock?.productos?.nombre ?? '',
      talla: d.stock?.tallas?.talla ?? '',
      color: d.stock?.color ?? ''
    }))
  }))
}

export async function getPedidosPorUsuario(numero_documento) {
  const { data } = await api.get(`/pedidos/usuario/${numero_documento}`)
  return data
}

export async function crearPedido(datos) {
  const usuario = getUsuarioActual()
  const payload = {
    numero_documento: usuario?.numero_documento,
    metodo_pago: datos.metodo_pago,
    costo_envio: 0,
    direccion: datos.direccion,
    ciudad: datos.ciudad,
    departamento: datos.departamento,
    codigo_postal: datos.codigo_postal,
    items: [
      {
        id_stock: datos.id_stock,
        cantidad: datos.cantidad,
        precio_unitario: datos.precio_unitario
      }
    ]
  }
  const { data } = await api.post('/pedidos', payload)
  return data
}

export async function actualizarEstadoPedido(id, datos) {
  const { data } = await api.put(`/pedidos/${id}`, datos)
  return data
}

export async function cancelarPedido(id) {
  const { data } = await api.delete(`/pedidos/${id}`)
  return data
}

export async function crearDevolucion(datos) {
  const { data } = await api.post('/devoluciones', datos)
  return data
}

export async function getDevoluciones() {
  const { data } = await api.get('/devoluciones')
  return data
}

export async function actualizarDevolucion(id, datos) {
  const { data } = await api.put(`/devoluciones/${id}`, datos)
  return data
}

// ── FAVORITOS ──────────────────────────────────────────────────────────────────

export async function getFavoritos(numero_documento) {
  const { data } = await api.get(`/favoritos/${numero_documento}`)
  return data
}

export async function agregarFavorito(numero_documento, id_producto) {
  const { data } = await api.post('/favoritos', { numero_documento, id_producto })
  return data
}

export async function eliminarFavorito(numero_documento, id_producto) {
  const { data } = await api.delete(`/favoritos/${numero_documento}/${id_producto}`)
  return data
}

// ── USUARIOS ───────────────────────────────────────────────────────────────────

export async function getUsuarios() {
  const { data } = await api.get('/usuarios')
  return data
}

export async function actualizarUsuario(numero_documento, datos) {
  const { data } = await api.put(`/usuarios/${numero_documento}`, datos)
  return data
}

export async function cambiarEstadoUsuario(numero_documento, estado) {
  const { data } = await api.patch(`/usuarios/${numero_documento}/estado`, { estado })
  return data
}

export async function cambiarPassword(numero_documento, datos) {
  const { data } = await api.patch(`/usuarios/${numero_documento}/password`, datos)
  return data
}

export async function eliminarCuenta(numero_documento, password) {
  const { data } = await api.delete(`/usuarios/${numero_documento}/cuenta`, { data: { password } })
  return data
}