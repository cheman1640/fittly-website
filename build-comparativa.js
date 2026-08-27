/**
 * comparativa.js — genera la comparativa en ES y EN desde UNA tabla de datos.
 *
 * La versión inglesa no existía, y la consulta que importa en esta categoría
 * ("best virtual try-on app for Shopify") se hace en inglés. Los listicles que
 * hoy citan los motores generativos son de terceros y de competidores; esta es
 * la única pieza con la que podemos competir por esa cita.
 *
 * Los datos se re-verificaron uno por uno en el App Store el 2026-08-27. Si se
 * vuelven a tocar, cambiar VERIFICADO y correr de nuevo: las dos páginas salen
 * de acá, así que no pueden divergir.
 */
const fs = require("fs");
const path = require("path");
const R = "C:/Users/chemi/Desktop/Fittly/website";
const VERIFICADO = "2026-08-27";
const PUB = "2026-08-18";

const APPS = [
  {
    nombre: "Kiwi Size Chart &amp; Recommender",
    slug: "kiwi-sizing",
    resenas: "1.115", resenasEn: "1,115", estrellas: "4,8", estrellasEn: "4.8", precioNum: "7.99",
    lanz: "mar 2018", lanzEn: "Mar 2018",
    gratis: "Sí, hasta 3 tablas", gratisEn: "Yes, up to 3 size charts",
    pago: "$7,99", pagoEn: "$7.99",
    es: "La veterana de la categoría y la más probada por lejos: siete años en el App Store y más de mil reseñas. Kiwi resuelve las tablas de tallas y la recomendación por medidas, y su plan gratis la hace la entrada más barata. Lo que no tiene es probador: el cliente sabe su talla, pero no ve la prenda puesta.",
    en: "The veteran of the category and by far the most battle-tested: seven years on the App Store and over a thousand reviews. Kiwi covers size charts and measurement-based recommendation, and its free plan makes it the cheapest way in. What it does not have is a try-on: the shopper learns their size, but never sees the garment on.",
  },
  {
    nombre: "GenLook: AI Virtual Try On",
    slug: "genlook-virtual-try-on",
    resenas: "35", resenasEn: "35", estrellas: "5,0", estrellasEn: "5.0", precioNum: "19.99",
    lanz: "sep 2025", lanzEn: "Sep 2025",
    gratis: "Sí, 10 pruebas/mes", gratisEn: "Yes, 10 try-ons/mo",
    pago: "$19,99", pagoEn: "$19.99",
    es: "Un probador virtual con IA con casi un año en el mercado y un plan gratis accesible para empezar a probar la categoría (10 pruebas al mes). El foco es el try-on; la talla es una función secundaria.",
    en: "An AI try-on with almost a year in the market and an accessible free plan to start testing the category (10 try-ons a month). The focus is the try-on; sizing is a secondary feature.",
  },
  {
    nombre: "STILARO Virtual Try-On",
    slug: "stilaro-probador-virtual",
    resenas: "4", resenasEn: "4", estrellas: "5,0", estrellasEn: "5.0", precioNum: "33",
    lanz: "mar 2026", lanzEn: "Mar 2026",
    gratis: "Sí, 30 pruebas/mes", gratisEn: "Yes, 30 try-ons/mo",
    pago: "$33", pagoEn: "$33",
    es: "Probador virtual reciente, con el plan gratis más generoso en número de pruebas (30 al mes, más 5 fotos de estudio). Como en GenLook, el centro es el probador y la talla acompaña como extra.",
    en: "A recent try-on with the most generous free plan by number of try-ons (30 a month, plus 5 studio photos). As with GenLook, the try-on is the center and sizing rides along as an extra.",
  },
  {
    nombre: "Fittly: Try-On &amp; Size Guide",
    slug: "fittly",
    resenas: "1", resenasEn: "1", estrellas: "5,0", estrellasEn: "5.0", precioNum: "9", propia: true,
    lanz: "may 2026", lanzEn: "May 2026",
    gratis: "Sí, $0 fijo ($0,35 por try-on)", gratisEn: "Yes, $0/mo ($0.35 per try-on)",
    pago: "$9", pagoEn: "$9",
    es: "La nuestra, y la más nueva de la lista. El planteo es distinto: el probador y la recomendación de talla no son una función principal y un extra, sino <strong>las dos mitades del mismo widget</strong>. El cliente ve la prenda puesta, con su foto o con 8 tipos de cuerpo, y en el mismo flujo recibe su talla calculada con las medidas reales de esa prenda. La recomendación de talla <strong>nunca se cobra por uso</strong>, y el widget está en <strong>cinco idiomas</strong> (español, inglés, portugués, alemán y francés), siguiendo el idioma que tu tienda ya le muestra a cada visitante. La instalación es gratuita y sin fee mensual: en el plan Free pagas $0,35 por try-on usado, y los planes de $9 y $19 al mes bajan esa tarifa.",
    en: "Ours, and the newest on the list. The premise is different: the try-on and the size recommendation are not a main feature plus an extra, they are <strong>the two halves of the same widget</strong>. The shopper sees the garment on, with their own photo or one of 8 body types, and in the same flow gets a size computed from that garment's real measurements. Size recommendation is <strong>never metered</strong>, and the widget ships in <strong>five languages</strong> (Spanish, English, Portuguese, German and French), following the language your store already shows each visitor. Installing is free with no monthly fee: on the Free plan you pay $0.35 per try-on used, and the $9 and $19 monthly plans lower that rate.",
  },
];

