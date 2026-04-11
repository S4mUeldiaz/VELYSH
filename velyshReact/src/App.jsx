import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ProductosPage from "./components/Productospage";
import InventarioPage from "./components/Inventariopage";
import VentasPage from './components/Ventaspage';

function RutaProtegida({ children }) {
  const usuario = sessionStorage.getItem("usuario");
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return ( 
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz → redirige al login directamente */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas — cualquiera puede entrar */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas — solo si hay sesión activa */}
        <Route path="/productos" element={
          <RutaProtegida><ProductosPage /></RutaProtegida>
        } />

        <Route path="/inventario" element={
          <RutaProtegida><InventarioPage /></RutaProtegida>
        } />

        <Route path="/ventas" element={
          <RutaProtegida><VentasPage /></RutaProtegida>
        } />

        {/* Cualquier ruta desconocida */}
        <Route path="*" element={<h1>Página no encontrada</h1>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
