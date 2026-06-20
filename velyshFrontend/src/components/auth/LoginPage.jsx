import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../Api/api";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
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
      <div className="login-left">
        <img src="public/zapatos.png" alt="Velysh" className="login-hero-img" />
      </div>

      <div className="login-right">
        <div className="login-logo">VELYSH</div>
        <h2 className="login-title">¿Deseas iniciar sesión?</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-group">
            <FiMail className="login-icon" />
            <input
              className="login-input"
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="Correo electrónico"
            />
          </div>

          <div className="login-group">
            <FiLock className="login-icon" />
            <input
              className="login-input"
              type={verPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setVerPassword(prev => !prev)}
            >
              {verPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Link to="/recuperar" className="login-forgot">¿Olvidaste tu contraseña?</Link>

          {error && <p className="login-error">{error}</p>}

          <button className="login-button" type="submit" disabled={cargando}>
            {cargando ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}