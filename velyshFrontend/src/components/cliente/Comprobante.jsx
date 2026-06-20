import { useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { getUsuarioActual } from "../../Api/api"
import { FiCheckCircle, FiPrinter } from "react-icons/fi"
import "./Comprobante.css"

const ETIQUETAS_METODO_PAGO = {
  tarjeta: "Tarjeta",
  pse: "PSE",
  transferencia: "Transferencia",
  contraentrega: "Contraentrega"
}

export default function Comprobante() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const usuario = getUsuarioActual()

  // Si alguien recarga la página o llega por URL directa sin haber pasado
  // por el checkout, no hay datos del pedido que mostrar -> redirige a Historial.
  useEffect(() => {
    if (!state?.pedidos) navigate('/historial', { replace: true })
  }, [state, navigate])

  if (!state?.pedidos) return null

  const { pedidos, items, metodoPago, direccionTexto, total } = state
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric"
  })
  const referencias = pedidos.map(p => p.referencia).join(", ")

  return (
    <div className="comprobante-wrapper">
      <div className="comprobante-card comprobante-printable">

        <div className="comprobante-exito">
          <FiCheckCircle className="comprobante-exito-icon" />
          <h1 className="comprobante-titulo">Pago confirmado</h1>
          <p className="comprobante-subtitulo">
            Este es un pago simulado para fines de demostración del proyecto VELYSH —
            no se realizó ningún cargo real.
          </p>
        </div>

        <div className="comprobante-datos">
          <div className="comprobante-fila">
            <span>Referencia(s) de pedido</span>
            <strong>{referencias}</strong>
          </div>
          <div className="comprobante-fila">
            <span>Cliente</span>
            <strong>{usuario?.nombre} {usuario?.apellido}</strong>
          </div>
          <div className="comprobante-fila">
            <span>Correo</span>
            <strong>{usuario?.correo}</strong>
          </div>
          <div className="comprobante-fila">
            <span>Dirección de entrega</span>
            <strong>{direccionTexto}</strong>
          </div>
          <div className="comprobante-fila">
            <span>Método de pago</span>
            <strong>{ETIQUETAS_METODO_PAGO[metodoPago] ?? metodoPago}</strong>
          </div>
          <div className="comprobante-fila">
            <span>Fecha</span>
            <strong>{fecha}</strong>
          </div>
        </div>

        <table className="comprobante-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Color / Talla</th>
              <th>Cant.</th>
              <th>Precio unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id_stock}>
                <td>{item.nombre}</td>
                <td>{item.color} / {item.talla}</td>
                <td>{item.cantidad}</td>
                <td>${Number(item.precio).toLocaleString()}</td>
                <td>${(item.precio * item.cantidad).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="comprobante-total-label">Total pagado</td>
              <td className="comprobante-total-valor">${Number(total).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="comprobante-acciones">
          <button className="comprobante-btn-imprimir" onClick={() => window.print()}>
            <FiPrinter /> Imprimir / Guardar PDF
          </button>
          <Link to="/historial" className="comprobante-btn-historial">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}