import { useState, useEffect } from "react"
import { getProductos, getStock, getPedidos } from "../../Api/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer, CartesianGrid } from "recharts"
import * as XLSX from "xlsx"
import { FiDownload, FiFileText } from "react-icons/fi"
import "./Reportes.css"

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function Reportes() {
  const [productos, setProductos] = useState([])
  const [stock,      setStock]     = useState([])
  const [pedidos,    setPedidos]   = useState([])
  const [tab,        setTab]       = useState("ventas") // ventas | productos | inventario
  const [cargando,   setCargando]  = useState(true)

  useEffect(() => {
    Promise.all([getProductos(), getStock(), getPedidos()])
      .then(([prods, st, peds]) => {
        setProductos(prods)
        setStock(st)
        setPedidos(peds)
        setCargando(false)
      })
  }, [])

  // VENTAS POR MES (año actual)
  const anioActual = new Date().getFullYear()
  const ventasPorMes = MESES.map((mes, i) => {
    const pedidosDelMes = pedidos.filter(p => {
      const fecha = new Date(p.fecha_pedido)
      return fecha.getMonth() === i && fecha.getFullYear() === anioActual
    })
    return {
      mes,
      ventas: pedidosDelMes.reduce((acc, p) => acc + Number(p.precio_total), 0),
      pedidos: pedidosDelMes.length
    }
  })

  const totalVentasAnio = ventasPorMes.reduce((acc, m) => acc + m.ventas, 0)
  const totalPedidosAnio = ventasPorMes.reduce((acc, m) => acc + m.pedidos, 0)

  // PRODUCTOS MAS VENDIDOS
  const productosMasVendidos = [...productos]
    .sort((a, b) => b.total_ventas - a.total_ventas)
    .slice(0, 8)
    .map(p => ({ nombre: p.nombre, ventas: p.total_ventas }))

  // INVENTARIO: valor por producto, agregando todas sus variantes de stock
  const inventarioPorProducto = productos.map(p => {
    const variantes = stock.filter(s => s.productos?.referencia === p.referencia)
    const stockTotal = variantes.reduce((acc, s) => acc + s.stock_actual, 0)
    const valorTotal = stockTotal * Number(p.precio)
    return {
      id_producto: p.id_producto,
      nombre: p.nombre,
      referencia: p.referencia,
      stockTotal,
      valorUnitario: Number(p.precio),
      valorTotal
    }
  })

  const valorInventarioTotal = inventarioPorProducto.reduce((acc, p) => acc + p.valorTotal, 0)

  // RF-16: EXPORTAR A EXCEL — genera un archivo .xlsx con los datos de la pestaña activa
  function exportarExcel() {
    let filas = []
    let nombreHoja = "Reporte"
    let nombreArchivo = "reporte_velysh.xlsx"

    if (tab === "ventas") {
      filas = ventasPorMes.map(m => ({ Mes: m.mes, Pedidos: m.pedidos, Ventas: m.ventas }))
      nombreHoja = "Ventas"
      nombreArchivo = `reporte_ventas_${anioActual}.xlsx`
    } else if (tab === "productos") {
      filas = productosMasVendidos.map(p => ({ Producto: p.nombre, "Unidades vendidas": p.ventas }))
      nombreHoja = "Productos mas vendidos"
      nombreArchivo = "reporte_productos_mas_vendidos.xlsx"
    } else {
      filas = inventarioPorProducto.map(p => ({
        Producto: p.nombre,
        Referencia: p.referencia,
        "Stock total": p.stockTotal,
        "Valor unitario": p.valorUnitario,
        "Valor total": p.valorTotal
      }))
      nombreHoja = "Inventario"
      nombreArchivo = "reporte_inventario.xlsx"
    }

    const hoja = XLSX.utils.json_to_sheet(filas)
    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, nombreHoja)
    XLSX.writeFile(libro, nombreArchivo)
  }

  // RF-16: EXPORTAR A PDF — usa el diálogo de impresión del navegador
  // ("Guardar como PDF" en el destino). No requiere librería de PDF en backend.
  function exportarPDF() {
    window.print()
  }

  if (cargando) return <div className="reportes-loading">Cargando reportes...</div>

  return (
    <div className="reportes-wrapper">
      <div className="reportes-header">
        <h1 className="reportes-title">Reportes</h1>
        <div className="reportes-export-btns">
          <button className="reportes-export-btn" onClick={exportarExcel}>
            <FiDownload /> Exportar Excel
          </button>
          <button className="reportes-export-btn" onClick={exportarPDF}>
            <FiFileText /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="reportes-tabs">
        <button className={`reportes-tab ${tab === "ventas" ? "active" : ""}`} onClick={() => setTab("ventas")}>
          Ventas
        </button>
        <button className={`reportes-tab ${tab === "productos" ? "active" : ""}`} onClick={() => setTab("productos")}>
          Productos más vendidos
        </button>
        <button className={`reportes-tab ${tab === "inventario" ? "active" : ""}`} onClick={() => setTab("inventario")}>
          Inventario
        </button>
      </div>

      {tab === "ventas" && (
        <div className="reportes-seccion reportes-printable">
          <h2 className="reportes-print-titulo">Reporte de ventas — VELYSH</h2>
          <div className="reportes-cards">
            <div className="reportes-card">
              <span className="reportes-card-num">${totalVentasAnio.toLocaleString()}</span>
              <span className="reportes-card-label">Ventas totales {anioActual}</span>
            </div>
            <div className="reportes-card">
              <span className="reportes-card-num">{totalPedidosAnio}</span>
              <span className="reportes-card-label">Pedidos {anioActual}</span>
            </div>
          </div>

          <h3 className="reportes-section-title">Tendencia de ventas por mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasPorMes} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2a2a2a" />
              <XAxis dataKey="mes" stroke="#9a9a9a" />
              <YAxis stroke="#9a9a9a" />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                formatter={(v) => `$${v.toLocaleString()}`}
              />
              <Line type="monotone" dataKey="ventas" stroke="#e63946" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === "productos" && (
        <div className="reportes-seccion reportes-printable">
          <h2 className="reportes-print-titulo">Productos más vendidos — VELYSH</h2>
          <h3 className="reportes-section-title">Top productos por unidades vendidas</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productosMasVendidos} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 10 }}>
              <CartesianGrid stroke="#2a2a2a" horizontal={false} />
              <XAxis type="number" stroke="#9a9a9a" />
              <YAxis dataKey="nombre" type="category" stroke="#9a9a9a" width={140} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
              <Bar dataKey="ventas" fill="#e63946" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === "inventario" && (
        <div className="reportes-seccion reportes-printable">
          <h2 className="reportes-print-titulo">Reporte de inventario — VELYSH</h2>
          <div className="reportes-cards">
            <div className="reportes-card">
              <span className="reportes-card-num">${valorInventarioTotal.toLocaleString()}</span>
              <span className="reportes-card-label">Valor total del inventario</span>
            </div>
            <div className="reportes-card">
              <span className="reportes-card-num">{inventarioPorProducto.length}</span>
              <span className="reportes-card-label">Productos en catálogo</span>
            </div>
          </div>

          <div className="reportes-tabla-wrapper">
            <table className="reportes-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Referencia</th>
                  <th>Stock total</th>
                  <th>Valor unitario</th>
                  <th>Valor total</th>
                </tr>
              </thead>
              <tbody>
                {inventarioPorProducto.map(p => (
                  <tr key={p.id_producto}>
                    <td>{p.nombre}</td>
                    <td>{p.referencia}</td>
                    <td>{p.stockTotal} Und</td>
                    <td>${p.valorUnitario.toLocaleString()}</td>
                    <td>${p.valorTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="reportes-tabla-total-label">Total</td>
                  <td className="reportes-tabla-total-valor">${valorInventarioTotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}