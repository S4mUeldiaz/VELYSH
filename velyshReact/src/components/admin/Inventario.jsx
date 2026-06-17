import { useState, useEffect } from "react"
import { getStock, getCategorias, crearStock, actualizarStock, getTallas, getProductos } from "../../Api/api"
import { FiSearch, FiBell, FiUser, FiDownload, FiEye } from "react-icons/fi"
import "./Inventario.css"

export default function Inventario() {
  const [stock,          setStock]          = useState([])
  const [categorias,     setCategorias]     = useState([])
  const [tallas,         setTallas]         = useState([])
  const [productos,      setProductos]      = useState([])
  const [busqueda,       setBusqueda]       = useState("")
  const [categoriaFiltro,setCategoriaFiltro]= useState("")
  const [nivelFiltro,    setNivelFiltro]    = useState("")
  const [cargando,       setCargando]       = useState(true)
  const [modalStock,     setModalStock]     = useState(null)

  useEffect(() => {
    Promise.all([getStock(), getCategorias(), getTallas(), getProductos()])
      .then(([s, c, t, p]) => {
        setStock(s)
        setCategorias(c)
        setTallas(t)
        setProductos(p)
        setCargando(false)
      })
  }, [])

  const stockFiltrado = stock.filter(s => {
    const coincideBusqueda = s.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro ? s.productos?.id_categoria === Number(categoriaFiltro) : true
    const coincideNivel = nivelFiltro ? s.estado === nivelFiltro : true
    return coincideBusqueda && coincideCategoria && coincideNivel
  })

  const totalProductos = stock.length
  const stockBajo = stock.filter(s => s.estado === 'bajo').length
  const sinStock = stock.filter(s => s.estado === 'agotado').length
  const valorStock = stock.reduce((acc, s) => acc + (s.stock_actual * (s.productos?.precio ?? 0)), 0)

  function getNivelLabel(estado) {
    if (estado === 'disponible') return { label: 'Normal', clase: 'nivel-normal' }
    if (estado === 'bajo') return { label: 'Stock bajo', clase: 'nivel-bajo' }
    if (estado === 'agotado') return { label: 'Sin stock', clase: 'nivel-agotado' }
    return { label: estado, clase: '' }
  }

  return (
    <div className="inventario-admin-wrapper">

      {/* NAVBAR */}
      <nav className="admin-navbar">
        <h1 className="admin-navbar-title">INVENTARIO</h1>
        <div className="admin-navbar-right">
          <button className="admin-icon-btn"><FiBell /></button>
          <div className="admin-search">
            <FiSearch />
            <input placeholder="¿Qué estás buscando?" />
          </div>
          <span className="admin-user-name">Admin VELYSH</span>
          <button className="admin-icon-btn"><FiUser /></button>
        </div>
      </nav>

      <div className="inventario-content">

        {/* CARDS */}
        <div className="inventario-cards">
          <div className="inventario-card" style={{ borderLeft: '3px solid #4a6fa5' }}>
            <span className="inventario-card-num">{totalProductos}</span>
            <span className="inventario-card-label">Productos totales</span>
          </div>
          <div className="inventario-card" style={{ borderLeft: '3px solid #f5a623' }}>
            <span className="inventario-card-num">{stockBajo}</span>
            <span className="inventario-card-label">Stock bajo</span>
          </div>
          <div className="inventario-card" style={{ borderLeft: '3px solid #2ec4b6' }}>
            <span className="inventario-card-num">${(valorStock / 1000000).toFixed(1)}M</span>
            <span className="inventario-card-label">Valor stock</span>
          </div>
          <div className="inventario-card" style={{ borderLeft: '3px solid #e63946' }}>
            <span className="inventario-card-num">{sinStock}</span>
            <span className="inventario-card-label">Sin stock</span>
          </div>
        </div>

        {/* FILTROS */}
        <div className="admin-filtros">
          <div className="admin-filtro-search">
            <FiSearch />
            <input
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <select className="admin-filtro-select" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
            <option value="">Categorías</option>
            {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
          </select>
          <select className="admin-filtro-select" value={nivelFiltro} onChange={e => setNivelFiltro(e.target.value)}>
            <option value="">Nivel stock</option>
            <option value="disponible">Normal</option>
            <option value="bajo">Stock bajo</option>
            <option value="agotado">Sin stock</option>
          </select>
          <button className="inventario-btn-reporte">
            <FiDownload /> Generar reporte
          </button>
        </div>

        {/* TABLA */}
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock total</th>
              <th>Stock talla</th>
              <th>Nivel</th>
              <th>Valor unitario</th>
              <th>Valor total</th>
            </tr>
          </thead>
          <tbody>
            {stockFiltrado.map(s => {
              const nivel = getNivelLabel(s.estado)
              const precio = s.productos?.precio ?? 0
              return (
                <tr key={s.id_stock}>
                  <td>
                    <p className="admin-producto-nombre">{s.nombre_producto}</p>
                    <p className="admin-producto-ref">Ref: {s.productos?.referencia}</p>
                  </td>
                  <td>{s.productos?.categorias?.nombre_categoria ?? s.nombre_categoria ?? '—'}</td>
                  <td>{s.stock_actual} Und</td>
                  <td>
                    <button className="inventario-btn-ver" onClick={() => setModalStock(s)}>
                      <FiEye /> VER
                    </button>
                  </td>
                  <td><span className={`inventario-nivel ${nivel.clase}`}>{nivel.label}</span></td>
                  <td>${Number(precio).toLocaleString()}</td>
                  <td>${(s.stock_actual * precio).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* MODAL TALLA */}
        {modalStock && (
          <div className="inventario-modal-overlay" onClick={() => setModalStock(null)}>
            <div className="inventario-modal" onClick={e => e.stopPropagation()}>
              <h3>{modalStock.nombre_producto}</h3>
              <p>Talla: <strong>{modalStock.talla}</strong></p>
              <p>Color: <strong>{modalStock.color}</strong></p>
              <p>Stock actual: <strong>{modalStock.stock_actual}</strong></p>
              <p>Stock mínimo: <strong>{modalStock.stock_minimo}</strong></p>
              <p>Stock máximo: <strong>{modalStock.stock_maximo}</strong></p>
              <button className="admin-btn-guardar" onClick={() => setModalStock(null)}>Cerrar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}