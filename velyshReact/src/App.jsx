// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage      from "./components/LoginPage";
import RegisterPage   from "./components/RegisterPage";
import ProductosPage  from "./components/Productospage";
import InventarioPage from "./components/Inventariopage";
import VentasPage     from "./components/Ventaspage";
import Navbar         from "./components/Navbar";
import { getUsuarioActual } from "./api/api";

// ── RUTA PROTEGIDA ─────────────────────────────────────────────────────────────
// Antes de mostrar la página verifica que exista un token en sessionStorage.
// Si no hay sesión activa → redirige al login.
// Si hay sesión → muestra el Navbar arriba y el componente pedido abajo.
function RutaProtegida({ children }) {
  const token   = sessionStorage.getItem("token");
  const usuario = getUsuarioActual();
  if (!token || !usuario) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar usuario={usuario} />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta raíz → redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas — sin protección */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas — requieren token válido */}
        <Route path="/productos"  element={<RutaProtegida><ProductosPage /></RutaProtegida>} />
        <Route path="/inventario" element={<RutaProtegida><InventarioPage /></RutaProtegida>} />
        <Route path="/ventas"     element={<RutaProtegida><VentasPage /></RutaProtegida>} />

        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
