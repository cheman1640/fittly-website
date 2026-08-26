/**
 * Archiva la version vigente de /partners/terms en una URL permanente y en un PDF fechado.
 *
 *   node archive-terms.js
 *
 * Flujo cuando cambies los terminos:
 *   1. Edita partners/terms.html: el texto, la fecha de "ultima actualizacion"
 *      y el badge <div class="ver" data-version="N" data-date="AAAA-MM-DD">.
 *   2. Corre este script. Genera partners/terms-vN.html y partners/terms-vN.pdf,
 *      y reescribe el historial de versiones en la pagina vigente.
 *   3. Commitea los tres archivos juntos.
 *
 * Las versiones archivadas van con noindex para que Google no ranquee terminos
 * viejos, pero quedan accesibles: son la prueba de que decia la pagina en la
 * fecha de una comision disputada.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = __dirname;
const DIR = path.join(RAIZ, "partners");
const VIGENTE = path.join(DIR, "terms.html");

const NAVEGADORES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

const MES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MES_ES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parte = (iso) => {
  const [a, m, d] = iso.split("-").map(Number);
  return { a, m: m - 1, d };
};
const fechaEs = (iso) => { const { a, m, d } = parte(iso); return `${d} de ${MES_ES[m]} de ${a}`; };
const fechaEsCorta = (iso) => { const { a, m, d } = parte(iso); return `${String(d).padStart(2, "0")}-${MES_ES_CORTO[m]}-${a}`; };
const fechaEn = (iso) => { const { a, m, d } = parte(iso); return `${MES_EN[m]} ${d}, ${a}`; };

// ---------- 1. leer la version vigente ----------
let vigente = fs.readFileSync(VIGENTE, "utf8");
const badge = vigente.match(/<div class="ver" data-version="(\d+)" data-date="(\d{4}-\d{2}-\d{2})">/);
if (!badge) {
  console.error("No encuentro el badge <div class=\"ver\" data-version data-date> en partners/terms.html.");
  process.exit(1);
}
const V = Number(badge[1]);
const FECHA = badge[2];
console.log(`  version vigente: v${V} · ${FECHA}`);

// ---------- 2. snapshot con noindex y aviso de archivada ----------
const slug = `terms-v${V}`;
const destino = path.join(DIR, `${slug}.html`);

let snap = vigente;
snap = snap.replace(
  '<meta name="robots" content="index, follow" />',
  `<meta name="robots" content="noindex, follow" />\n  <link rel="canonical" href="https://www.fittlyapp.com/partners/${slug}" />`
);
snap = snap.replace(
  /<title>[^<]*<\/title>/,
  `<title>Fittly Partner Program · Program Terms v${V} (${fechaEsCorta(FECHA)})</title>`
);
snap = snap.replace(
  '<a href="/partners" class="back">← Programa de partners</a>',
  '<a href="/partners/terms" class="back">← Versión vigente</a>'
);

const AVISO = `    <div class="archived">
      <div data-lang="es"><strong>Versión archivada.</strong> Estos son los Program Terms v${V}, publicados el ${fechaEs(FECHA)}. Se conservan como registro de lo que decía la página en esa fecha. La versión vigente está en <a href="/partners/terms">/partners/terms</a>.</div>
      <div data-lang="en"><strong>Archived version.</strong> These are the Program Terms v${V}, published on ${fechaEn(FECHA)}. They are kept as a record of what the page said on that date. The current version is at <a href="/partners/terms">/partners/terms</a>.</div>
    </div>

    <div class="lang-toggle">`;
if (!snap.includes('    <div class="lang-toggle">')) {
  console.error("No encuentro el lang-toggle para insertar el aviso de version archivada.");
  process.exit(1);
}
snap = snap.replace('    <div class="lang-toggle">', AVISO);

const CSS_AVISO = `    .archived { background: rgba(58,167,117,0.07); border: 1px solid rgba(58,167,117,0.35); border-radius: 14px; padding: 15px 19px; font-size: 13.5px; font-weight: 500; color: var(--text-3); line-height: 1.65; margin-top: 22px; }
    .archived strong { color: #fff; font-weight: 800; }
    .ver { display: inline-block;`;
snap = snap.replace("    .ver { display: inline-block;", CSS_AVISO);

// el historial es de la pagina vigente, no del archivo
snap = snap.replace(/    <!-- ================= HISTORIAL ================= -->[\s\S]*?<\/section>\n\n/, "");

fs.writeFileSync(destino, snap);
console.log(`  escrito: partners/${slug}.html`);

// ---------- 3. PDF fechado ----------
const navegador = NAVEGADORES.find((p) => fs.existsSync(p));
const pdf = path.join(DIR, `${slug}.pdf`);
if (!navegador) {
  console.log("  aviso: no encontre Chrome ni Edge, el PDF hay que generarlo a mano (Ctrl+P sobre la version archivada).");
} else {
  execFileSync(navegador, [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdf}`,
    "file:///" + destino.replace(/\\/g, "/"),
  ], { stdio: "ignore" });
  const kb = Math.round(fs.statSync(pdf).size / 1024);
  console.log(`  escrito: partners/${slug}.pdf (${kb} KB)`);
}

// ---------- 4. reescribir el historial en la version vigente ----------
const versiones = fs.readdirSync(DIR)
  .map((f) => f.match(/^terms-v(\d+)\.html$/))
  .filter(Boolean)
  .map((m) => {
    const n = Number(m[1]);
    const b = fs.readFileSync(path.join(DIR, m.input), "utf8").match(/data-date="(\d{4}-\d{2}-\d{2})"/);
    return { n, fecha: b ? b[1] : FECHA, pdf: fs.existsSync(path.join(DIR, `terms-v${n}.pdf`)) };
  })
  .sort((a, b) => b.n - a.n);

const fila = (v, idioma) => {
  const act = v.n === V;
  const t = idioma === "es"
    ? { fecha: fechaEs(v.fecha), tag: act ? "vigente" : "reemplazada", ver: "Ver", pdf: "PDF" }
    : { fecha: fechaEn(v.fecha), tag: act ? "in force" : "superseded", ver: "View", pdf: "PDF" };
  const linkPdf = v.pdf ? `<a href="/partners/terms-v${v.n}.pdf">${t.pdf}</a>` : "";
  return `        <div class="hrow"><span class="v">v${v.n}</span><span class="d">${t.fecha}</span><span class="tag ${act ? "on" : "old"}">${t.tag}</span><a href="/partners/terms-v${v.n}">${t.ver}</a>${linkPdf}</div>`;
};

for (const idioma of ["es", "en"]) {
  const ini = `<!-- HIST-${idioma.toUpperCase()} -->`;
  const fin = `<!-- /HIST-${idioma.toUpperCase()} -->`;
  const i = vigente.indexOf(ini), j = vigente.indexOf(fin);
  if (i === -1 || j === -1) { console.error(`Faltan los marcadores ${ini} en terms.html.`); process.exit(1); }
  vigente = vigente.slice(0, i + ini.length) + "\n" +
    versiones.map((v) => fila(v, idioma)).join("\n") + "\n        " +
    vigente.slice(j);
}
fs.writeFileSync(VIGENTE, vigente);
console.log(`  historial actualizado: ${versiones.map((v) => "v" + v.n).join(", ")}`);
