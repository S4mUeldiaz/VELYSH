import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import './Footer.css'

// "Hombre"/"Mujer" no son categorías reales (son valores de género, un filtro
// aparte) — el enlace nunca calzaba con ningún id_categoria. Se quitan hasta
// que exista un filtro de género propio al que enlazar.
const CATEGORIAS_FOOTER = ['Deportivo', 'Casual', 'Botas']

function Footer() {
  const anioActual = new Date().getFullYear()
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  

  return (
    <footer className="footer-cliente">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/logo-wordmark-dark.png" alt="VELYSH" className="footer-logo" />
          <p className="footer-tagline">Estilo, comodidad real.</p>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/velyshcol/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram VELYSH"
              >
              <FaInstagram />
            </a>
            <a
              href="https://facebook.com/velyshcol"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook VELYSH"
              >
              <FaFacebookF />
            </a>
            <a
              href="https://wa.me/573204689732"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp VELYSH"
              >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Categorías</h3>
          <ul>
            {CATEGORIAS_FOOTER.map((categoria) => (
              <li key={categoria}>
                <Link to={`/catalogo?categoria=${categoria}`}>{categoria}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Empresa</h3>
          <ul>
            <li><Link to="/home">Inicio</Link></li>
            <li><Link to="/catalogo">Catálogo</Link></li>
            <li><Link to="/favoritos">Favoritos</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Contacto</h3>
          <ul>
            <li>
              <a href="mailto:velysh329@gmail.com">velysh329@gmail.com</a>
            </li>
            <li>
              <a href="tel:+573204689732">+57 320 468 9732</a>
            </li>
            <li className="footer-text-muted">Bogotá, Colombia</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {anioActual} VELYSH — Todos los derechos reservados</p>
        <p className="footer-academico">Proyecto académico SENA · Ficha 3278638</p>
      </div>
    </footer>
  )
}

export default Footer