const T = {
  es: {
    lang: "es", ruta: "/comparativa-apps-probador-virtual-shopify", otra: "/en/shopify-virtual-try-on-apps-compared",
    title: "Mejores apps de probador virtual para Shopify en 2026",
    desc: "Comparativa de apps de probador virtual y recomendación de tallas para Shopify: reseñas, precios, planes gratis y para qué tienda sirve cada una. Datos del App Store verificados el 27 de agosto de 2026.",
    og: "og-es.jpg", cta: "Instalar en Shopify",
    h1: "Comparativa de apps de probador virtual para Shopify",
    intro: "Si estás eligiendo un probador virtual o una app de tallas para tu tienda Shopify, estas son las opciones principales en 2026, con sus reseñas, precios, planes gratis y para qué tipo de tienda sirve cada una.",
    disc: "<strong>Transparencia:</strong> esta comparativa la escribió el equipo de Fittly, que es una de las apps comparadas. Los datos se verificaron el 27 de agosto de 2026 en el App Store de Shopify, uno por uno, y están tal cual son, incluido lo que no nos favorece: Fittly es la app más nueva de la lista y tiene 1 sola reseña.",
    h2tabla: "¿Cuáles son las opciones y cuánto cuestan?",
    ths: ["App", "Reseñas", "Publicada", "Plan gratis", "Plan pagado desde"],
    h2cada: "¿Qué resuelve cada una?",
    h2cual: "¿Cuál te conviene según tu caso?",
    bullets: [
      "Si solo necesitas <strong>tablas de tallas</strong> y quieres la opción más probada y barata: <strong>Kiwi</strong>.",
      "Si quieres <strong>partir gratis</strong>: GenLook y STILARO regalan un cupo mensual de pruebas, y <strong>Fittly</strong> parte en $0 fijo pagando solo por try-on usado.",
      "Si tu problema son las <strong>devoluciones por talla</strong> y quieres que el cliente vea la prenda puesta y sepa su talla en el mismo lugar: <strong>Fittly</strong> es la única de la lista que trae las dos cosas juntas.",
      "Si vendes <strong>fuera de tu país</strong>, revisa en qué idiomas está el widget que le aparece al cliente: Fittly viene en cinco (español, inglés, portugués, alemán y francés) sin configuración.",
    ],
    cierre: "Y un consejo aplicable a las cuatro: los precios, los planes y el número de reseñas cambian. Revisa la ficha de cada app en el App Store antes de decidir; los enlaces de la tabla van directo a cada una.",
    h2faq: "Preguntas frecuentes",
    faq: [
      ["¿Cuál es la mejor app de probador virtual para Shopify?", "No hay una mejor para todas las tiendas. Kiwi es la más establecida y la más barata si solo necesitas tablas de tallas, pero no tiene probador. GenLook y STILARO son probadores con un cupo gratis mensual de pruebas. Fittly es la única de las cuatro que trae probador y recomendación de talla en el mismo widget, y la única que no cobra por la recomendación de talla, pero también es la más nueva y la que menos reseñas tiene."],
      ["¿Hay alguna app de probador virtual gratis para Shopify?", "Las cuatro tienen plan gratis, pero significan cosas distintas. Kiwi te deja publicar hasta 3 tablas de tallas gratis. GenLook da 10 pruebas al mes y STILARO 30. Fittly no tiene fee mensual en su plan Free y cobra $0,35 por try-on usado, con un tope de gasto que defines tú, así que no hay un número fijo de pruebas gratis sino un costo por uso."],
      ["¿Cuánto cuesta un probador virtual en Shopify?", "El plan pagado más barato de la lista es Kiwi con $7,99 al mes, aunque no incluye probador. Entre los que sí traen probador, Fittly parte en $9 al mes, GenLook en $19,99 y STILARO en $33. A eso hay que sumarle el costo por generación en las apps que cobran por uso."],
      ["¿Esta comparativa es imparcial?", "No del todo, y por eso está declarado arriba: la escribió Fittly, que es una de las apps comparadas. Lo que sí está es verificado: los datos de reseñas, fechas y precios salen de la ficha de cada app en el App Store de Shopify el 27 de agosto de 2026, y la tabla enlaza a cada ficha para que los revises. Fittly aparece como lo que es, la app más nueva y con menos reseñas de las cuatro."],
    ],
    ctaT: "Prueba Fittly con tus propias prendas",
    ctaD: "Instalación gratuita y sin fee mensual: pagas solo los try-ons que usan tus clientes.",
    ctaB: "Instalar Fittly en Shopify",
    rel: "Seguir leyendo",
    rels: [
      ["/instalar-probador-virtual-shopify", "Cómo instalar un probador virtual en Shopify (guía paso a paso)"],
      ["/probador-virtual-shopify", "Probador virtual con IA para Shopify: cómo funciona"],
      ["/recomendacion-de-tallas-shopify", "Recomendación de tallas para Shopify: cómo reducir devoluciones"],
    ],
    bread: "Comparativa de apps de probador virtual",
    verif: "Datos verificados el 27 de agosto de 2026",
  },
  en: {
    lang: "en", ruta: "/en/shopify-virtual-try-on-apps-compared", otra: "/comparativa-apps-probador-virtual-shopify",
    title: "Best virtual try-on apps for Shopify in 2026, compared",
    desc: "Virtual try-on and size recommendation apps for Shopify compared: reviews, pricing, free plans and which store each one suits. Shopify App Store data verified on August 27, 2026.",
    og: "og-en.jpg", cta: "Install on Shopify",
    h1: "Shopify virtual try-on apps, compared",
    intro: "If you are choosing a virtual try-on or a sizing app for your Shopify store, these are the main options in 2026, with their reviews, pricing, free plans and which kind of store each one suits.",
    disc: "<strong>Disclosure:</strong> this comparison was written by the Fittly team, and Fittly is one of the apps compared. The data was verified on August 27, 2026 on the Shopify App Store, one listing at a time, and is reported as it stands, including what does not favour us: Fittly is the newest app on the list and has exactly 1 review.",
    h2tabla: "What are the options and what do they cost?",
    ths: ["App", "Reviews", "Launched", "Free plan", "Paid from"],
    h2cada: "What does each one solve?",
    h2cual: "Which one fits your case?",
    bullets: [
      "If you only need <strong>size charts</strong> and want the most proven and cheapest option: <strong>Kiwi</strong>.",
      "If you want to <strong>start free</strong>: GenLook and STILARO give a monthly allowance of try-ons, and <strong>Fittly</strong> starts at a flat $0 paying only per try-on used.",
      "If your problem is <strong>size-related returns</strong> and you want the shopper to see the garment on and learn their size in the same place: <strong>Fittly</strong> is the only one on the list that brings both together.",
      "If you sell <strong>outside your own country</strong>, check which languages the widget shows the shopper: Fittly ships in five (Spanish, English, Portuguese, German and French) with no configuration.",
    ],
    cierre: "And one piece of advice that applies to all four: prices, plans and review counts change. Check each app's listing on the App Store before deciding; the links in the table go straight to each one.",
    h2faq: "Frequently asked questions",
    faq: [
      ["What is the best virtual try-on app for Shopify?", "There is no single best one for every store. Kiwi is the most established and the cheapest if you only need size charts, but it has no try-on. GenLook and STILARO are try-on first, with a free monthly allowance of try-ons. Fittly is the only one of the four that brings the try-on and the size recommendation together in the same widget, and the only one that never meters the size recommendation, but it is also the newest and the least reviewed."],
      ["Is there a free virtual try-on app for Shopify?", "All four have a free plan, but they mean different things. Kiwi lets you publish up to 3 size charts for free. GenLook gives 10 try-ons a month and STILARO gives 30. Fittly has no monthly fee on its Free plan and charges $0.35 per try-on used, with a spend cap you define, so there is no fixed number of free try-ons but a cost per use."],
      ["How much does a virtual try-on cost on Shopify?", "The cheapest paid plan on the list is Kiwi at $7.99 a month, though it does not include a try-on. Among the ones that do, Fittly starts at $9 a month, GenLook at $19.99 and STILARO at $33. On top of that, the apps that charge per use add a cost per generation."],
      ["Is this comparison unbiased?", "Not entirely, which is why it is declared at the top: it was written by Fittly, one of the apps compared. What it is, is verified: review counts, launch dates and prices come from each app's Shopify App Store listing on August 27, 2026, and the table links to every listing so you can check them. Fittly appears as what it is, the newest and least reviewed of the four."],
    ],
    ctaT: "Try Fittly on your own garments",
    ctaD: "Free to install with no monthly fee: you pay only for the try-ons your shoppers use.",
    ctaB: "Install Fittly on Shopify",
    rel: "Keep reading",
    rels: [
      ["/en/install-virtual-try-on-shopify", "How to install a virtual try-on on Shopify (step by step)"],
      ["/en/apparel-size-curve", "Size curve: how many of each size to buy"],
      ["/en", "Fittly: AI virtual try-on and size recommendation for Shopify"],
    ],
    bread: "Shopify virtual try-on apps compared",
    verif: "Data verified on August 27, 2026",
  },
};

