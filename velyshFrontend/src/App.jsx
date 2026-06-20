import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage    from "./components/auth/LoginPage.jsx";
import RegisterPage from "./components/auth/RegisterPage.jsx";
import NavbarCliente  from "./components/shared/NavbarCliente.jsx";
import NavbarAdmin    from "./components/shared/NavbarAdmin.jsx";
import Home           from "./components/cliente/Home.jsx";
import Catalogo from "./components/cliente/Catalogo.jsx";
import Dashboard from "./components/admin/Dashboard.jsx"
import ProductosAdmin from "./components/admin/Productos.jsx"
import Inventario from "./components/admin/Inventario.jsx"
import Pedidos from "./components/admin/Pedidos.jsx"
import Favoritos from "./components/cliente/Favoritos.jsx"
import Historial from "./components/cliente/Historial.jsx"
import DetalleProducto from "./components/cliente/DetalleProducto.jsx"
import Carrito from "./components/cliente/Carrito.jsx"
import Perfil from "./components/cliente/Perfil.jsx"
import Usuarios from './components/admin/Usuarios.jsx'
import RecuperarPassword from './components/auth/RecuperarPassword.jsx'
import RestablecerPassword from './components/auth/RestablecerPassword.jsx'
import Reportes from './components/admin/Reportes.jsx'
import Devoluciones from './components/admin/Devoluciones.jsx'
import Comprobante from './components/cliente/Comprobante.jsx'
import { getUsuarioActual } from "./Api/api.js"

function RutaProtegida({ children }) {
  const token   = sessionStorage.getItem("token");
  const usuario = getUsuarioActual();
  if (!token || !usuario) return <Navigate to="/login" replace />;

  const navbar = usuario.nombre_rol === "admin"
    ? <NavbarAdmin usuario={usuario} />
    : <NavbarCliente usuario={usuario} />

  return (
    <>
      {navbar}
      {children}
    </>
  );
}

function RutaPublica({ children }) {
  const usuario = getUsuarioActual();

  const navbar = usuario?.nombre_rol === "admin"
    ? <NavbarAdmin usuario={usuario} />
    : <NavbarCliente usuario={usuario} />

  return (
    <>
      {navbar}
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Navigate to="/home" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/restablecer-password" element={<RestablecerPassword />} />

        {/* Rutas cliente PÚBLICAS*/}
        <Route path="/home"         element={<RutaPublica><Home /></RutaPublica>} />
        <Route path="/catalogo"     element={<RutaPublica><Catalogo /></RutaPublica>} />
        <Route path="/producto/:id" element={<RutaPublica><DetalleProducto /></RutaPublica>} />
        <Route path="/carrito"      element={<RutaPublica><Carrito /></RutaPublica>} />

        {/* Rutas cliente PROTEGIDAS: requieren cuenta */}
        <Route path="/favoritos" element={<RutaProtegida><Favoritos /></RutaProtegida>} />
        <Route path="/historial" element={<RutaProtegida><Historial /></RutaProtegida>} />
        <Route path="/perfil"    element={<RutaProtegida><Perfil /></RutaProtegida>} />
        <Route path="/comprobante" element={<RutaProtegida><Comprobante /></RutaProtegida>} />

        {/* Rutas admin: TODAS protegidas*/}
        <Route path="/admin/inventario"   element={<RutaProtegida><Inventario /></RutaProtegida>} />
        <Route path="/admin/pedidos"      element={<RutaProtegida><Pedidos /></RutaProtegida>} />
        <Route path="/admin/dashboard"    element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/admin/productos"    element={<RutaProtegida><ProductosAdmin /></RutaProtegida>} />
        <Route path="/admin/usuarios"     element={<RutaProtegida><Usuarios /></RutaProtegida>} />
        <Route path="/admin/reportes"     element={<RutaProtegida><Reportes /></RutaProtegida>} />
        <Route path="/admin/devoluciones" element={<RutaProtegida><Devoluciones /></RutaProtegida>} />

        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;