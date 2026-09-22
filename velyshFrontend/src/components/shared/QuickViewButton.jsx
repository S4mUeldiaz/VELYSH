import { FiEye } from "react-icons/fi"
import "./QuickViewButton.css"

// Fila fija entre la imagen y la info de la card — no un overlay sobre la
// foto. Antes vivía encima de la imagen (position: absolute) y tapaba el
// producto en varias proporciones de foto; mismo criterio ya aplicado en
// AppMovil (ver QuickViewButton.tsx).
export default function QuickViewButton({ onClick }) {
  return (
    <button
      type="button"
      className="quickview-trigger"
      onClick={onClick}
      aria-label="Vista rápida"
    >
      <FiEye /> Vista rápida
    </button>
  )
}
