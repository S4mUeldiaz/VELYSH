import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";


function App() {
  const [count, setCount] = useState(0)
  return ( 
    <>

          <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Bienvenido a mi App</h1>} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="*" element={<h1>Página no encontrada</h1>} />

        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
