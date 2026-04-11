// src/components/RegisterPage.jsx
import { useState }          from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrar }         from "../api/api";

export default function RegisterPage() {
  const [form, setForm]       = useState({ nombre: "", apellido: "", correo: "", telefono: "", contraseña: "" });
  const [error, setError]     = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await registrar(form);
      navigate("/login"); // Tras registrarse va al login para iniciar sesión
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <h2>Crear cuenta — VELYSH</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label><br />
          <input name="nombre"     value={form.nombre}     onChange={handleChange} />
        </div>
        <div>
          <label>Apellido</label><br />
          <input name="apellido"   value={form.apellido}   onChange={handleChange} />
        </div>
        <div>
          <label>Correo</label><br />
          <input name="correo"     type="email" value={form.correo}     onChange={handleChange} />
        </div>
        <div>
          <label>Teléfono</label><br />
          <input name="telefono"   value={form.telefono}   onChange={handleChange} />
        </div>
        <div>
          <label>Contraseña</label><br />
          <input name="contraseña" type="password" value={form.contraseña} onChange={handleChange} />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? "Registrando..." : "Registrarse"}
        </button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}
