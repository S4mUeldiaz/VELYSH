import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrar } from "../api/api";
import "./RegisterPage.css";

export default function RegisterPage() {
  const [form, setForm] = useState({ 
    numero_documento: "",
    id_tipo_documento: 1,
    nombre: "", 
    apellido: "", 
    correo: "", 
    telefono: "", 
    password: "",
    id_rol: 2
  });
  const [error, setError] = useState("");
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
    navigate("/login");
  } catch (err) {
    console.log('error completo:', err)
    console.log('error response:', err.response?.data)
    setError(err.response?.data?.error || err.message);
  } finally {
    setCargando(false);
  }
}
  return (
    <div className="register-wrapper">
      <h2>Crear cuenta — VELYSH</h2>
      <form onSubmit={handleSubmit}>
        <div className="register-group">
          <label>Número de documento</label><br />
          <input className="register-input" name="numero_documento" value={form.numero_documento} onChange={handleChange} placeholder="Ej: 1234567890" />
        </div>
        <div className="register-group">
          <label>Tipo de documento</label><br />
          <select className="register-input" name="id_tipo_documento" value={form.id_tipo_documento} onChange={handleChange}>
            <option value={1}>Cédula de ciudadanía</option>
            <option value={2}>Cédula de extranjería</option>
            <option value={3}>Tarjeta de identidad</option>
            <option value={4}>Pasaporte</option>
            <option value={5}>NIT</option>
          </select>
        </div>
        <div className="register-group">
          <label>Nombre</label><br />
          <input className="register-input" name="nombre" value={form.nombre} onChange={handleChange} />
        </div>
        <div className="register-group">
          <label>Apellido</label><br />
          <input className="register-input" name="apellido" value={form.apellido} onChange={handleChange} />
        </div>
        <div className="register-group">
          <label>Correo</label><br />
          <input className="register-input" name="correo" type="email" value={form.correo} onChange={handleChange} />
        </div>
        <div className="register-group">
          <label>Teléfono</label><br />
          <input className="register-input" name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
        <div className="register-group">
          <label>Contraseña</label><br />
          <input className="register-input" name="password" type="password" value={form.password} onChange={handleChange} />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button className="register-button" type="submit" disabled={cargando}>
          {cargando ? "Registrando..." : "Registrarse"}
        </button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}