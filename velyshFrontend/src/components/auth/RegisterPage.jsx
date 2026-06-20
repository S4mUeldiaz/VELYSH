import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrar } from "../../Api/api";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCreditCard } from "react-icons/fi";
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
  const [verPassword, setVerPassword] = useState(false);
  const [error,       setError]       = useState("");
  const [cargando,    setCargando]    = useState(false);
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
      setError(err.response?.data?.error || err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="register-wrapper">
      <div className="register-left">
        <img src="/zapato.png" alt="Velysh" className="register-hero-img" />
      </div>

      <div className="register-right">
        <div className="register-logo">VELYSH</div>
        <h2 className="register-title">¿Deseas registrarte?</h2>

        <form className="register-form" onSubmit={handleSubmit}>

          <div className="register-row">
            <div className="register-group">
              <FiCreditCard className="register-icon" />
              <select
                className="register-input"
                name="id_tipo_documento"
                value={form.id_tipo_documento}
                onChange={handleChange}
              >
                <option value={1}>Cédula</option>
                <option value={2}>Cédula extranjería</option>
                <option value={3}>Tarjeta identidad</option>
                <option value={4}>Pasaporte</option>
                <option value={5}>NIT</option>
              </select>
            </div>
            <div className="register-group">
              <FiCreditCard className="register-icon" />
              <input
                className="register-input"
                name="numero_documento"
                value={form.numero_documento}
                onChange={handleChange}
                placeholder="Número de documento"
              />
            </div>
          </div>

          <div className="register-row">
            <div className="register-group">
              <FiUser className="register-icon" />
              <input
                className="register-input"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </div>
            <div className="register-group">
              <FiUser className="register-icon" />
              <input
                className="register-input"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div className="register-group">
            <FiMail className="register-icon" />
            <input
              className="register-input"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="Correo electrónico"
            />
          </div>

          <div className="register-group">
            <FiPhone className="register-icon" />
            <input
              className="register-input"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
            />
          </div>

          <div className="register-group">
            <FiLock className="register-icon" />
            <input
              className="register-input"
              name="password"
              type={verPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña"
            />
            <button
              type="button"
              className="register-eye"
              onClick={() => setVerPassword(prev => !prev)}
            >
              {verPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && <p className="register-error">{error}</p>}

          <button className="register-button" type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="register-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}