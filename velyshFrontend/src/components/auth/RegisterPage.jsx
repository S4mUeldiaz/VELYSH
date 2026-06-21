import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrar } from "../../Api/api";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCreditCard, FiArrowLeft } from "react-icons/fi";
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
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (form.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

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
      <div className="register-topbar">
        <button
          type="button"
          className="register-back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <FiArrowLeft />
        </button>
        <span className="register-logo">VELYSH</span>
      </div>

      <h1 className="register-title">¿Deseas registrarte?</h1>

      <div className="register-card">
        <form className="register-form" onSubmit={handleSubmit}>

          <div className="register-row">
            <div className="register-field" style={{ flex: "0 0 130px", minWidth: 0 }}>
              <label className="register-label" htmlFor="id_tipo_documento">Tipo doc.</label>
              <div className="register-group">
                <FiCreditCard className="register-icon" />
                <select
                  id="id_tipo_documento"
                  className="register-input"
                  name="id_tipo_documento"
                  value={form.id_tipo_documento}
                  onChange={handleChange}
                >
                  <option value={1}>Cédula</option>
                  <option value={2}>C. extranjería</option>
                  <option value={3}>T. identidad</option>
                  <option value={4}>Pasaporte</option>
                  <option value={5}>NIT</option>
                </select>
              </div>
            </div>
            <div className="register-field">
              <label className="register-label" htmlFor="numero_documento">Número documento</label>
              <div className="register-group">
                <FiCreditCard className="register-icon" />
                <input
                  id="numero_documento"
                  className="register-input"
                  name="numero_documento"
                  value={form.numero_documento}
                  onChange={handleChange}
                  placeholder="0000000000"
                />
              </div>
            </div>
          </div>

          <div className="register-row">
            <div className="register-field">
              <label className="register-label" htmlFor="nombre">Nombres</label>
              <div className="register-group">
                <FiUser className="register-icon" />
                <input
                  id="nombre"
                  className="register-input"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre"
                />
              </div>
            </div>
            <div className="register-field">
              <label className="register-label" htmlFor="apellido">Apellidos</label>
              <div className="register-group">
                <FiUser className="register-icon" />
                <input
                  id="apellido"
                  className="register-input"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Apellido"
                />
              </div>
            </div>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="telefono">Nro. celular</label>
            <div className="register-group">
              <FiPhone className="register-icon" />
              <input
                id="telefono"
                className="register-input"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="300 000 0000"
              />
            </div>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="correo">Correo electrónico</label>
            <div className="register-group">
              <FiMail className="register-icon" />
              <input
                id="correo"
                className="register-input"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="password">Contraseña</label>
            <div className="register-group">
              <FiLock className="register-icon" />
              <input
                id="password"
                className="register-input"
                name="password"
                type={verPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="register-eye"
                onClick={() => setVerPassword(prev => !prev)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="confirmPassword">Confirmación de contraseña</label>
            <div className="register-group">
              <FiLock className="register-icon" />
              <input
                id="confirmPassword"
                className="register-input"
                type={verPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="register-error">{error}</p>}

          <button className="register-button" type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className="register-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}