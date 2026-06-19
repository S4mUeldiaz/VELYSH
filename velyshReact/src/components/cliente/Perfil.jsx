import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUsuarioActual, actualizarUsuario, logout } from "../../Api/api"
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi"
import "./Perfil.css"

export default function Perfil() {
  const usuario  = getUsuarioActual()
  const navigate = useNavigate()
  const [verPassword, setVerPassword] = useState(false)
  const [form, setForm] = useState({
    nombre:   `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`,
    correo:   usuario?.correo ?? '',
    telefono: usuario?.telefono ?? '',
    password: ''
  })
  const [cargando, setCargando] = useState(false)
  const [mensaje,  setMensaje]  = useState("")
  const [error,    setError]    = useState("")

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setCargando(true)
    setMensaje("")
    setError("")
    try {
      const [nombre, ...apellidoParts] = form.nombre.split(' ')
      const apellido = apellidoParts.join(' ')
      await actualizarUsuario(usuario?.numero_documento, {
        nombre,
        apellido,
        telefono: form.telefono
      })
      setMensaje("Perfil actualizado exitosamente")
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setCargando(false)
    }
  }

  function handleEliminar() {
    if (!confirm("¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.")) return
    logout()
    navigate("/login")
  }

  return (
    <div className="perfil-wrapper">
      <button className="favoritos-back perfil-back" onClick={() => navigate(-1)}>
        <FiArrowLeft />
      </button>

      <div className="perfil-card">
        <form className="perfil-form" onSubmit={handleGuardar}>

          <div className="perfil-group">
            <label className="perfil-label">Nombre:</label>
            <input
              className="perfil-input"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="perfil-group">
            <label className="perfil-label">Correo Electrónico:</label>
            <input
              className="perfil-input"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              disabled
            />
          </div>

          <div className="perfil-group">
            <label className="perfil-label">Teléfono:</label>
            <input
              className="perfil-input"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="3001234567"
            />
          </div>

          <div className="perfil-group">
            <label className="perfil-label">Contraseña:</label>
            <div className="perfil-password-group">
              <input
                className="perfil-input"
                name="password"
                type={verPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="perfil-eye"
                onClick={() => setVerPassword(p => !p)}
              >
                {verPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {mensaje && <p className="perfil-mensaje">{mensaje}</p>}
          {error   && <p className="perfil-error">{error}</p>}

          <button className="perfil-btn-guardar" type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : "GUARDAR"}
          </button>

          <button
            className="perfil-btn-eliminar"
            type="button"
            onClick={handleEliminar}
          >
            ELIMINAR CUENTA
          </button>

        </form>
      </div>
    </div>
  )
}