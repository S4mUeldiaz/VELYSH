// src/components/Inventariopage.jsx
import { useState, useEffect } from "react";
import { getStock, getProductos, getTallas, crearStock, editarStock, eliminarStock } from "../api/api";

export default function InventarioPage() {
  const [stock,      setStock]      = useState([]);
  const [productos,  setProductos]  = useState([]);
  const [tallas,     setTallas]     = useState([]);
  const [abierto,    setAbierto]    = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form,       setForm]       = useState({ id_producto: "", id_talla: "", color: "", stock_actual: "", stock_minimo: 5, stock_maximo: 100 });
  const [error,      setError]      = useState("");

  useEffect(() => {
    getStock().then(setStock);
    getProductos().then(setProductos);
    getTallas().then(setTallas);
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function abrirCrear() {
    setForm({ id_producto: "", id_talla: "", color: "", stock_actual: "", stock_minimo: 5, stock_maximo: 100 });
    setEditandoId(null);
    setError("");
    setAbierto(true);
  }

  function abrirEditar(s) {
    setForm({ id_producto: s.id_producto, id_talla: s.id_talla, color: s.color, stock_actual: s.stock_actual, stock_minimo: s.stock_minimo, stock_maximo: s.stock_maximo });
    setEditandoId(s.id_stock);
    setError("");
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    setEditandoId(null);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!form.id_producto || !form.id_talla || form.stock_actual === "") {
      setError("Producto, talla y stock actual son obligatorios");
      return;
    }
    const datos = {
      id_producto:  Number(form.id_producto),
      id_talla:     Number(form.id_talla),
      color:        form.color,
      stock_actual: Number(form.stock_actual),
      stock_minimo: Number(form.stock_minimo),
      stock_maximo: Number(form.stock_maximo),
    };
    try {
      if (editandoId) {
        const actualizado = await editarStock(editandoId, datos);
        setStock(prev => prev.map(s =>
          s.id_stock === editandoId
            ? { ...actualizado, nombre_producto: productos.find(p => p.id_producto === actualizado.id_producto)?.nombre ?? "", talla: tallas.find(t => t.id_talla === actualizado.id_talla)?.talla ?? "" }
            : s
        ));
      } else {
        const nuevo = await crearStock(datos);
        setStock(prev => [...prev, {
          ...nuevo,
          nombre_producto: productos.find(p => p.id_producto === nuevo.id_producto)?.nombre ?? "",
          talla:           tallas.find(t => t.id_talla === nuevo.id_talla)?.talla ?? "",
        }]);
      }
      cerrar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar este registro de stock?")) return;
    await eliminarStock(id);
    setStock(prev => prev.filter(s => s.id_stock !== id));
  }

  return (
    <div>
      <h2>Inventario</h2>
      <button onClick={abrirCrear}>+ Agregar stock</button>

      {abierto && (
        <form onSubmit={handleGuardar}>
          <h3>{editandoId ? "Editar stock" : "Nuevo stock"}</h3>
          <div>
            <label>Producto</label><br />
            <select name="id_producto" value={form.id_producto} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {productos.map(p => (
                <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Talla</label><br />
            <select name="id_talla" value={form.id_talla} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {tallas.map(t => (
                <option key={t.id_talla} value={t.id_talla}>{t.talla}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Color</label><br />
            <input name="color" value={form.color} onChange={handleChange} />
          </div>
          <div>
            <label>Stock actual</label><br />
            <input name="stock_actual" type="number" value={form.stock_actual} onChange={handleChange} />
          </div>
          <div>
            <label>Stock mínimo</label><br />
            <input name="stock_minimo" type="number" value={form.stock_minimo} onChange={handleChange} />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">{editandoId ? "Actualizar" : "Guardar"}</button>
          <button type="button" onClick={cerrar}>Cancelar</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Producto</th><th>Talla</th><th>Color</th><th>Stock</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stock.map(s => (
            <tr key={s.id_stock}>
              <td>{s.nombre_producto}</td>
              <td>{s.talla}</td>
              <td>{s.color}</td>
              <td>{s.stock_actual}</td>
              <td>{s.estado}</td>
              <td>
                <button onClick={() => abrirEditar(s)}>Editar</button>
                <button onClick={() => handleEliminar(s.id_stock)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
