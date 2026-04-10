import { useState, useEffect } from "react";
import { getProductos, getCategorias, crearProducto, editarProducto, eliminarProducto } from "../api/api";

export default function ProductosPage() {
  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [abierto,    setAbierto]    = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = crear, número = editar
  const [form,       setForm]       = useState({ nombre: "", descripcion: "", marca: "", precio: "", id_categoria: "" });
  const [error,      setError]      = useState("");

  // Se ejecuta una vez al entrar a la página
  useEffect(() => {
    getProductos().then(setProductos);
    getCategorias().then(setCategorias);
  }, []);

  // Actualiza solo el campo que cambió en el formulario
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
      if (editandoId) {
        // Editar: reemplazamos el producto en la lista local
        const actualizado = await editarProducto(editandoId, { ...form, precio: Number(form.precio), id_categoria: Number(form.id_categoria) });
        setProductos(prev => prev.map(p => p.id_producto === editandoId ? { ...actualizado, nombre_categoria: categorias.find(c => c.id_categoria === actualizado.id_categoria)?.nombre_categoria ?? "" } : p));
      } else {
        // Crear: agregamos el nuevo al final de la lista
        const nuevo = await crearProducto({ ...form, precio: Number(form.precio), id_categoria: Number(form.id_categoria) });
        setProductos(prev => [...prev, { ...nuevo, nombre_categoria: categorias.find(c => c.id_categoria === nuevo.id_categoria)?.nombre_categoria ?? "" }]);
      }
      cerrar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Descontinuar este producto?")) return;
    await eliminarProducto(id);
    // Lo quitamos de la vista (en api.js cambia estado a "descontinuado")
    setProductos(prev => prev.filter(p => p.id_producto !== id));
  }

  return (
    <div>
      <h2>Productos</h2>
      <button onClick={abrirCrear}>+ Nuevo producto</button>

      {/* Formulario — aparece solo cuando abierto es true */}
      {abierto && (
        <form onSubmit={handleGuardar}>
          <h3>{editandoId ? "Editar producto" : "Nuevo producto"}</h3>

          <div>
            <label>Nombre</label><br />
            <input name="nombre" value={form.nombre} onChange={handleChange} />
          </div>
          <div>
            <label>Descripción</label><br />
            <input name="descripcion" value={form.descripcion} onChange={handleChange} />
          </div>
          <div>
            <label>Marca</label><br />
            <input name="marca" value={form.marca} onChange={handleChange} />
          </div>
          <div>
            <label>Precio</label><br />
            <input name="precio" type="number" value={form.precio} onChange={handleChange} />
          </div>
          <div>
            <label>Categoría</label><br />
            {/* select genera el menú desplegable con las categorías de tu api */}
            <select name="id_categoria" value={form.id_categoria} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit">{editandoId ? "Actualizar" : "Guardar"}</button>
          <button type="button" onClick={cerrar}>Cancelar</button>
        </form>
      )}

      {/* Tabla de productos */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
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
                <button onClick={() => abrirEditar(p)}>Editar</button>
                <button onClick={() => handleEliminar(p.id_producto)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}