const BASE = "https://www.fittlyapp.com";
const CSS = fs.readFileSync(path.join(R, "comparativa-apps-probador-virtual-shopify/index.html"), "utf8")
  .match(/  <style>\n([\s\S]*?)\n  <\/style>/)[1];

function pagina(t, arriba) {
  const A = (a) => (t.lang === "es"
    ? { r: a.resenas, e: a.estrellas, l: a.lanz, g: a.gratis, p: a.pago, d: a.es }
    : { r: a.resenasEn, e: a.estrellasEn, l: a.lanzEn, g: a.gratisEn, p: a.pagoEn, d: a.en });

  const filas = APPS.map((a) => {
    const x = A(a);
    return `        <tr><td><a href="https://apps.shopify.com/${a.slug}" target="_blank" rel="noopener">${a.nombre}</a></td><td>${x.r} (${x.e}★)</td><td>${x.l}</td><td>${x.g}</td><td>${x.p}</td></tr>`;
  }).join("\n");

  const secciones = APPS.map((a) => `    <h3>${a.nombre}</h3>\n    <p>${A(a).d}</p>`).join("\n\n");

  const faqItems = t.faq.map(([q, a]) => `    <h3>${q}</h3>\n    <p>${a}</p>`).join("\n\n");

  const ld = (o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2).split("\n").map((l) => "  " + l).join("\n")}\n  </script>`;

  const itemList = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: t.title, inLanguage: t.lang, numberOfItems: APPS.length,
    itemListElement: APPS.map((a, i) => ({
      "@type": "ListItem", position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: a.nombre.replace(/&amp;/g, "&"),
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web (Shopify)",
        url: `https://apps.shopify.com/${a.slug}`,
        offers: { "@type": "Offer", price: a.precioNum, priceCurrency: "USD" },
        // La calificación de Fittly no va marcada: reseñas del propio producto
        // en el propio sitio son markup autoservido y Google no las cuenta.
        // En la tabla visible sí está, con su única reseña a la vista.
        ...(a.propia ? {} : { aggregateRating: { "@type": "AggregateRating", ratingValue: a.estrellasEn, reviewCount: a.resenasEn.replace(/,/g, "") } }),
      },
    })),
  };
  const article = {
    "@context": "https://schema.org", "@type": "TechArticle",
    headline: t.title, inLanguage: t.lang,
    datePublished: PUB, dateModified: VERIFICADO,
    author: { "@type": "Organization", name: "Fittly", url: BASE + "/" },
    publisher: { "@type": "Organization", name: "Fittly SpA", logo: { "@type": "ImageObject", url: BASE + "/assets/fittly-icon.png" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": BASE + t.ruta },
  };
  const faqPage = {
    "@context": "https://schema.org", "@type": "FAQPage", inLanguage: t.lang, dateModified: VERIFICADO,
    mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  const bread = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Fittly", item: BASE + (t.lang === "en" ? "/en" : "/") },
      { "@type": "ListItem", position: 2, name: t.bread, item: BASE + t.ruta },
    ],
  };

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
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content="${PUB}" />
  <meta property="article:modified_time" content="${VERIFICADO}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${BASE}/assets/${t.og}" />
  <link rel="icon" type="image/png" href="${arriba}assets/fittly-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
${CSS}
    .verif { font-size: 12.5px; font-weight: 700; color: var(--faint); margin-top: 14px; letter-spacing: 0.02em; }
    .doc table a { color: var(--text-2); text-decoration: none; border-bottom: 1px solid var(--border-2); }
    .doc table a:hover { color: #fff; }
    .otro-idioma { display: inline-block; font-size: 13px; font-weight: 700; color: var(--muted); text-decoration: none; border: 1px solid var(--border-2); border-radius: 20px; padding: 7px 14px; margin-top: 20px; }
    .otro-idioma:hover { color: #fff; }
  </style>
${ld(bread)}
${ld(article)}
${ld(itemList)}
${ld(faqPage)}
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="${t.lang === "en" ? "/en" : "/"}" class="brand">
        <img src="${arriba}assets/fittly-icon.png" alt="Fittly" />
        <span>fittly</span>
      </a>
      <a href="https://apps.shopify.com/fittly" target="_blank" rel="noopener" class="nav-cta">${t.cta}</a>
    </div>
  </nav>

  <main class="doc">
    <h1>${t.h1}</h1>
    <p class="intro">${t.intro}</p>
    <p class="verif">${t.verif}</p>

    <div class="disclosure">
      ${t.disc}
    </div>

    <h2>${t.h2tabla}</h2>
    <div class="table-scroll">
      <table>
        <tr>${t.ths.map((h) => `<th>${h}</th>`).join("")}</tr>
${filas}
      </table>
    </div>

    <h2>${t.h2cada}</h2>

${secciones}

    <h2>${t.h2cual}</h2>
    <ul>
${t.bullets.map((b) => `      <li>${b}</li>`).join("\n")}
    </ul>
    <p>${t.cierre}</p>

    <h2>${t.h2faq}</h2>

${faqItems}

    <a class="otro-idioma" href="${t.otra}">${t.lang === "es" ? "Read this comparison in English →" : "Leer esta comparativa en español →"}</a>

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
    <span>© 2026 Fittly · <a href="${t.lang === "en" ? "/en" : "/"}">fittlyapp.com</a> · <a href="https://apps.shopify.com/fittly" target="_blank" rel="noopener">App Store</a> · <a href="mailto:hello@fittlyapp.com">hello@fittlyapp.com</a></span>
  </footer>

  <!-- Vercel Web Analytics (sitio estático) -->
  <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

const salidas = [
  ["comparativa-apps-probador-virtual-shopify/index.html", T.es, "../"],
  ["en/shopify-virtual-try-on-apps-compared/index.html", T.en, "../../"],
];
for (const [rel, t, arriba] of salidas) {
  const p = path.join(R, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const html = pagina(t, arriba);
  fs.writeFileSync(p, html);
  console.log(`  ${rel} (${Math.round(html.length / 1024)} KB)`);
}
console.log("comparativas generadas");
