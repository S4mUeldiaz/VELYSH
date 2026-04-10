import { useState } from 'react'
// useState nos deja guardar valores que pueden cambiar
// (el texto del input, si hay error, etc.)
import { useNavigate } from 'react-router-dom'
// useNavigate nos deja cambiar de página sin recargar el navegador
import { login } from '../api/api'
// Importamos SOLO la función login desde tu api.js
// El '../data/api' es la ruta relativa a tu archivo


// 2. Definimos el componente (una función que devuelve HTML)
export default function LoginPage() {

  // 3. Variables de estado — React las "recuerda" entre renders
  const [correo, setCorreo]       = useState('')
  // correo      = el valor actual del input
  // setCorreo   = función para actualizar ese valor
  // useState('') = empieza vacío

  const [contrasena, setContrasena] = useState('')
  // Igual pero para la contraseña

  const [error, setError]         = useState('')
  // Para guardar el mensaje de error si el login falla

  const [cargando, setCargando]   = useState(false)
  // Para deshabilitar el botón mientras espera respuesta

  const navigate = useNavigate()
  // navigate es una función que nos deja ir a otra ruta


  // 4. La función que se ejecuta cuando el usuario da clic en "Ingresar"
  const handleSubmit = async (e) => {
    // "async" significa que esta función puede ESPERAR cosas
    // (como cuando api.js simula un delay de 200ms)

    e.preventDefault()
    // Sin esto, el formulario recargaría la página
    // e = el evento del clic, preventDefault = "no hagas lo de siempre"

    setError('')      // Borramos errores anteriores
    setCargando(true) // Activamos el estado de carga

    try {
      // "try" = intenta hacer esto, y si falla, ve al "catch"

      const usuario = await login(correo, contrasena)
      // "await" = espera a que login() termine antes de continuar
      // login() viene de tu api.js, busca en el arreglo de usuarios
      // Si lo encuentra, devuelve el objeto usuario
      // Si no, lanza un Error (throw new Error(...))

      console.log('Login exitoso:', usuario)
      // Esto aparece en las DevTools del navegador (F12)
      // Útil para verificar qué devuelve tu api.js

      navigate('/inicio')
      // Redirige al usuario a la página de inicio

    } catch (err) {
      // Si login() lanzó un error, llegamos aquí
      // err.message contiene el texto del throw en tu api.js
      // Por ejemplo: "Correo o contraseña incorrectos"

      setError(err.message)
      // Guardamos el mensaje para mostrarlo en pantalla
    }

    setCargando(false) // Desactivamos la carga al terminar
  }


  // 5. Lo que se muestra en pantalla (JSX = HTML dentro de JS)
  return (
    <div style={{ maxWidth: '360px', margin: '60px auto', padding: '24px' }}>

      <h2>Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
        {/* onSubmit llama a handleSubmit cuando se envía el form */}

        <div>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            // onChange se ejecuta cada vez que el usuario escribe
            // e.target.value = lo que hay escrito en el input ahora mismo
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>

        {/* Mostramos el error SOLO si hay algo en la variable error */}
        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}
        {/* El && funciona como "si error existe, muestra esto" */}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Cargando...' : 'Ingresar'}
          {/* Operador ternario: si cargando es true → 'Cargando...' */}
          {/* Si es false → 'Ingresar' */}
        </button>

      </form>
    </div>
  )
}