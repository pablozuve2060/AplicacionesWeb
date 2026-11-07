const CLAVE = "estudiantes";
const form = document.querySelector("form");
form.noValidate = true;

const campos = ["Cedula", "apellido", "nombre", "direccion", "telefono", "correo", "facultad", "nivel", "paralelo"];

const LETRAS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const REGEX = {
  Cedula:    /^\d{10}$/,
  apellido:  new RegExp(`^[${LETRAS}]{2,}(?:[ '-][${LETRAS}]+)*$`),
  nombre:    new RegExp(`^[${LETRAS}]{2,}(?:[ '-][${LETRAS}]+)*$`),
  direccion: /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ][A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ\s.,#°\/-]{4,49}$/,
  telefono:  /^09\d{8}$/,
  correo:    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
  facultad:  new RegExp(`^[${LETRAS}][${LETRAS}\\s,.-]{2,79}$`),
  nivel:     /^[1-8]$/,
  paralelo:  /^[A-C]$/
};

const MENSAJES = {
  Cedula: "La cédula debe tener exactamente 10 dígitos.",
  apellido: "Solo letras (mínimo 2). Se permiten espacios, guion y apóstrofe.",
  nombre: "Solo letras (mínimo 2). Se permiten espacios, guion y apóstrofe.",
  direccion: "Entre 5 y 50 caracteres (letras, números y . , # / -).",
  telefono: "Celular de 10 dígitos que empiece con 09.",
  correo: "Correo no válido. Ejemplo: usuario@dominio.com",
  facultad: "Solo letras, mínimo 3 caracteres.",
  nivel: "Seleccione un nivel.",
  paralelo: "Seleccione un paralelo."
};

function cedulaValida(c) {
  if (!REGEX.Cedula.test(c)) return false;
  const prov = +c.slice(0, 2), tercer = +c[2];
  if (prov < 1 || (prov > 24 && prov !== 30) || tercer > 5) return false;
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let n = +c[i] * (i % 2 === 0 ? 2 : 1);
    if (n > 9) n -= 9;
    suma += n;
  }
  return (10 - (suma % 10)) % 10 === +c[9];
}

const estilo = document.createElement("style");
estilo.textContent = `
  .error{display:block;color:#c62828;font-size:.8rem;min-height:1em;margin-top:3px}
  .invalido{border:1px solid #c62828 !important}
  .valido{border:1px solid #2e7d32 !important}
  #aviso{margin-top:10px;font-weight:bold}
  #lista{max-width:1000px;margin:24px auto;padding:0 12px;overflow-x:auto}
  #lista table{width:100%;border-collapse:collapse;font-size:.85rem}
  #lista th,#lista td{border:1px solid #ccc;padding:6px 8px;text-align:left;white-space:nowrap}
  #lista th{background:#eee;color:#222}
`;
document.head.appendChild(estilo);

campos.forEach(id => {
  const sp = document.createElement("span");
  sp.className = "error";
  document.getElementById(id).insertAdjacentElement("afterend", sp);
});
const aviso = document.createElement("div");
aviso.id = "aviso";
form.appendChild(aviso);

const lista = document.createElement("section");
lista.id = "lista";
document.body.appendChild(lista);

function validar(id) {
  const el = document.getElementById(id);
  const v = el.value.trim();
  const ok = REGEX[id].test(v);
  el.classList.toggle("invalido", !ok);
  el.classList.toggle("valido", ok);
  el.nextElementSibling.textContent = ok ? "" : MENSAJES[id];
  return ok;
}

campos.forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("input", () => validar(id));
  el.addEventListener("change", () => validar(id));
});

["Cedula", "telefono"].forEach(id =>
  document.getElementById(id).addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "");
  })
);

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || []; }
  catch (e) { return []; }
}
function guardar(datos) {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); return true; }
  catch (e) { return false; }
}
function mostrarAviso(texto, error) {
  aviso.style.color = error ? "#c62828" : "#2e7d32";
  aviso.textContent = texto;
  setTimeout(() => { if (aviso.textContent === texto) aviso.textContent = ""; }, 3000);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function mostrarTabla() {
  const datos = leer();
  if (!datos.length) { lista.innerHTML = ""; return; }
  lista.innerHTML = `
    <h2>Estudiantes registrados (${datos.length})</h2>
    <table>
      <thead><tr><th>Cédula</th><th>Apellidos</th><th>Nombres</th><th>Dirección</th><th>Teléfono</th><th>Correo</th><th>Facultad</th><th>Nivel</th><th>Paralelo</th><th></th></tr></thead>
      <tbody>${datos.map(e => `
        <tr><td>${esc(e.cedula)}</td><td>${esc(e.apellidos)}</td><td>${esc(e.nombres)}</td><td>${esc(e.direccion)}</td>
        <td>${esc(e.telefono)}</td><td>${esc(e.correo)}</td><td>${esc(e.facultad)}</td><td>${esc(e.nivel)}</td><td>${esc(e.paralelo)}</td>
        <td><button type="button" data-del="${esc(e.cedula)}">Eliminar</button></td></tr>`).join("")}
      </tbody>
    </table>`;
}
lista.addEventListener("click", e => {
  const ced = e.target.dataset.del;
  if (ced && confirm("¿Eliminar este registro?")) {
    guardar(leer().filter(x => x.cedula !== ced));
    mostrarTabla();
  }
});

// ---- Envío ----
form.addEventListener("submit", e => {
  e.preventDefault();
  if (campos.map(validar).includes(false)) {
    mostrarAviso("Corrige los campos marcados.", true);
    return;
  }
  const estudiante = {
    cedula: Cedula.value.trim(),
    apellidos: apellido.value.trim(),
    nombres: nombre.value.trim(),
    direccion: direccion.value.trim(),
    telefono: telefono.value.trim(),
    correo: correo.value.trim(),
    facultad: facultad.value.trim(),
    nivel: nivel.value,
    paralelo: paralelo.value
  };
  const datos = leer();
  if (datos.some(x => x.cedula === estudiante.cedula)) {
    const el = document.getElementById("Cedula");
    el.classList.add("invalido");
    el.nextElementSibling.textContent = "Ya existe un estudiante con esta cédula.";
    return;
  }
  datos.push(estudiante);
  if (!guardar(datos)) { mostrarAviso("No se pudo guardar en localStorage.", true); return; }
  form.reset();
  campos.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove("valido", "invalido");
    el.nextElementSibling.textContent = "";
  });
  mostrarAviso("Estudiante registrado correctamente.");
  mostrarTabla();
});

mostrarTabla();