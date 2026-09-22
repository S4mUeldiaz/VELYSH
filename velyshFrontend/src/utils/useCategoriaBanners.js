import { useMemo } from "react"
import { obtenerImagenPrincipal } from "./imagenes"

// Intervalo (en cantidad de productos) entre banners — 10, 8, 12 en ciclo,
// siempre dentro del rango 8-12, sin aleatoriedad para que el layout no
// "salte" entre renders. Mismo criterio que AppMovil (useCategoriaBanners.ts).
const INTERVALOS_BANNER = [10, 8, 12]

// Categorías elegibles para banner: cualquiera con al menos un producto que
// tenga una foto real (no el placeholder). Se deriva de los datos ya
// cargados, nada hardcodeado.
export function useCategoriasConImagen(categorias, productos) {
  return useMemo(() => {
    return categorias
      .map(categoria => {
        const productoConImagen = productos.find(
          p => p.id_categoria === categoria.id_categoria && p.imagenes_producto?.length > 0
        )
        return productoConImagen
          ? { categoria, imagen: obtenerImagenPrincipal(productoConImagen) }
          : null
      })
      .filter(Boolean)
  }, [categorias, productos])
}

// Intercala un banner de ancho completo cada 8-12 productos. A diferencia de
// AppMovil (grid rígido de 2 columnas en FlatList, necesita "spacers" para
// cuadrar filas), la grilla del web es CSS grid con columnas variables — el
// banner solo necesita grid-column:1/-1 y el resto de la fila se acomoda solo.
export function useProductosConBanners(productos, categoriasConImagen) {
  return useMemo(() => {
    if (categoriasConImagen.length === 0) {
      return productos.map(producto => ({ tipo: 'producto', producto }))
    }

    const resultado = []
    let intervaloIdx = 0
    let desdeBanner = 0

    productos.forEach(producto => {
      resultado.push({ tipo: 'producto', producto })
      desdeBanner++

      const umbral = INTERVALOS_BANNER[intervaloIdx % INTERVALOS_BANNER.length]
      if (desdeBanner >= umbral) {
        const { categoria, imagen } = categoriasConImagen[intervaloIdx % categoriasConImagen.length]
        resultado.push({ tipo: 'bannerCategoria', id: `banner-${resultado.length}`, categoria, imagen })
        desdeBanner = 0
        intervaloIdx++
      }
    })

    return resultado
  }, [productos, categoriasConImagen])
}
