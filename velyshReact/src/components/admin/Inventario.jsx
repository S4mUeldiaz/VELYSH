import { useState, useEffect } from "react"
import { getStock, getCategorias, crearStock, actualizarStock, getTallas, getProductos } from "../../Api/api"
import { FiSearch, FiBell, FiUser, FiDownload, FiEye, FiPlus, FiTrash2 } from "react-icons/fi"
import "./Inventario.css"

export default function Inventario() {
  const [stock,           setStock]           = useState([])
  const [categorias,      setCategorias]      = useState([])
  const [tallas,          setTallas]          = useState([])
  const [productos,       setProductos]       = useState([])
  const [busqueda,        setBusqueda]        = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [nivelFiltro,     setNivelFiltro]     = useState("")
  const [cargando,        setCargando]        = useState(true)
  const [modalStock,      setModalStock]      = useState(null)
  const [vista,           setVista]           = useState("lista")

  // Form agregar stock
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [filas, setFilas] = useState([{ id_talla: "", color: "", stock_actual: "", stock_minimo: 5, stock_maximo: 100 }])
  const [errorForm, setErrorForm] = useState("")
  const [guardando, setGuardando] = useState(false)

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
  const stockBajo      = stock.filter(s => s.estado === 'bajo').length
  const sinStock       = stock.filter(s => s.estado === 'agotado').length
  const valorStock     = stock.reduce((acc, s) => acc + (s.stock_actual * (s.productos?.precio ?? 0)), 0)

  function getNivelLabel(estado) {
    if (estado === 'disponible') return { label: 'Normal',     clase: 'nivel-normal'  }
    if (estado === 'bajo')       return { label: 'Stock bajo', clase: 'nivel-bajo'    }
    if (estado === 'agotado')    return { label: 'Sin stock',  clase: 'nivel-agotado' }
    return { label: estado, clase: '' }
  }

  function agregarFila() {
    setFilas(prev => [...prev, { id_talla: "", color: "", stock_actual: "", stock_minimo: 5, stock_maximo: 100 }])
  }

  function eliminarFila(i) {
    setFilas(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleFilaChange(i, campo, valor) {
    setFilas(prev => prev.map((f, idx) => idx === i ? { ...f, [campo]: valor } : f))
  }

  async function handleGuardarStock(e) {
    e.preventDefault()
    if (!productoSeleccionado) { setErrorForm("Selecciona un producto"); return }
    if (filas.some(f => !f.id_talla || !f.color || f.stock_actual === "")) {
      setErrorForm("Completa todos los campos de cada fila")
      return
    }
    setGuardando(true)
    setErrorForm("")
    try {
      for (const fila of filas) {
        const nuevo = await crearStock({
          id_producto:  Number(productoSeleccionado),
          id_talla:     Number(fila.id_talla),
          color:        fila.color,
          stock_actual: Number(fila.stock_actual),
          stock_minimo: Number(fila.stock_minimo),
          stock_maximo: Number(fila.stock_maximo),
        })
        setStock(prev => [...prev, nuevo])
      }
      setProductoSeleccionado("")
      setFilas([{ id_talla: "", color: "", stock_actual: "", stock_minimo: 5, stock_maximo: 100 }])
      setVista("lista")
    } catch (err) {
      setErrorForm(err.response?.data?.error || err.message)
    } finally {
      setGuardando(false)
    }
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

      {/* TABS */}
      <div className="admin-tabs">
        <button className={`admin-tab ${vista === 'lista' ? 'active' : ''}`} onClick={() => setVista('lista')}>
          Lista de inventario
        </button>
        <button className={`admin-tab ${vista === 'agregar' ? 'active' : ''}`} onClick={() => setVista('agregar')}>
          Agregar stock
        </button>
      </div>

      {/* LISTA */}
      {vista === "lista" && (
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
              <input placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
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
            <button className="inventario-btn-reporte"><FiDownload /> Generar reporte</button>
          </div>

          {/* TABLA */}
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock total</th>
                <th>Talla / Color</th>
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
                        <FiEye /> {s.talla} / {s.color}
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
        </div>
      )}

      {/* AGREGAR STOCK */}
      {vista === "agregar" && (
        <div className="inventario-content">
          <h2 className="admin-form-title">Agregar stock a producto</h2>

          <form className="admin-form" onSubmit={handleGuardarStock}>
            <div className="admin-form-group">
              <label>Producto</label>
              <select
                className="admin-input"
                value={productoSeleccionado}
                onChange={e => setProductoSeleccionado(e.target.value)}
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map(p => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre} — {p.referencia}
                  </option>
                ))}
              </select>
            </div>

            <div className="stock-tabla-form">
              <div className="stock-tabla-header">
                <span>Talla</span>
                <span>Color</span>
                <span>Cantidad</span>
                <span>Mínimo</span>
                <span>Máximo</span>
                <span></span>
              </div>

              {filas.map((fila, i) => (
                <div key={i} className="stock-tabla-fila">
                  <select
                    className="admin-input"
                    value={fila.id_talla}
                    onChange={e => handleFilaChange(i, 'id_talla', e.target.value)}
                  >
                    <option value="">-- Talla --</option>
                    {tallas.map(t => (
                      <option key={t.id_talla} value={t.id_talla}>{t.talla}</option>
                    ))}
                  </select>
                  <input
                    className="admin-input"
                    placeholder="Color"
                    value={fila.color}
                    onChange={e => handleFilaChange(i, 'color', e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Cantidad"
                    value={fila.stock_actual}
                    onChange={e => handleFilaChange(i, 'stock_actual', e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Mínimo"
                    value={fila.stock_minimo}
                    onChange={e => handleFilaChange(i, 'stock_minimo', e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Máximo"
                    value={fila.stock_maximo}
                    onChange={e => handleFilaChange(i, 'stock_maximo', e.target.value)}
                  />
                  <button
                    type="button"
                    className="stock-btn-eliminar"
                    onClick={() => eliminarFila(i)}
                    disabled={filas.length === 1}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}

              <button type="button" className="stock-btn-agregar-fila" onClick={agregarFila}>
                <FiPlus /> Agregar talla
              </button>
            </div>

            {errorForm && <p className="admin-error">{errorForm}</p>}

            <div className="admin-form-btns">
              <button className="admin-btn-guardar" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar stock"}
              </button>
              <button className="admin-btn-cancelar" type="button" onClick={() => setVista("lista")}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL */}
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
  )
}