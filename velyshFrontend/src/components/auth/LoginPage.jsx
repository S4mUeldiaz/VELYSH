import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../Api/api";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import "./LoginPage.css";

export default function LoginPage() {
  const [correo,      setCorreo]      = useState("");
  const [password,    setPassword]    = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error,       setError]       = useState("");
  const [cargando,    setCargando]    = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const usuario = await login(correo, password);
      if (usuario.nombre_rol === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-topbar">
        <button
          type="button"
          className="login-back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <FiArrowLeft />
        </button>
        <span className="login-logo">VELYSH</span>
      </div>

      <h1 className="login-title">¿Deseas iniciar sesión?</h1>

      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="login-label" htmlFor="correo">Correo electrónico:</label>
            <div className="login-group">
              <FiMail className="login-icon" />
              <input
                id="correo"
                className="login-input"
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div>
            <label className="login-label" htmlFor="password">Contraseña:</label>
            <div className="login-group">
              <FiLock className="login-icon" />
              <input
                id="password"
                className="login-input"
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setVerPassword(prev => !prev)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-button" type="submit" disabled={cargando}>
            {cargando ? "Verificando..." : "Iniciar sesión"}
          </button>

          <Link to="/recuperar" className="login-forgot">¿Olvidaste tu contraseña?</Link>

          <div className="login-divider" />

          <button
            type="button"
            className="login-google"
            disabled
            title="Inicio de sesión con Google: próximamente"
          >
            <FcGoogle />
            Continuar con Google
          </button>
        </form>

        <p className="login-footer">
          ¿No estás registrado? <Link to="/register">Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}