// src/components/Ventaspage.jsx
import { useState, useEffect }  from "react";
import { getPedidos, getStock, crearPedido, eliminarPedido, getUsuarioActual } from "../api/api";

export default function VentasPage() {
  const [pedidos,    setPedidos]    = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [abierto,    setAbierto]    = useState(false);
  const [form,       setForm]       = useState({ id_stock: "", cantidad: 1, precio_unitario: "", metodo_pago: "tarjeta" });
  const [error,      setError]      = useState("");

  useEffect(() => {
    getPedidos().then(setPedidos);
    getStock().then(setStockItems);
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function cerrar() {
    setForm({ id_stock: "", cantidad: 1, precio_unitario: "", metodo_pago: "tarjeta" });
    setAbierto(false);
    setError("");
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!form.id_stock || !form.cantidad || !form.precio_unitario) {
      setError("Todos los campos son obligatorios");
      return;
    }
    // Tomamos el id del usuario desde sessionStorage (guardado al hacer login)
    const usuario = getUsuarioActual();
    try {
      await crearPedido({
        id_stock:        Number(form.id_stock),
        cantidad:        Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario),
        metodo_pago:     form.metodo_pago,
        id_usuario:      usuario?.id_usuario ?? 1,
      });
      // Recargamos pedidos y stock porque crearPedido descuenta unidades del stock
      const [pedidosActualizados, stockActualizado] = await Promise.all([
        getPedidos(),
        getStock(),
      ]);
      setPedidos(pedidosActualizados);
      setStockItems(stockActualizado);
      cerrar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar este pedido?")) return;
    await eliminarPedido(id);
    setPedidos(prev => prev.filter(p => p.id_pedido !== id));
  }

  return (
    <div>
      <h2>Ventas / Pedidos</h2>
      <button onClick={() => setAbierto(true)}>+ Nuevo pedido</button>

      {abierto && (
        <form onSubmit={handleGuardar}>
          <h3>Nuevo pedido</h3>
          <div>
            <label>Producto / Talla / Color</label><br />
            <select name="id_stock" value={form.id_stock} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {stockItems
                .filter(s => s.stock_actual > 0)
                .map(s => (
                  <option key={s.id_stock} value={s.id_stock}>
                    {s.nombre_producto} — T:{s.talla} — {s.color} (stock: {s.stock_actual})
                  </option>
                ))
              }
            </select>
          </div>
          <div>
            <label>Cantidad</label><br />
            <input name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleChange} />
          </div>
          <div>
            <label>Precio unitario</label><br />
            <input name="precio_unitario" type="number" value={form.precio_unitario} onChange={handleChange} />
          </div>
          <div>
            <label>Método de pago</label><br />
            <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
              <option value="tarjeta">Tarjeta</option>
              <option value="pse">PSE</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">Guardar pedido</button>
          <button type="button" onClick={cerrar}>Cancelar</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Referencia</th><th>Fecha</th><th>Total</th><th>Pago</th><th>Estado</th><th>Productos</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id_pedido}>
              <td>{p.referencia}</td>
              <td>{new Date(p.fecha_pedido).toLocaleDateString()}</td>
              <td>${p.precio_total.toLocaleString()}</td>
              <td>{p.metodo_pago}</td>
              <td>{p.estado_pedido}</td>
              <td>
                {p.detalles.map(d => (
                  <div key={d.id_detalle}>
                    {d.nombre_producto} x{d.cantidad} — T:{d.talla} — {d.color}
                  </div>
                ))}
              </td>
              <td>
                <button onClick={() => handleEliminar(p.id_pedido)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
