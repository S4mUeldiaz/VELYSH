import { useState, useEffect } from "react"
import { getUsuarios, getPedidos, getCategorias, getStock } from "../../Api/api"
import { FiBell, FiSearch, FiUser, FiUsers, FiPackage } from "react-icons/fi"
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import "./Dashboard.css"

const COLORES = ["#4a6fa5", "#f5a623", "#e63946", "#2ec4b6", "#a8dadc"]

export default function Dashboard() {
  const [usuarios,   setUsuarios]   = useState([])
  const [pedidos,    setPedidos]    = useState([])
  const [stockData,  setStockData]  = useState([])
  const [cargando,   setCargando]   = useState(true)

  useEffect(() => {
    Promise.all([
      getUsuarios(),
      getPedidos(),
      getStock(),
      getCategorias()
    ]).then(([users, peds, stock, cats]) => {
      setUsuarios(users)
      setPedidos(peds)


      const stockPorCat = cats.map(c => ({
        name: c.nombre_categoria,
        value: stock
          .filter(s => s.productos?.id_categoria === c.id_categoria)
          .reduce((acc, s) => acc + s.stock_actual, 0)
      })).filter(c => c.value > 0)
      setStockData(stockPorCat)

      setCargando(false)
    })
  }, [])

  
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const ventasPorDia = dias.map(dia => ({
    dia,
    pedidos: pedidos.filter(p => {
      const fecha = new Date(p.fecha_pedido)
      return dias[fecha.getDay()] === dia
    }).length,
    ventas: pedidos.filter(p => {
      const fecha = new Date(p.fecha_pedido)
      return dias[fecha.getDay()] === dia
    }).reduce((acc, p) => acc + p.precio_total, 0)
  }))

  const pedidosPendientes = pedidos.filter(p => p.estado_pedido === 'pendiente').length

  return (
    <div className="dashboard-wrapper">

      
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-right">
          <button className="dashboard-icon-btn"><FiBell /></button>
          <div className="dashboard-search">
            <FiSearch />
            <input placeholder="¿Qué estás buscando?" />
          </div>
          <div className="dashboard-admin-info">
            <span>Admin VELYSH</span>
            <button className="dashboard-icon-btn"><FiUser /></button>
          </div>
        </div>
      </nav>

      {cargando ? (
        <div className="dashboard-loading">Cargando datos...</div>
      ) : (
        <div className="dashboard-content">

          
          <div className="dashboard-top">

           
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="dashboard-card-info">
                  <span className="dashboard-card-num">{usuarios.length}</span>
                  <span className="dashboard-card-label">Usuarios registrados</span>
                </div>
                <div className="dashboard-card-icon">
                  <FiUsers />
                </div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-info">
                  <span className="dashboard-card-num">{pedidosPendientes}</span>
                  <span className="dashboard-card-label">Pedidos pendientes</span>
                </div>
                <div className="dashboard-card-icon">
                  <FiPackage />
                </div>
              </div>
            </div>

            
            <div className="dashboard-torta">
              <h3 className="dashboard-section-title">Stock general</h3>
              <div className="dashboard-torta-content">
                <div className="dashboard-torta-legend">
                  {stockData.map((entry, i) => (
                    <div key={i} className="dashboard-legend-item">
                      <span className="dashboard-legend-dot" style={{ background: COLORES[i % COLORES.length] }} />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={stockData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stockData.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} unidades`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        
          <div className="dashboard-barras">
            <h3 className="dashboard-section-title">Ventas de la última semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorDia} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="dia" stroke="#9a9a9a" />
                <YAxis stroke="#9a9a9a" />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v, name) => [
                    name === 'ventas' ? `$${v.toLocaleString()}` : v,
                    name === 'ventas' ? 'Ventas' : 'Pedidos'
                  ]}
                />
                <Bar dataKey="pedidos" fill="#4a6fa5" radius={[4,4,0,0]} />
                <Bar dataKey="ventas"  fill="#f5a623" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}