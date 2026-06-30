import { FiSearch } from "react-icons/fi"
import "./EstadoVacio.css"

export default function EstadoVacio({ titulo, subtitulo, onLimpiar }) {
  return (
    <div className="estado-vacio">
      <FiSearch className="estado-vacio-icon" />
      <p className="estado-vacio-titulo">{titulo}</p>
      {subtitulo && <p className="estado-vacio-subtitulo">{subtitulo}</p>}
      {onLimpiar && (
        <button className="estado-vacio-btn" onClick={onLimpiar}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}