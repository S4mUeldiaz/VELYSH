import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "../data/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre:"", apellido:"", correo:"", telefono:"", contraseña:"" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const result = await registrar(form);
      alert("Usuario registrado correctamente");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
        <input placeholder="Apellido" value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})}/>
        <input type="email" placeholder="Correo" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})}/>
        <input placeholder="Teléfono" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/>
        <input type="password" placeholder="Contraseña" value={form.contraseña} onChange={e=>setForm({...form,contraseña:e.target.value})}/>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}