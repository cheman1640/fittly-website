/**
 * check-langs.js — valida que build-langs.js solo tradujo TEXTO, no markup.
 *
 * Compara cada idioma generado contra la fuente inglesa y exige que los
 * atributos estructurales (src, href, id, class) sean idénticos. Una cadena
 * corta del diccionario que muerde dentro de un nombre de archivo o una clase
 * CSS es invisible a simple vista y rompe la página (caso real: "/mo" ->
 * "/Mon." convirtió modelo-hombre.webp en Mon.delo-hombre.webp).
 *
 * Uso: node check-langs.js   (correr siempre después de build-langs.js)
 */

const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

const attrs = (html, attr) => [...html.matchAll(new RegExp(`${attr}="([^"]*)"`, "g"))].map((m) => m[1]);

const fuente = fs.readFileSync(path.join(ROOT, "en", "index.html"), "utf8");
let fallos = 0;

for (const lang of ["de", "fr", "pt"]) {
  const f = path.join(ROOT, lang, "index.html");
  if (!fs.existsSync(f)) { fallos++; console.log(`  ${lang}: NO EXISTE`); continue; }
  const gen = fs.readFileSync(f, "utf8");
  const problemas = [];

  // src e id deben ser idénticos; href puede diferir (rutas de idioma) pero los
  // de assets no.
  for (const attr of ["src", "id"]) {
    const a = attrs(fuente, attr), b = attrs(gen, attr);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) problemas.push(`${attr}: "${a[i]}" -> "${b[i]}"`);
    }
  }
  const hrefA = attrs(fuente, "href").filter((h) => h.includes("/assets/"));
  const hrefB = attrs(gen, "href").filter((h) => h.includes("/assets/"));
  for (let i = 0; i < Math.max(hrefA.length, hrefB.length); i++) {
    if (hrefA[i] !== hrefB[i]) problemas.push(`href asset: "${hrefA[i]}" -> "${hrefB[i]}"`);
  }
  // las clases CSS nunca deben cambiar
  const clsA = [...new Set(attrs(fuente, "class"))].sort();
  const clsB = [...new Set(attrs(gen, "class"))].sort();
  for (const c of clsA) if (!clsB.includes(c)) problemas.push(`clase perdida: "${c}"`);

  // el JS debe seguir parseando
  for (const [i, code] of [...gen.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).entries()) {
    try { new Function(code.replace(/^\s*const \{ createClient \} = supabase;/m, "const createClient=()=>({});")); }
    catch (e) { problemas.push(`script#${i} no parsea: ${e.message}`); }
  }
  // el JSON-LD debe seguir siendo válido
  for (const b of [...gen.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n  <\/script>/g)]) {
    try { JSON.parse(b[1]); } catch (e) { problemas.push(`JSON-LD inválido: ${e.message}`); }
  }

  if (problemas.length) { fallos += problemas.length; console.log(`  ${lang}: ${problemas.length} problema(s)`); problemas.slice(0, 6).forEach((p) => console.log(`      ${p}`)); }
  else console.log(`  ${lang}: OK (markup intacto, scripts y JSON-LD válidos)`);
}

console.log(fallos === 0 ? "TODO OK" : `${fallos} PROBLEMAS`);
process.exit(fallos ? 1 : 0);
