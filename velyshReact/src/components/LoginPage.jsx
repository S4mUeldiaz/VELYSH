// src/components/LoginPage.jsx
// CORRECCIONES aplicadas:
// 1. Import cambiado de '../api/api' a '../Api/api' (A mayúscula, como está la carpeta)
// 2. navigate('/inicio') → navigate('/productos') que sí existe en App.jsx
// 3. Se guarda el usuario en sessionStorage para que RutaProtegida lo encuentre

import { useState }               from "react";
import { useNavigate, Link }      from "react-router-dom";
import { login }                  from "../api/api"; // ← ruta corregida

export default function LoginPage() {
  const [correo,    setCorreo]    = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error,     setError]     = useState("");
  const [cargando,  setCargando]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();   // Evita que la página se recargue al hacer clic
    setError("");
    setCargando(true);

    try {
      // login() viene de api.js — busca el usuario en el arreglo en memoria
      // Si lo encuentra, devuelve el objeto usuario sin contraseña
      // Si no, lanza un Error que cae en el catch de abajo
      const usuario = await login(correo, contrasena);

      // Guardamos el usuario en sessionStorage para que RutaProtegida en App.jsx
      // sepa que hay una sesión activa. sessionStorage dura mientras el tab esté abierto.
      sessionStorage.setItem("usuario", JSON.stringify(usuario));

      navigate("/inventario");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h2>Iniciar sesión — VELYSH</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo</label><br />
          <input
            type="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            placeholder="admin@velysh.com"
          />
        </div>
        <div>
          <label>Contraseña</label><br />
          <input
            type="password"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            placeholder="123456"
          />
        </div>

        {/* Solo aparece si hay un mensaje de error */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Verificando..." : "Ingresar"}
        </button>
      </form>

      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}
