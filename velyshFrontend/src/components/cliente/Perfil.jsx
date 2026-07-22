import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUsuarioActual, actualizarUsuario, cambiarPassword, eliminarCuenta, logout } from "../../Api/api"
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi"
import "./Perfil.css"

export default function Perfil() {
  const usuario  = getUsuarioActual()
  const navigate = useNavigate()
  const [verPassword,    setVerPassword]    = useState(false)
  const [verPasswordNew, setVerPasswordNew] = useState(false)

  const [form, setForm] = useState({
    nombre:   `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`,
    correo:   usuario?.correo ?? '',
    telefono: usuario?.telefono ?? ''
  })

  const [passwordForm, setPasswordForm] = useState({
    password_actual: '',
    password_nueva: ''
  })

  const [cargando,         setCargando]         = useState(false)
  const [cargandoPassword, setCargandoPassword] = useState(false)
  const [mensaje,  setMensaje]  = useState("")
  const [error,    setError]    = useState("")
  const [mensajePassword, setMensajePassword] = useState("")
  const [errorPassword,   setErrorPassword]   = useState("")

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleChangePassword(e) {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
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

  async function handleGuardarPassword(e) {
    e.preventDefault()
    setCargandoPassword(true)
    setMensajePassword("")
    setErrorPassword("")
    try {
      if (!passwordForm.password_actual || !passwordForm.password_nueva) {
        setErrorPassword("Completa ambos campos de contraseña")
        return
      }
      await cambiarPassword(usuario?.numero_documento, passwordForm)
      setMensajePassword("Contraseña actualizada exitosamente")
      setPasswordForm({ password_actual: '', password_nueva: '' })
    } catch (err) {
      setErrorPassword(err.response?.data?.error || err.message)
    } finally {
      setCargandoPassword(false)
    }
  }

  async function handleEliminar() {
    const password = prompt("Para eliminar tu cuenta, confirma tu contraseña:")
    if (!password) return

    if (!confirm("¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer desde tu perfil.")) return

    try {
      await eliminarCuenta(usuario?.numero_documento, password)
      await logout()
      navigate("/login")
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="perfil-wrapper">
      <div className="perfil-topbar">
        <button className="perfil-back" onClick={() => navigate(-1)} aria-label="Volver">
          <FiArrowLeft />
        </button>
        <span className="perfil-titulo-pagina">Mi perfil</span>
      </div>

      <div className="perfil-card">

        {/* SECCIÓN: datos personales */}
        <div className="perfil-seccion">
          <h2 className="perfil-seccion-titulo">Datos personales</h2>
          <form className="perfil-form" onSubmit={handleGuardar}>

            <div className="perfil-group">
              <label className="perfil-label" htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                className="perfil-input"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="perfil-group">
              <label className="perfil-label" htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
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
              <label className="perfil-label" htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                className="perfil-input"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="3001234567"
              />
            </div>

            {mensaje && <p className="perfil-mensaje">{mensaje}</p>}
            {error   && <p className="perfil-error">{error}</p>}

            <button className="perfil-btn-guardar" type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>

          </form>
        </div>

        {/* SECCIÓN: cambio de contraseña */}
        <div className="perfil-seccion">
          <h2 className="perfil-seccion-titulo">Cambiar contraseña</h2>
          <form className="perfil-form" onSubmit={handleGuardarPassword}>

            <div className="perfil-group">
              <label className="perfil-label" htmlFor="password_actual">Contraseña actual</label>
              <div className="perfil-password-group">
                <input
                  id="password_actual"
                  className="perfil-input"
                  name="password_actual"
                  type={verPassword ? "text" : "password"}
                  value={passwordForm.password_actual}
                  onChange={handleChangePassword}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  className="perfil-eye"
                  onClick={() => setVerPassword(p => !p)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="perfil-group">
              <label className="perfil-label" htmlFor="password_nueva">Nueva contraseña</label>
              <div className="perfil-password-group">
                <input
                  id="password_nueva"
                  className="perfil-input"
                  name="password_nueva"
                  type={verPasswordNew ? "text" : "password"}
                  value={passwordForm.password_nueva}
                  onChange={handleChangePassword}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="perfil-eye"
                  onClick={() => setVerPasswordNew(p => !p)}
                  aria-label={verPasswordNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPasswordNew ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {mensajePassword && <p className="perfil-mensaje">{mensajePassword}</p>}
            {errorPassword   && <p className="perfil-error">{errorPassword}</p>}

            <button className="perfil-btn-guardar" type="submit" disabled={cargandoPassword}>
              {cargandoPassword ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>

        <div className="perfil-seccion">
          <h2 className="perfil-seccion-titulo">Zona de peligro</h2>
          <p className="perfil-zona-peligro-texto">
            Eliminar tu cuenta es permanente y no se puede deshacer desde aquí.
          </p>
          <button
            className="perfil-btn-eliminar"
            type="button"
            onClick={handleEliminar}
          >
            Eliminar mi cuenta
          </button>
        </div>

      </div>
    </div>
  )
}