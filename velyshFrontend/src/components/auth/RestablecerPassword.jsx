import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import "./RestablecerPassword.css"

export default function RestablecerPassword() {
  const navigate = useNavigate()
  const [password,        setPassword]        = useState("")
  const [confirmacion,    setConfirmacion]     = useState("")
  const [verPassword,     setVerPassword]      = useState(false)
  const [cargando,        setCargando]         = useState(false)
  const [sesionValida,    setSesionValida]     = useState(null) // null = verificando
  const [error,           setError]            = useState("")
  const [exito,           setExito]            = useState(false)

  // El link del correo de Supabase crea automáticamente una sesión temporal
  // de "recovery" al cargar la página (gracias a detectSessionInUrl, activo
  // por defecto en supabase-js v2). Aquí solo confirmamos que esa sesión existe;
  // si alguien llega a esta URL sin pasar por el link del correo, no podrá continuar.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesionValida(!!data.session)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden")
      return
    }

    setCargando(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setExito(true)
      setTimeout(() => navigate("/login"), 2500)
    } catch (err) {
      setError(err.message || "No se pudo actualizar la contraseña")
    } finally {
      setCargando(false)
    }
  }

  if (sesionValida === null) {
    return <div className="restablecer-wrapper"><p className="restablecer-mensaje">Verificando enlace...</p></div>
  }

  if (sesionValida === false) {
    return (
      <div className="restablecer-wrapper">
        <div className="restablecer-card">
          <h2 className="restablecer-title">Enlace inválido o expirado</h2>
          <p className="restablecer-mensaje">
            Este enlace ya no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión.
          </p>
          <button className="restablecer-button" onClick={() => navigate("/recuperar")}>
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="restablecer-wrapper">
      <div className="restablecer-card">
        <h2 className="restablecer-title">Define tu nueva contraseña</h2>

        {exito ? (
          <p className="restablecer-mensaje">
            Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...
          </p>
        ) : (
          <form className="restablecer-form" onSubmit={handleSubmit}>
            <div className="restablecer-group">
              <FiLock className="restablecer-icon" />
              <input
                className="restablecer-input"
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
              />
              <button
                type="button"
                className="restablecer-eye"
                onClick={() => setVerPassword(p => !p)}
              >
                {verPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="restablecer-group">
              <FiLock className="restablecer-icon" />
              <input
                className="restablecer-input"
                type={verPassword ? "text" : "password"}
                value={confirmacion}
                onChange={e => setConfirmacion(e.target.value)}
                placeholder="Confirma la nueva contraseña"
              />
            </div>

            {error && <p className="restablecer-error">{error}</p>}

            <button className="restablecer-button" type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}