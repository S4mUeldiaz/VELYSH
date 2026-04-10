import { useState, useEffect } from "react";
import { getPedidos, getStock, crearPedido, eliminarPedido } from "../api/api";

export default function VentasPage() {
  const [pedidos,    setPedidos]    = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [abierto,    setAbierto]    = useState(false);
  const [form,       setForm]       = useState({ id_stock: "", cantidad: 1, precio_unitario: "", metodo_pago: "tarjeta" });
  const [error,      setError]      = useState("");

  useEffect(() => {
    getPedidos().then(setPedidos);
    // getStock ya viene con nombre_producto y talla desde api.js
    getStock().then(setStockItems);
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Cuando cambia el item de stock seleccionado, cargamos su precio automáticamente
  function handleStockChange(e) {
    const idStock = Number(e.target.value);
    const item = stockItems.find(s => s.id_stock === idStock);
    // Buscamos el precio del producto relacionado
    setForm(prev => ({ ...prev, id_stock: idStock, precio_unitario: item ? "" : "" }));
  }

  function cerrar() {
    setAbierto(false);
    setError("");
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!form.id_stock || !form.cantidad || !form.precio_unitario) {
      setError("Todos los campos son obligatorios");
      return;
    }
    try {
      const nuevo = await crearPedido({
        id_stock:        Number(form.id_stock),
        cantidad:        Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario),
        metodo_pago:     form.metodo_pago,
      });
      // Recargamos pedidos para ver el nuevo con sus detalles completos
      const actualizados = await getPedidos();
      setPedidos(actualizados);
      // También actualizamos el stock porque crearPedido descuenta unidades
      const stockActualizado = await getStock();
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
      <h2>Ventas</h2>
      <button onClick={() => { setForm({ id_stock: "", cantidad: 1, precio_unitario: "", metodo_pago: "tarjeta" }); setError(""); setAbierto(true); }}>
        + Nuevo pedido
      </button>

      {abierto && (
        <form onSubmit={handleGuardar}>
          <h3>Nuevo pedido</h3>

          <div>
            <label>Producto / Talla / Color</label><br />
            {/* Mostramos el stock disponible como opciones */}
            <select name="id_stock" value={form.id_stock} onChange={handleStockChange}>
              <option value="">-- Selecciona --</option>
              {stockItems
                .filter(s => s.stock_actual > 0) // Solo los que tienen stock
                .map(s => (
                  <option key={s.id_stock} value={s.id_stock}>
                    {s.nombre_producto} — Talla {s.talla} — {s.color} (stock: {s.stock_actual})
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

      {/* Lista de pedidos con sus detalles */}
      <table>
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Pago</th>
            <th>Estado</th>
            <th>Productos</th>
            <th>Acciones</th>
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
                {/* Mostramos los detalles del pedido en una celda */}
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