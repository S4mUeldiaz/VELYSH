// Prueba de carga VELYSH – RNF 01 (tiempo de respuesta de consultas)
// Meta del IEEE 830: el 95 % de las consultas responde en 2 s o menos con hasta 50 usuarios concurrentes.
//
// Uso (desde la raíz del repo):
//   k6 run --env PERFIL=humo    pruebas/carga/k6-consultas.js   # 5 usuarios, ~35 s (comprobar que todo responde)
//   k6 run --env PERFIL=carga50 pruebas/carga/k6-consultas.js   # hasta 50 usuarios, ~4 min
//   (opcional) --env BASE_URL=https://otra-url
//
// Genera resultados-k6/reporte.html y resultados-k6/resumen.json (crea antes la carpeta: mkdir resultados-k6)

import http from 'k6/http'
import { check, sleep, group } from 'k6'

const BASE_URL = (__ENV.BASE_URL || 'https://velysh-web-ara2fmbnddayfha6.canadacentral-01.azurewebsites.net').replace(/\/$/, '')
const PERFIL = __ENV.PERFIL || 'humo'
const LIMITE_MS = 2000

const PERFILES = {
  humo: { usuarios: 5, stages: [{ duration: '10s', target: 5 }, { duration: '20s', target: 5 }, { duration: '5s', target: 0 }] },
  carga50: { usuarios: 50, stages: [{ duration: '30s', target: 50 }, { duration: '3m', target: 50 }, { duration: '30s', target: 0 }] },
}
const perfil = PERFILES[PERFIL] || PERFILES.humo

const ENDPOINTS = {
  inicio: 'Página de inicio',
  categorias: 'Categorías',
  catalogo: 'Catálogo de productos',
  detalle: 'Detalle de producto',
  stock: 'Existencias por producto',
}

const thresholds = {
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.99'],
  http_req_duration: [`p(95)<${LIMITE_MS}`],
}
for (const e of Object.keys(ENDPOINTS)) thresholds[`http_req_duration{endpoint:${e}}`] = [`p(95)<${LIMITE_MS}`]

export const options = {
  scenarios: { consultas: { executor: 'ramping-vus', startVUs: 0, stages: perfil.stages, gracefulRampDown: '10s' } },
  thresholds,
}

// Solo consultas públicas de lectura: no crea pedidos ni modifica stock ni usa el login.
export function setup() {
  const res = http.get(`${BASE_URL}/api/productos`)
  let ids = []
  try { ids = res.json().map((p) => p.id_producto).filter((x) => x !== undefined && x !== null).slice(0, 30) } catch (e) { /* se valida abajo */ }
  if (ids.length === 0) throw new Error(`No se pudo leer el catálogo en ${BASE_URL}/api/productos (estado ${res.status})`)
  return { ids }
}

function get(path, endpoint) {
  const res = http.get(`${BASE_URL}${path}`, { tags: { endpoint, name: endpoint } })
  check(res, { [`${endpoint}: responde 200`]: (r) => r.status === 200 })
  return res
}
const pausa = () => sleep(1 + Math.random() * 2)   // el usuario "lee" 1–3 s entre acciones

export default function (data) {
  group('Inicio y catálogo', () => {
    get('/', 'inicio')
    get('/api/productos/categoria', 'categorias')
    get('/api/productos', 'catalogo')
  })
  pausa()
  group('Detalle de producto', () => {
    const id = data.ids[Math.floor(Math.random() * data.ids.length)]
    get(`/api/productos/${id}`, 'detalle')
    get(`/api/stock/producto/${id}`, 'stock')
  })
  pausa()
}

// ---------- Reporte ----------
const ms = (v) => (v === undefined ? '—' : `${Math.round(v)} ms`)
const val = (data, name, key) => (data.metrics[name] && data.metrics[name].values ? data.metrics[name].values[key] : undefined)

