// src/components/LoginPage.jsx
import { useState }          from "react";
import { useNavigate, Link } from "react-router-dom";
import { login }             from "../api/api";

export default function LoginPage() {
  const [correo,     setCorreo]     = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error,      setError]      = useState("");
  const [cargando,   setCargando]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();   // Evita que el formulario recargue la página
    setError("");
    setCargando(true);
    try {
      // login() busca el usuario en memoria, genera el JWT con jose
      // y lo guarda en sessionStorage automáticamente
      await login(correo, contrasena);
      navigate("/productos"); // Redirige al dashboard principal
    } catch (err) {
      // El throw new Error(...) de api.js llega aquí como err.message
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-wrapper">
      <h2>Iniciar Sesión-VELYSH</h2>
      <form onSubmit={handleSubmit}>
        <div  className="login-group">
          <label>Correo</label>
          <input className="login-input"
            type="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            placeholder="admin@velysh.com"
          />
        </div>
        <div className="login-group">
          <label>Contraseña</label>
          <input className="login-input"
            type="password"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            placeholder="123456"
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button className="login-button" type="submit" disabled={cargando}>
          {cargando ? "Verificando..." : "Ingresar"}
        </button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}
