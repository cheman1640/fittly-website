/**
 * build-faq.js — genera /faq y /en/faq.
 *
 * Existe por el campo "FAQ URL" del listing del App Store: pide un enlace, no
 * un texto, y hasta hoy no habia ninguna pagina que darle porque las preguntas
 * vivian dentro de la home sin URL propia. Ademas es la clase de pagina que un
 * motor generativo cita entera.
 *
 * Las preguntas comunes NO se escriben aca: se leen del FAQPage de index.html y
 * de en/index.html, asi que si cambia la home cambia esta pagina sola y no
 * pueden decir cosas distintas. Aca solo viven las preguntas que son de
 * comerciante y que en la home no caben.
 *
 *   node build-faq.js     (correr despues de tocar el FAQ de cualquiera de las
 *                          dos homes)
 */
const fs = require("fs");
const path = require("path");
const R = __dirname;
const BASE = "https://www.fittlyapp.com";
const HOY = "2026-08-27";

// ── preguntas de la home, leidas de su propio schema ────────────────────────
function delHome(archivo) {
  const s = fs.readFileSync(path.join(R, archivo), "utf8");
  for (const m of s.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n  <\/script>/g)) {
    const o = JSON.parse(m[1]);
    if (o["@type"] === "FAQPage") return o.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]);
  }
  throw new Error("no encuentro el FAQPage en " + archivo);
}

// ── preguntas propias de comerciante ────────────────────────────────────────
// Cada una responde algo ya publicado y verificado. Si no esta verificado, no va.
const EXTRA_ES = [
  ["¿Tengo que subir mis guías de talla?",
   "No. Fittly escanea tu catálogo por su cuenta y lee las guías de talla que ya están dentro de tus propias fotos de producto, así que no tienes que subir ni transcribir ninguna tabla. El escaneo arranca solo, con el primer try-on real de tu tienda."],
  ["¿Cuánto se demora instalarlo?",
   "Un paso: activas el app embed en el editor de temas de Shopify y guardas. No hay que tocar código ni configurar nada más, y a partir de ahí Fittly se encarga del resto. Hay una guía con el proceso completo en /instalar-probador-virtual-shopify."],
  ["¿Puedo controlar cuánto gasto al mes?",
   "Sí. Tú defines un tope de gasto mensual y Fittly no lo pasa. Como el cobro es por try-on usado y no por un cupo fijo que compras por adelantado, el tope es lo que te da el control."],
  ["¿Puedo probarlo antes de pagar?",
   "Sí. Tienes 14 días gratis o 75 try-ons, lo que se cumpla antes, sin tarjeta. Cuando el trial termina no te pasa a un plan pagado: caes al plan Free, que no tiene fee mensual y cobra $0,35 por try-on usado."],
];
const EXTRA_EN = [
  ["Do I have to upload my size charts?",
   "No. Fittly scans your catalog on its own and reads the size charts that are already inside your own product photos, so you never upload or retype a table. The scan starts by itself, on your store's first real try-on."],
  ["How long does it take to install?",
   "One step: you enable the app embed in the Shopify theme editor and save. There is no code to touch and nothing else to configure, and from there Fittly handles the rest. There is a walkthrough of the whole process at /en/install-virtual-try-on-shopify."],
  ["Can I control how much I spend per month?",
   "Yes. You set a monthly spend cap and Fittly does not go past it. Because billing is per try-on used rather than a fixed allowance you buy up front, the cap is what gives you control."],
  ["Can I try it before paying?",
   "Yes. You get 14 days free or 75 try-ons, whichever comes first, with no card. When the trial ends you are not moved onto a paid plan: you land on the Free plan, which has no monthly fee and charges $0.35 per try-on used."],
];

