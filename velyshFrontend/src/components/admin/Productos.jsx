import { useState, useEffect } from "react"
import { getProductos, getCategorias, crearProducto, editarProducto, eliminarProducto } from "../../Api/api"
import { FiSearch, FiEdit2, FiPlus, FiBell, FiUser } from "react-icons/fi"
import "./Productos.css"

export default function Productos() {
  const [productos,       setProductos]       = useState([])
  const [categorias,      setCategorias]      = useState([])
  const [busqueda,        setBusqueda]        = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [estadoFiltro,    setEstadoFiltro]    = useState("")
  const [vista,           setVista]           = useState("lista")
  const [form,            setForm]            = useState({ nombre: "", descripcion: "", marca: "", precio: "", id_categoria: "", referencia: "" })
  const [editandoId,      setEditandoId]      = useState(null)
  const [error,           setError]           = useState("")
  const [cargando,        setCargando]        = useState(true)

  useEffect(() => {
    Promise.all([getProductos(), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods)
        setCategorias(cats)
        setCargando(false)
      })
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function abrirEditar(p) {
    setForm({ nombre: p.nombre, descripcion: p.descripcion, marca: p.marca, precio: p.precio, id_categoria: p.id_categoria, referencia: p.referencia })
    setEditandoId(p.id_producto)
    setVista("editar")
  }

  function limpiarForm() {
    setForm({ nombre: "", descripcion: "", marca: "", precio: "", id_categoria: "", referencia: "" })
    setEditandoId(null)
    setError("")
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!form.nombre || !form.precio || !form.id_categoria || !form.referencia) {
      setError("Todos los campos son obligatorios")
      return
    }
    const datos = { ...form, precio: Number(form.precio), id_categoria: Number(form.id_categoria) }
    try {
      if (editandoId) {
        const actualizado = await editarProducto(editandoId, datos)
        setProductos(prev => prev.map(p => p.id_producto === editandoId ? { ...actualizado, nombre_categoria: categorias.find(c => c.id_categoria === actualizado.id_categoria)?.nombre_categoria ?? "" } : p))
      } else {
        const nuevo = await crearProducto(datos)
        setProductos(prev => [...prev, { ...nuevo, nombre_categoria: categorias.find(c => c.id_categoria === nuevo.id_categoria)?.nombre_categoria ?? "" }])
      }
      limpiarForm()
      setVista("lista")
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  async function toggleEstado(p) {
    const nuevoEstado = p.estado === "activo" ? "inactivo" : "activo"
    const actualizado = await editarProducto(p.id_producto, { estado: nuevoEstado })
    setProductos(prev => prev.map(prod => prod.id_producto === p.id_producto ? { ...prod, estado: nuevoEstado } : prod))
  }

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.referencia?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro ? p.id_categoria === Number(categoriaFiltro) : true
    const coincideEstado = estadoFiltro ? p.estado === estadoFiltro : true
    return coincideBusqueda && coincideCategoria && coincideEstado
  })

  return (
    <div className="admin-productos-wrapper">

      {/* NAVBAR */}
      <nav className="admin-navbar">
        <h1 className="admin-navbar-title">PRODUCTOS</h1>
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
        <button className={`admin-tab ${vista === 'lista' ? 'active' : ''}`} onClick={() => { setVista("lista"); limpiarForm() }}>Lista de productos</button>
        <button className={`admin-tab ${vista === 'agregar' ? 'active' : ''}`} onClick={() => { setVista("agregar"); limpiarForm() }}>Agregar producto</button>
        {editandoId && <button className={`admin-tab ${vista === 'editar' ? 'active' : ''}`}>Editar producto</button>}
      </div>

      {/* LISTA */}
      {vista === "lista" && (
        <div className="admin-lista">
          <div className="admin-lista-header">
            <h2 className="admin-lista-title">Productos ({productosFiltrados.length} total)</h2>
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
            <select className="admin-filtro-select" value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
              <option value="">Estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="descontinuado">Descontinuado</option>
            </select>
          </div>

          {/* TABLA */}
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id_producto}>
                  <td>
                    <div className="admin-producto-img">
                      <img src="/zapato.png" alt={p.nombre} />
                    </div>
                  </td>
                  <td>
                    <p className="admin-producto-nombre">{p.nombre}</p>
                    <p className="admin-producto-ref">Ref: {p.referencia}</p>
                  </td>
                  <td>{p.nombre_categoria}</td>
                  <td>${Number(p.precio).toLocaleString()}</td>
                  <td>
                    <span className={`admin-estado ${p.estado}`}>{p.estado}</span>
                  </td>
                  <td>
                    <div className="admin-opciones">
                      <button className="admin-btn-editar" onClick={() => abrirEditar(p)}>
                        <FiEdit2 />
                      </button>
                      <button
                        className={`admin-btn-estado ${p.estado === 'activo' ? 'desactivar' : 'activar'}`}
                        onClick={() => toggleEstado(p)}
                      >
                        {p.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FORMULARIO AGREGAR/EDITAR */}
      {(vista === "agregar" || vista === "editar") && (
        <div className="admin-form-wrapper">
          <h2 className="admin-form-title">{editandoId ? "Editar producto" : "Agregar producto"}</h2>
          <form className="admin-form" onSubmit={handleGuardar}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Nombre</label>
                <input className="admin-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del producto" />
              </div>
              <div className="admin-form-group">
                <label>Referencia</label>
                <input className="admin-input" name="referencia" value={form.referencia} onChange={handleChange} placeholder="VLY-001" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Marca</label>
                <input className="admin-input" name="marca" value={form.marca} onChange={handleChange} placeholder="Marca" />
              </div>
              <div className="admin-form-group">
                <label>Precio</label>
                <input className="admin-input" name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="250000" />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Categoría</label>
              <select className="admin-input" name="id_categoria" value={form.id_categoria} onChange={handleChange}>
                <option value="">-- Selecciona --</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Descripción</label>
              <textarea className="admin-input admin-textarea" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción del producto" />
            </div>
            {error && <p className="admin-error">{error}</p>}
            <div className="admin-form-btns">
              <button className="admin-btn-guardar" type="submit">
                {editandoId ? "Actualizar" : "Guardar"}
              </button>
              <button className="admin-btn-cancelar" type="button" onClick={() => { setVista("lista"); limpiarForm() }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}