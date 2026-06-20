import { useState, useEffect } from "react"
import { getDevoluciones, actualizarDevolucion } from "../../Api/api"
import { FiSearch, FiPackage } from "react-icons/fi"
import "./Devoluciones.css"

function formatearFecha(fecha) {
  if (!fecha) return "—"
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric"
  })
}

function getBadgeClase(estado) {
  if (estado === "aprobada")  return "devoluciones-badge-aprobada"
  if (estado === "rechazada") return "devoluciones-badge-rechazada"
  if (estado === "procesada") return "devoluciones-badge-procesada"
  return "devoluciones-badge-solicitada"
}

export default function Devoluciones() {
  const [devoluciones, setDevoluciones] = useState([])
  const [busqueda,     setBusqueda]     = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todas")
  const [cargando,     setCargando]     = useState(true)
  const [error,        setError]        = useState("")
  const [procesando,   setProcesando]   = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  function cargar() {
    setCargando(true)
    getDevoluciones()
      .then(setDevoluciones)
      .catch(err => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false))
  }

  async function responder(id_devolucion, estado) {
    setProcesando(id_devolucion)
    setError("")
    try {
      await actualizarDevolucion(id_devolucion, { estado })
      setDevoluciones(prev => prev.map(d =>
        d.id_devolucion === id_devolucion
          ? { ...d, estado, fecha_respuesta: new Date().toISOString() }
          : d
      ))
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setProcesando(null)
    }
  }

  const filtradas = devoluciones.filter(d => {
    const nombreProducto = d.factura?.stock?.productos?.nombre ?? ""
    const referencia = d.pedidos?.referencia ?? ""
    const texto = `${nombreProducto} ${referencia} ${d.motivo}`.toLowerCase()
    const coincideTexto = texto.includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === "todas" ? true : d.estado === filtroEstado
    return coincideTexto && coincideEstado
  })

  return (
    <div className="devoluciones-wrapper">
      <div className="devoluciones-header">
        <h1 className="devoluciones-title">Devoluciones y cambios</h1>
        <p className="devoluciones-subtitle">{filtradas.length} solicitudes</p>
      </div>

      <div className="devoluciones-filtros">
        <div className="devoluciones-buscador">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por producto, pedido o motivo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className="devoluciones-select"
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="todas">Todos los estados</option>
          <option value="solicitada">Solicitada</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="procesada">Procesada</option>
        </select>
      </div>

      {error && <p className="devoluciones-error">{error}</p>}

      {cargando ? (
        <div className="devoluciones-loading">Cargando solicitudes...</div>
      ) : filtradas.length === 0 ? (
        <div className="devoluciones-empty">
          <FiPackage className="devoluciones-empty-icon" />
          <p>No hay solicitudes de devolución</p>
        </div>
      ) : (
        <div className="devoluciones-tabla-wrapper">
          <table className="devoluciones-tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Producto</th>
                <th>Motivo</th>
                <th>Solicitado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(d => (
                <tr key={d.id_devolucion}>
                  <td>{d.pedidos?.referencia ?? "—"}</td>
                  <td>
                    {d.factura?.stock?.productos?.nombre ?? "—"}
                    {d.factura?.stock?.color && (
                      <span className="devoluciones-detalle"> · {d.factura.stock.color} / {d.factura.stock.tallas?.talla}</span>
                    )}
                  </td>
                  <td className="devoluciones-motivo">{d.motivo}</td>
                  <td>{formatearFecha(d.fecha_solicitud)}</td>
                  <td>
                    <span className={`devoluciones-badge ${getBadgeClase(d.estado)}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td>
                    {d.estado === "solicitada" ? (
                      <div className="devoluciones-acciones">
                        <button
                          className="devoluciones-btn-aprobar"
                          onClick={() => responder(d.id_devolucion, "aprobada")}
                          disabled={procesando === d.id_devolucion}
                        >
                          Aprobar
                        </button>
                        <button
                          className="devoluciones-btn-rechazar"
                          onClick={() => responder(d.id_devolucion, "rechazada")}
                          disabled={procesando === d.id_devolucion}
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : d.estado === "aprobada" ? (
                      <button
                        className="devoluciones-btn-procesar"
                        onClick={() => responder(d.id_devolucion, "procesada")}
                        disabled={procesando === d.id_devolucion}
                      >
                        Marcar procesada
                      </button>
                    ) : (
                      <span className="devoluciones-sin-accion">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}