const T = {
  es: {
    lang: "es", ruta: "/faq", otra: "/en/faq", arriba: "",
    home: "/", og: "og-es.jpg",
    title: "Preguntas frecuentes sobre Fittly",
    desc: "Preguntas frecuentes sobre Fittly, el probador virtual con IA y la recomendación de tallas para Shopify: precios, instalación, idiomas, privacidad y en qué se diferencia.",
    h1: "Preguntas frecuentes",
    intro: "Todo lo que suelen preguntar las tiendas antes de instalar Fittly. Si te falta algo, escríbenos a hello@fittlyapp.com y lo respondemos.",
    cta: "Instalar en Shopify",
    otraTxt: "Read this FAQ in English →",
    ctaT: "Pruébalo con tus propias prendas",
    ctaD: "14 días gratis o 75 pruebas, sin tarjeta. Después la instalación sigue gratis y pagas solo los try-ons que usan tus clientes.",
    ctaB: "Instalar Fittly en Shopify",
    rel: "Seguir leyendo",
    rels: [
      ["/probador-virtual-shopify", "Probador virtual con IA para Shopify: cómo funciona"],
      ["/recomendacion-de-tallas-shopify", "Recomendación de tallas para Shopify: cómo reducir devoluciones"],
      ["/instalar-probador-virtual-shopify", "Cómo instalar un probador virtual en Shopify"],
      ["/comparativa-apps-probador-virtual-shopify", "Comparativa de apps de probador virtual para Shopify"],
    ],
    bread: "Preguntas frecuentes",
    act: "Actualizado el 27 de agosto de 2026",
  },
  en: {
    lang: "en", ruta: "/en/faq", otra: "/faq", arriba: "../",
    home: "/en", og: "og-en.jpg",
    title: "Fittly FAQ: virtual try-on and sizing for Shopify",
    desc: "Frequently asked questions about Fittly, the AI virtual try-on and size recommendation for Shopify: pricing, install, languages, privacy and how it is different.",
    h1: "Frequently asked questions",
    intro: "Everything stores usually ask before installing Fittly. If something is missing, write to hello@fittlyapp.com and we will answer it.",
    cta: "Install on Shopify",
    otraTxt: "Leer estas preguntas en español →",
    ctaT: "Try it on your own garments",
    ctaD: "14 days free or 75 try-ons, no card. After that installing is still free and you pay only for the try-ons your shoppers use.",
    ctaB: "Install Fittly on Shopify",
    rel: "Keep reading",
    rels: [
      ["/en/install-virtual-try-on-shopify", "How to install a virtual try-on on Shopify"],
      ["/en/shopify-virtual-try-on-apps-compared", "Shopify virtual try-on apps, compared"],
      ["/en/apparel-size-curve", "Size curve: how many of each size to buy"],
      ["/en", "Fittly: AI virtual try-on and size recommendation for Shopify"],
    ],
    bread: "FAQ",
    act: "Updated on August 27, 2026",
  },
};

const CSS = fs.readFileSync(path.join(R, "comparativa-apps-probador-virtual-shopify/index.html"), "utf8")
  .match(/  <style>\n([\s\S]*?)\n  <\/style>/)[1];

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Rutas reales del sitio, sacadas del arbol de archivos. El autolink SOLO puede
// enlazar una de estas: la primera version usaba un patron suelto de "/algo" y
// convirtio "$9/mes" y "$9/mo" en enlaces rotos, el mismo error que ya nos
// costo las imagenes en DE/FR/PT cuando "/mo" mordio dentro de un nombre de
// archivo. Un patron que adivina rutas siempre encuentra una de mas.
const RUTAS = (() => {
  const out = new Set();
  (function walk(d, pre) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if ([".git", "node_modules", "assets", "db", "website-export", "partners"].includes(e.name)) continue;
        if (fs.existsSync(path.join(d, e.name, "index.html"))) out.add(pre + "/" + e.name);
        walk(path.join(d, e.name), pre + "/" + e.name);
      }
    }
  })(R, "");
  return [...out].sort((a, b) => b.length - a.length);
})();

// las respuestas nombran rutas en texto plano; en la página conviene que sean enlaces
const enlazar = (t) => {
  for (const r of RUTAS) t = t.split(r + ".").join(`<a href="${r}">${r}</a>.`);
  return t;
};

