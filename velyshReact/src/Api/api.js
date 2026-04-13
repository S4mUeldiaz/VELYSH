// src/Api/api.js
import { SignJWT, jwtVerify } from "jose";
import db from "./db.json";

// ── ESTADO EN MEMORIA ──────────────────────────────────────────────────────────
// Copia profunda para no modificar el JSON original.
// Los cambios viven en RAM mientras el tab esté abierto.
let roles     = JSON.parse(JSON.stringify(db.roles));
let usuarios  = JSON.parse(JSON.stringify(db.usuarios));
let categorias= JSON.parse(JSON.stringify(db.categorias));
let productos = JSON.parse(JSON.stringify(db.productos));
let tallas    = JSON.parse(JSON.stringify(db.tallas));
let stock     = JSON.parse(JSON.stringify(db.stock));
let pedidos   = JSON.parse(JSON.stringify(db.pedidos));
let detalles  = JSON.parse(JSON.stringify(db.detalles_pedido));

// ── CONFIGURACIÓN JWT ──────────────────────────────────────────────────────────
// SECRET_KEY es la clave con la que firmamos y verificamos los tokens.
// TextEncoder la convierte a bytes, que es lo que necesita jose.
// En un proyecto real esto vendría de una variable de entorno (.env).
const SECRET_KEY    = new TextEncoder().encode("velysh-secret-key-2026");
const TOKEN_DURACION = "2h"; // El token expira a las 2 horas

// ── HELPERS ────────────────────────────────────────────────────────────────────
const delay  = (ms = 200) => new Promise(res => setTimeout(res, ms));
const nextId = (arr, campo) => Math.max(0, ...arr.map(i => i[campo])) + 1;

function calcularEstadoStock(actual, minimo) {
  if (actual === 0)     return "agotado";
  if (actual <= minimo) return "bajo";
  return "disponible";
}

// Genera un JWT firmado con los datos del usuario
async function generarToken(usuario) {
  return new SignJWT({
    id:     usuario.id_usuario,
    correo: usuario.correo,
    rol:    usuario.nombre_rol,
  })
    .setProtectedHeader({ alg: "HS256" }) // algoritmo de firma HMAC-SHA256
    .setIssuedAt()                         // fecha de emisión (ahora)
    .setExpirationTime(TOKEN_DURACION)     // fecha de expiración
    .sign(SECRET_KEY);                     // firmamos con nuestra clave secreta
}

// Verifica que un token sea válido y no haya expirado.
// Devuelve el payload (datos) si es válido, null si no.
export async function verificarToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload; // contiene { id, correo, rol, iat, exp }
  } catch {
    return null; // token inválido o expirado
  }
}

// ── AUTH ────────────────────────────────────────────────────────────────────────

export async function login(correo, contraseña) {
  await delay();

  const usuario = usuarios.find(
    u => u.correo === correo && u.contraseña === contraseña
  );
  if (!usuario)                      throw new Error("Correo o contraseña incorrectos");
  if (usuario.estado === "inactivo") throw new Error("Usuario inactivo");

  const rol = roles.find(r => r.id_rol === usuario.id_rol);
  const { contraseña: _, ...usuarioSinPassword } = usuario;
  const usuarioConRol = { ...usuarioSinPassword, nombre_rol: rol?.nombre_rol ?? "" };

  // Generamos el JWT real con jose y lo guardamos en sessionStorage
  const token = await generarToken(usuarioConRol);
  sessionStorage.setItem("token",   token);
  sessionStorage.setItem("usuario", JSON.stringify(usuarioConRol));

  return usuarioConRol;
}

export async function registrar(datos) {
  await delay();
  if (usuarios.find(u => u.correo    === datos.correo))   throw new Error("Ese correo ya está registrado");
  if (usuarios.find(u => u.telefono  === datos.telefono)) throw new Error("Ese teléfono ya está registrado");
  if (datos.contraseña.length < 6)                        throw new Error("La contraseña debe tener al menos 6 caracteres");

  const nuevo = {
    id:         nextId(usuarios, "id"),
    id_usuario: nextId(usuarios, "id_usuario"),
    estado:     "activo",
    id_rol:     3,
    fecha_registro: new Date().toISOString(),
    ...datos,
  };
  usuarios.push(nuevo);
  const { contraseña: _, ...sinPassword } = nuevo;
  return sinPassword;
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("usuario");
}

export function getUsuarioActual() {
  const raw = sessionStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return sessionStorage.getItem("token");
}

export async function getRoles() {
  await delay();
  return roles;
}

// ── CATEGORÍAS ──────────────────────────────────────────────────────────────────

export async function getCategorias() {
  await delay();
  return categorias.filter(c => c.estado === "activo");
}

// ── PRODUCTOS ───────────────────────────────────────────────────────────────────

export async function getProductos() {
  await delay();
  return productos
    .filter(p => p.estado !== "descontinuado")
    .map(p => ({
      ...p,
      nombre_categoria: categorias.find(c => c.id_categoria === p.id_categoria)?.nombre_categoria ?? "",
    }));
}

