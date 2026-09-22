const DIAS_PARA_SER_NUEVO = 30

// Misma regla que AppMovil (utils/producto.ts). OJO: el backend todavía no
// selecciona `fecha_creacion` en /api/productos, así que esto devuelve false
// siempre por ahora — igual que en mobile hoy. Queda listo para cuando se
// agregue la columna a la respuesta, sin tener que tocar esta función.
export function esProductoNuevo(fecha_creacion) {
  if (!fecha_creacion) return false
  const dias = (Date.now() - new Date(fecha_creacion).getTime()) / (1000 * 60 * 60 * 24)
  return dias >= 0 && dias <= DIAS_PARA_SER_NUEVO
}
