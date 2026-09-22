import { Link } from "react-router-dom"
import "./BannerCategoria.css"

// Banner grande de una sola foto por categoría, intercalado entre productos
// en la grilla — mismo criterio editorial que AppMovil (BannerCategoria.tsx):
// una foto, no una grilla. La proporción es más ancha que en mobile porque
// aquí ocupa el ancho completo de la grilla (columnas variables), no la mitad
// de un grid fijo de 2 columnas.
export default function BannerCategoria({ imagen, nombre, idCategoria }) {
  return (
    <Link to={`/catalogo?categoria=${idCategoria}`} className="banner-categoria">
      <img src={imagen} alt="" className="banner-categoria-img" />
      <span className="banner-categoria-texto">{nombre}</span>
    </Link>
  )
}
