import "./BadgeAcento.css"

// Pill ámbar de acento ocasional (stock bajo, más vendido, nuevo) — nunca más
// de uno por card. Mismo componente que AppMovil (BadgeAcento.tsx).
export default function BadgeAcento({ texto, className = "" }) {
  return <span className={`badge-acento ${className}`.trim()}>{texto}</span>
}
