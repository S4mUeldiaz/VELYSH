// src/components/Productospage.jsx
import { useState, useEffect } from "react";
import { getProductos, getCategorias, crearProducto, editarProducto, eliminarProducto } from "../api/api";

export default function ProductosPage() {
  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [abierto,    setAbierto]    = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form,       setForm]       = useState({ nombre: "", descripcion: "", marca: "", precio: "", id_categoria: "" });
  const [error,      setError]      = useState("");

  useEffect(() => {
    getProductos().then(setProductos);
    getCategorias().then(setCategorias);
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function abrirCrear() {
    setForm({ nombre: "", descripcion: "", marca: "", precio: "", id_categoria: "" });
    setEditandoId(null);
    setError("");
    setAbierto(true);
  }

  function abrirEditar(p) {
    setForm({ nombre: p.nombre, descripcion: p.descripcion, marca: p.marca, precio: p.precio, id_categoria: p.id_categoria });
    setEditandoId(p.id_producto);
    setError("");
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    setEditandoId(null);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.id_categoria) {
      setError("Nombre, precio y categoría son obligatorios");
      return;
    }
    try {
      const datos = { ...form, precio: Number(form.precio), id_categoria: Number(form.id_categoria) };
      if (editandoId) {
        const actualizado = await editarProducto(editandoId, datos);
        setProductos(prev => prev.map(p =>
          p.id_producto === editandoId
            ? { ...actualizado, nombre_categoria: categorias.find(c => c.id_categoria === actualizado.id_categoria)?.nombre_categoria ?? "" }
            : p
        ));
      } else {
        const nuevo = await crearProducto(datos);
        setProductos(prev => [...prev, {
          ...nuevo,
          nombre_categoria: categorias.find(c => c.id_categoria === nuevo.id_categoria)?.nombre_categoria ?? ""
        }]);
      }
      cerrar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Descontinuar este producto?")) return;
    await eliminarProducto(id);
    setProductos(prev => prev.filter(p => p.id_producto !== id));
  }

  return (
    <div className="productos-wrapper">
      <h2>Productos</h2>
      <button className="productos-btn-nuevo" onClick={abrirCrear}>+ Nuevo producto</button>

      {abierto && (
        <form className="productos-modal" onSubmit={handleGuardar}>
          <h3>{editandoId ? "Editar producto" : "Nuevo producto"}</h3>
          <div className="productos-form-group">
            <label>Nombre</label>
            <input className="productos-input" name="nombre" value={form.nombre} onChange={handleChange} />
          </div>
          <div className="productos-form-group">
            <label>Descripción</label>
            <input className="productos-input" name="descripcion" value={form.descripcion} onChange={handleChange} />
          </div>
          <div className="productos-form-group">
            <label>Marca</label>
            <input className="productos-input" name="marca" value={form.marca} onChange={handleChange} />
          </div>
          <div className="productos-form-group">
            <label>Precio</label>
            <input className="productos-input" name="precio" type="number" value={form.precio} onChange={handleChange} />
          </div>
          <div className="productos-form-group">
            <label>Categoría</label>
            <select className="productos-input" name="id_categoria" value={form.id_categoria} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
              ))}
            </select>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button className="btn" type="submit">{editandoId ? "Actualizar" : "Guardar"}</button>
          <button className="btn" type="button" onClick={cerrar}>Cancelar</button>
        </form>
      )}

      <table className="productos-tabla">
        <thead>
          <tr>
            <th>Nombre</th><th>Marca</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto}>
              <td>{p.nombre}</td>
              <td>{p.marca}</td>
              <td>{p.nombre_categoria}</td>
              <td>${p.precio.toLocaleString()}</td>
              <td>{p.estado}</td>
              <td>
                <button className="btn-editar" onClick={() => abrirEditar(p)}>Editar</button>
                <button className="btn-eliminar" onClick={() => handleEliminar(p.id_producto)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
