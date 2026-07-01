import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { FiMail, FiArrowLeft } from "react-icons/fi"
import "./RecuperarPassword.css"

export default function RecuperarPassword() {
  const [correo,    setCorreo]    = useState("")
  const [cargando,  setCargando]  = useState(false)
  const [enviado,   setEnviado]   = useState(false)
  const [error,     setError]     = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setCargando(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(correo, {
        redirectTo: `${window.location.origin}/restablecer-password`
      })

      if (resetError) throw resetError
      
      setEnviado(true)
    } catch (err) {
      setError(err.message || "No se pudo enviar el correo de recuperación")
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="recuperar-wrapper">
      <div className="recuperar-card">
        <Link to="/login" className="recuperar-back">
          <FiArrowLeft /> Volver a iniciar sesión
        </Link>

        <h2 className="recuperar-title">Encuentra tu cuenta</h2>

        {enviado ? (
          <p className="recuperar-mensaje">
            Si existe una cuenta asociada a <strong>{correo}</strong>, recibirás un correo
            con instrucciones para restablecer tu contraseña en unos minutos.
          </p>
        ) : (
          <form className="recuperar-form" onSubmit={handleSubmit}>
            <p className="recuperar-subtitulo">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <div className="recuperar-group">
              <FiMail className="recuperar-icon" />
              <input
                className="recuperar-input"
                type="email"
                required
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="Correo electrónico"
              />
            </div>

            {error && <p className="recuperar-error">{error}</p>}

            <button className="recuperar-button" type="submit" disabled={cargando}>
              {cargando ? "Enviando..." : "Continuar"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}