export function handleSummary(data) {
  const filas = Object.keys(ENDPOINTS).map((e) => {
    const n = `http_req_duration{endpoint:${e}}`
    const p95 = val(data, n, 'p(95)')
    return { nombre: ENDPOINTS[e], n: val(data, 'http_reqs', 'count') && data.metrics[n] ? data.metrics[n].values.count : undefined,
             media: val(data, n, 'avg'), p95, max: val(data, n, 'max'), ok: p95 !== undefined && p95 < LIMITE_MS }
  })
  const p95Global = val(data, 'http_req_duration', 'p(95)')
  const okGlobal = p95Global !== undefined && p95Global < LIMITE_MS
  const tasaError = val(data, 'http_req_failed', 'rate') || 0
  const okErr = tasaError < 0.01
  const checksOk = val(data, 'checks', 'rate')
  const veredicto = okGlobal && okErr && filas.every((f) => f.ok)
  const dur = Math.round((data.state.testRunDurationMs || 0) / 1000)
  const fecha = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' (hora de Colombia)'
  const tr = (f) => `<tr><td>${f.nombre}</td><td class="n">${f.n ?? '—'}</td><td class="n">${ms(f.media)}</td><td class="n"><b>${ms(f.p95)}</b></td><td class="n">${ms(f.max)}</td><td class="${f.ok ? 'ok' : 'mal'}">${f.ok ? 'Cumple' : 'No cumple'}</td></tr>`
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VELYSH – Prueba de carga (RNF 01)</title>
<style>body{font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:860px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
h1{font-size:1.5rem;margin-bottom:.2rem}.sub{color:#555;margin-top:0}table{border-collapse:collapse;width:100%;margin:1rem 0}
th,td{border:1px solid #ddd;padding:.5rem .6rem;text-align:left}th{background:#f4f4f4}.n{text-align:right;font-variant-numeric:tabular-nums}
.ok{color:#146c2e;font-weight:600}.mal{color:#b00020;font-weight:600}.v{padding:.8rem 1rem;border-radius:8px;font-weight:600;margin:1rem 0}
.v.ok{background:#e6f4ea}.v.mal{background:#fde8ea}ul{line-height:1.5}small{color:#555}</style></head><body>
<h1>VELYSH – Prueba de carga (RNF 01)</h1>
<p class="sub">${fecha} · Perfil <b>${PERFIL}</b> (hasta ${perfil.usuarios} usuarios concurrentes) · ${dur} s · ${BASE_URL}</p>
<div class="v ${veredicto ? 'ok' : 'mal'}">${veredicto ? 'RESULTADO: CUMPLE' : 'RESULTADO: NO CUMPLE'} la meta de RNF 01 en lo medido: percentil 95 de ${ms(p95Global)} (límite ${LIMITE_MS} ms) y ${(tasaError * 100).toFixed(2)} % de errores (límite 1 %).</div>
<table><tr><th>Consulta</th><th>Peticiones</th><th>Media</th><th>Percentil 95</th><th>Máximo</th><th>Límite 2000 ms</th></tr>${filas.map(tr).join('')}</table>
<ul><li>Peticiones totales: <b>${val(data, 'http_reqs', 'count')}</b> (${(val(data, 'http_reqs', 'rate') || 0).toFixed(1)} por segundo)</li>
<li>Iteraciones completas de usuario: <b>${val(data, 'iterations', 'count')}</b> · usuarios simultáneos máximos: <b>${val(data, 'vus_max', 'max')}</b></li>
<li>Verificaciones superadas: <b>${checksOk === undefined ? '—' : (checksOk * 100).toFixed(2) + ' %'}</b></li></ul>
<h3>Alcance y límites de esta prueba</h3>
<ul><li>Cubre consultas públicas de lectura: inicio, categorías, catálogo, detalle y existencias. <b>No cubre</b> historial de pedidos ni inicio de sesión (RNF 01 también los menciona) ni la confirmación de compra (RNF 02).</li>
<li>Cada usuario simulado hace pausas de 1 a 3 s entre acciones, como una persona navegando.</li>
<li>Las medidas dependen del plan de App Service usado, de la distancia desde donde se ejecuta la prueba y de Supabase.</li>
<li>Es una sola ejecución: para conclusiones firmes conviene repetirla en distintos momentos.</li></ul>
<small>Generado con k6 · umbrales definidos en pruebas/carga/k6-consultas.js</small></body></html>`
  const texto = `\n  VELYSH – Prueba de carga (${PERFIL}) – ${veredicto ? 'CUMPLE' : 'NO CUMPLE'} RNF 01\n` +
    filas.map((f) => `   ${f.ok ? 'OK ' : 'XX '} ${f.nombre.padEnd(26)} p95 ${ms(f.p95).padStart(8)}  media ${ms(f.media).padStart(8)}`).join('\n') +
    `\n   p95 global ${ms(p95Global)} · errores ${(tasaError * 100).toFixed(2)} % · peticiones ${val(data, 'http_reqs', 'count')}\n`
  return { stdout: texto, 'resultados-k6/reporte.html': html, 'resultados-k6/resumen.json': JSON.stringify(data, null, 2) }
}
