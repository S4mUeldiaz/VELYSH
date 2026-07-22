import { useState, useEffect } from "react"
import { getUsuarios, cambiarEstadoUsuario } from "../../Api/api"
import { FiSearch, FiUser } from "react-icons/fi"
import "./Usuarios.css"

function formatearFecha(fecha) {
  if (!fecha) return "Nunca"
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric"
  })
}

export default function Usuarios() {
  const [usuarios,  setUsuarios]  = useState([])
  const [busqueda,  setBusqueda]  = useState("")
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState("")
  const [procesando, setProcesando] = useState(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  function cargarUsuarios() {
    setCargando(true)
    getUsuarios()
      .then(setUsuarios)
      .catch(err => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false))
  }

  async function toggleEstado(usuario) {
    const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo"
    setProcesando(usuario.numero_documento)
    setError("")
    try {
      await cambiarEstadoUsuario(usuario.numero_documento, nuevoEstado)
      setUsuarios(prev => prev.map(u =>
        u.numero_documento === usuario.numero_documento ? { ...u, estado: nuevoEstado } : u
      ))
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setProcesando(null)
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const texto = `${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  return (
    <div className="usuarios-wrapper">
      <div className="usuarios-header">
        <h1 className="usuarios-title">Usuarios registrados</h1>
        <p className="usuarios-subtitle">{usuariosFiltrados.length} usuarios</p>
      </div>

      <div className="usuarios-buscador">
        <FiSearch />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="usuarios-error">{error}</p>}

      {cargando ? (
        <div className="usuarios-loading">Cargando usuarios...</div>
      ) : (
        <div className="usuarios-tabla-wrapper">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Última actividad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => (
                <tr key={u.numero_documento}>
                  <td className="usuarios-celda-nombre">
                    <span className="usuarios-avatar"><FiUser /></span>
                    {u.nombre} {u.apellido}
                  </td>
                  <td>{u.correo}</td>
                  <td>{u.roles?.nombre_rol ?? "—"}</td>
                  <td>{formatearFecha(u.fecha_ultima_actividad)}</td>
                  <td>
                    <span className={`usuarios-badge ${u.estado === "activo" ? "activo" : "inactivo"}`}>
                      {u.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`usuarios-btn-toggle ${u.estado === "activo" ? "desactivar" : "activar"}`}
                      onClick={() => toggleEstado(u)}
                      disabled={procesando === u.numero_documento}
                    >
                      {procesando === u.numero_documento
                        ? "..."
                        : u.estado === "activo" ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="usuarios-sin-resultados">No se encontraron usuarios</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}