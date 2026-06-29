// Centraliza la lógica de imagen principal de producto y el manejo de
// imágenes rotas/faltantes.
export const PLACEHOLDER_PRODUCTO = '/placeholder-producto.svg'
export function obtenerImagenPrincipal(producto) {
  const imagenes = producto?.imagenes_producto
  if (!imagenes || imagenes.length === 0) return PLACEHOLDER_PRODUCTO

  const principal = [...imagenes].sort((a, b) => a.orden - b.orden)[0]
  return principal?.url_imagen || PLACEHOLDER_PRODUCTO
}
export function manejarErrorImagen(e) {
  if (!e.target.src.includes(PLACEHOLDER_PRODUCTO)) {
    e.target.onerror = null
    e.target.src = PLACEHOLDER_PRODUCTO
  }
}