function pagina(t, pares) {
  const ld = (o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2).split("\n").map((l) => "  " + l).join("\n")}\n  </script>`;

  const faqPage = {
    "@context": "https://schema.org", "@type": "FAQPage",
    name: t.title, inLanguage: t.lang, url: BASE + t.ruta, dateModified: HOY,
    publisher: { "@type": "Organization", name: "Fittly SpA", url: BASE + "/" },
    mainEntity: pares.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  const bread = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Fittly", item: BASE + (t.lang === "en" ? "/en" : "/") },
      { "@type": "ListItem", position: 2, name: t.bread, item: BASE + t.ruta },
    ],
  };

  const cuerpo = pares.map(([q, a]) => `    <h2>${esc(q)}</h2>\n    <p>${enlazar(esc(a))}</p>`).join("\n\n");

  return `<!DOCTYPE html>
<html lang="${t.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.title}</title>
  <meta name="description" content="${t.desc}" />
  <link rel="canonical" href="${BASE}${t.ruta}" />
  <link rel="alternate" hreflang="es" href="${BASE}${T.es.ruta}" />
  <link rel="alternate" hreflang="en" href="${BASE}${T.en.ruta}" />
  <link rel="alternate" hreflang="x-default" href="${BASE}${T.en.ruta}" />
  <meta property="og:title" content="${t.title}" />
  <meta property="og:description" content="${t.desc}" />
  <meta property="og:image" content="${BASE}/assets/${t.og}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${BASE}${t.ruta}" />
  <meta property="og:site_name" content="Fittly" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${BASE}/assets/${t.og}" />
  <link rel="icon" type="image/png" href="${t.arriba}assets/fittly-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
${CSS}
    .doc h2 { font-size: 20px; margin: 38px 0 10px; }
    .act { font-size: 12.5px; font-weight: 700; color: var(--faint); margin-top: 14px; }
    .otro-idioma { display: inline-block; font-size: 13px; font-weight: 700; color: var(--muted); text-decoration: none; border: 1px solid var(--border-2); border-radius: 20px; padding: 7px 14px; margin-top: 30px; }
    .otro-idioma:hover { color: #fff; }
  </style>
${ld(bread)}
${ld(faqPage)}
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="${t.home}" class="brand">
        <img src="${t.arriba}assets/fittly-icon.png" alt="Fittly" />
        <span>fittly</span>
      </a>
      <a href="https://apps.shopify.com/fittly" target="_blank" rel="noopener" class="nav-cta">${t.cta}</a>
    </div>
  </nav>

  <main class="doc">
    <h1>${t.h1}</h1>
    <p class="intro">${t.intro}</p>
    <p class="act">${t.act}</p>

${cuerpo}

    <a class="otro-idioma" href="${t.otra}">${t.otraTxt}</a>

    <div class="cta-card">
      <div class="t">${t.ctaT}</div>
      <div class="d">${t.ctaD}</div>
      <a class="btn" href="https://apps.shopify.com/fittly" target="_blank" rel="noopener">${t.ctaB}</a>
    </div>

    <div class="related">
      <span class="rl">${t.rel}</span>
${t.rels.map(([h, n]) => `      <a href="${h}">${n}</a>`).join("\n")}
    </div>
  </main>

  <footer class="footer">
    <span>© 2026 Fittly · <a href="${t.home}">fittlyapp.com</a> · <a href="https://apps.shopify.com/fittly" target="_blank" rel="noopener">App Store</a> · <a href="mailto:hello@fittlyapp.com">hello@fittlyapp.com</a></span>
  </footer>

  <!-- Vercel Web Analytics (sitio estático) -->
  <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

for (const [t, home, extra, salida] of [
  [T.es, "index.html", EXTRA_ES, "faq/index.html"],
  [T.en, "en/index.html", EXTRA_EN, "en/faq/index.html"],
]) {
  const pares = [...delHome(home), ...extra];
  const p = path.join(R, salida);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const html = pagina(t, pares);
  fs.writeFileSync(p, html);
  console.log(`  ${salida}: ${pares.length} preguntas (${pares.length - extra.length} de la home + ${extra.length} propias), ${Math.round(html.length / 1024)} KB`);
}
console.log("FAQ generado");
