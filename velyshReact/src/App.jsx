import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage    from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import InventarioPage from "./components/Inventariopage";
import PedidosPage    from "./components/Pedidospage";
import NavbarCliente  from "./components/shared/NavbarCliente";
import NavbarAdmin    from "./components/shared/NavbarAdmin";
import Home           from "./components/cliente/Home";
import Catalogo from "./components/cliente/Catalogo";
import Dashboard from "./components/admin/Dashboard"
import ProductosAdmin from "./components/admin/Productos"
import { getUsuarioActual } from "./Api/api";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas cliente */}
        <Route path="/home"      element={<RutaProtegida><Home /></RutaProtegida>} />
        <Route path="/catalogo" element={<RutaProtegida><Catalogo /></RutaProtegida>} />
        

        {/* Rutas admin */}
        <Route path="/admin/inventario" element={<RutaProtegida><InventarioPage /></RutaProtegida>} />
        <Route path="/admin/pedidos"    element={<RutaProtegida><PedidosPage /></RutaProtegida>} />
        <Route path="/admin/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/admin/productos" element={<RutaProtegida><ProductosAdmin /></RutaProtegida>} />

        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;