export async function crearProducto(datos) {
  await delay();
  const nuevo = {
    id:           nextId(productos, "id"),
    id_producto:  nextId(productos, "id_producto"),
    estado:       "activo",
    total_ventas: 0,
    ...datos,
  };
  productos.push(nuevo);
  return nuevo;
}

export async function editarProducto(id, datos) {
  await delay();
  const idx = productos.findIndex(p => p.id_producto === id);
  if (idx === -1) throw new Error("Producto no encontrado");
  productos[idx] = { ...productos[idx], ...datos };
  return productos[idx];
}

export async function eliminarProducto(id) {
  await delay();
  const idx = productos.findIndex(p => p.id_producto === id);
  if (idx === -1) throw new Error("Producto no encontrado");
  productos[idx].estado = "descontinuado";
  return { ok: true };
}

// ── TALLAS ──────────────────────────────────────────────────────────────────────

export async function getTallas() {
  await delay();
  return [...tallas].sort((a, b) => a.orden - b.orden);
}

// ── STOCK / INVENTARIO ──────────────────────────────────────────────────────────

export async function getStock() {
  await delay();
  const result = stock.map(s => ({
    ...s,
    nombre_producto: productos.find(p => p.id_producto === s.id_producto)?.nombre ?? "",
    talla:           tallas.find(t => t.id_talla === s.id_talla)?.talla ?? "",
    precio:          productos.find(p => p.id_producto === s.id_producto)?.precio ?? 0,
  }));
  console.log("STOCK RESULT:", result);
  return result;
}

export async function crearStock(datos) {
  await delay();
  const nuevo = {
    id:          nextId(stock, "id"),
    id_stock:    nextId(stock, "id_stock"),
    stock_minimo: 5,
    stock_maximo: 100,
    estado:      calcularEstadoStock(datos.stock_actual, 5),
    ...datos,
  };
  stock.push(nuevo);
  return nuevo;
}

export async function editarStock(id, datos) {
  await delay();
  const idx = stock.findIndex(s => s.id_stock === id);
  if (idx === -1) throw new Error("Stock no encontrado");
  stock[idx] = {
    ...stock[idx],
    ...datos,
    estado: calcularEstadoStock(
      datos.stock_actual ?? stock[idx].stock_actual,
      datos.stock_minimo ?? stock[idx].stock_minimo
    ),
  };
  return stock[idx];
}

export async function eliminarStock(id) {
  await delay();
  stock = stock.filter(s => s.id_stock !== id);
  return { ok: true };
}

// ── PEDIDOS / VENTAS ────────────────────────────────────────────────────────────

export async function getPedidos() {
  await delay();
  return pedidos.map(p => ({
    ...p,
    detalles: detalles
      .filter(d => d.id_pedido === p.id_pedido)
      .map(d => {
        const itemStock = stock.find(s => s.id_stock === d.id_stock);
        const itemTalla = tallas.find(t => t.id_talla === itemStock?.id_talla);
        const itemProd  = productos.find(pr => pr.id_producto === itemStock?.id_producto);
        return {
          ...d,
          color:           itemStock?.color ?? "",
          talla:           itemTalla?.talla ?? "",
          nombre_producto: itemProd?.nombre ?? "",
        };
      }),
  }));
}

export async function crearPedido(datos) {
  await delay();
  const subtotal   = datos.cantidad * datos.precio_unitario;
  const nuevoId    = nextId(pedidos, "id_pedido");
  const referencia = `PED-${new Date().getFullYear()}-${String(nuevoId).padStart(3, "0")}`;

  const nuevoPedido = {
    id:            nextId(pedidos, "id"),
    id_pedido:     nuevoId,
    referencia,
    id_usuario:    datos.id_usuario ?? 1,
    id_direccion:  1,
    fecha_pedido:  new Date().toISOString(),
    precio_total:  subtotal,
    costo_envio:   0,
    metodo_pago:   datos.metodo_pago ?? "tarjeta",
    estado_pago:   "pagado",
    estado_pedido: "confirmado",
  };
  pedidos.push(nuevoPedido);

  detalles.push({
    id:              nextId(detalles, "id"),
    id_detalle:      nextId(detalles, "id_detalle"),
    id_pedido:       nuevoId,
    id_stock:        datos.id_stock,
    cantidad:        datos.cantidad,
    precio_unitario: datos.precio_unitario,
    subtotal,
  });

  // Descontamos del stock automáticamente
  const idxStock = stock.findIndex(s => s.id_stock === datos.id_stock);
  if (idxStock !== -1) {
    stock[idxStock].stock_actual -= datos.cantidad;
    stock[idxStock].estado = calcularEstadoStock(
      stock[idxStock].stock_actual,
      stock[idxStock].stock_minimo
    );
  }
  return nuevoPedido;
}

export async function eliminarPedido(id) {
  await delay();
  pedidos  = pedidos.filter(p => p.id_pedido !== id);
  detalles = detalles.filter(d => d.id_pedido !== id);
  return { ok: true };
}
