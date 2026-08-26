/**
 * build-langs.js — genera las versiones DE, FR y PT de la home desde en/index.html.
 *
 * Por qué existe: mantener 5 copias a mano garantiza que un cambio de precio
 * deje 3 idiomas mintiendo. Acá la fuente es UNA (en/index.html) y los idiomas
 * se regeneran. Después de cualquier cambio en la home inglesa, correr:
 *
 *   node build-langs.js
 *
 * Si una cadena del diccionario ya no existe en la fuente, el script FALLA en
 * vez de generar una página a medio traducir.
 */

const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const BASE = "https://www.fittlyapp.com";

const IDIOMAS = {
  de: {
    nombre: "Deutsch", ruta: "/de", locale: "de_DE",
    title: "Fittly — Die KI-Anprobe für Shopify",
    metaDesc: "Fittly ist die KI-Anprobe für Shopify-Shops: realistische Anprobe, genaue Größenempfehlung und ein Widget in 5 Sprachen auf deiner Produktseite. Installiere es kostenlos aus dem Shopify App Store.",
    ogDesc: "Deine Kunden sehen es an sich, bevor sie kaufen. Kostenlos installieren aus dem Shopify App Store.",
  },
  fr: {
    nombre: "Français", ruta: "/fr", locale: "fr_FR",
    title: "Fittly — L'essayage virtuel par IA pour Shopify",
    metaDesc: "Fittly est l'essayage virtuel par IA pour les boutiques Shopify : essayage réaliste, recommandation de taille exacte et un widget en 5 langues sur votre fiche produit. Installation gratuite depuis le Shopify App Store.",
    ogDesc: "Vos clients le voient porté avant d'acheter. Installation gratuite depuis le Shopify App Store.",
  },
  pt: {
    nombre: "Português", ruta: "/pt", locale: "pt_BR",
    title: "Fittly — O provador virtual com IA para Shopify",
    metaDesc: "Fittly é o provador virtual com IA para lojas Shopify: provador realista, recomendação de tamanho exata e um widget em 5 idiomas na sua página de produto. Instale grátis pela Shopify App Store.",
    ogDesc: "Seus clientes veem a peça vestida antes de comprar. Instale grátis pela Shopify App Store.",
  },
};

// ── diccionario: cadena en inglés -> [de, fr, pt] ────────────────────────────
const D = {
  // JSON-LD (va primero por ser la cadena más larga: el sort la toma antes que sus fragmentos)
  "AI virtual try-on and size recommendation for Shopify stores, in 5 languages. Free to install, pay per try-on used.":
    ["KI-Anprobe und Größenempfehlung für Shopify-Shops, in 5 Sprachen. Kostenlos installieren, Zahlung pro genutzter Anprobe.",
     "Essayage virtuel par IA et recommandation de taille pour boutiques Shopify, en 5 langues. Installation gratuite, paiement par essayage utilisé.",
     "Provador virtual com IA e recomendação de tamanho para lojas Shopify, em 5 idiomas. Instalação gratuita, pagamento por prova usada."],
  "Shopify app": ["Shopify-App", "app Shopify", "app Shopify"],

  // nav + hero
  "Install on Shopify": ["Auf Shopify installieren", "Installer sur Shopify", "Instalar no Shopify"],
  "AI virtual try-on · Shopify app": ["KI-Anprobe · Shopify-App", "Essayage virtuel IA · app Shopify", "Provador virtual com IA · app Shopify"],
  "Let them try it on": ["Lass sie es anprobieren", "Laissez-les l'essayer", "Deixe provarem"],
  "before they buy it.": ["bevor sie kaufen.", "avant de l'acheter.", "antes de comprar."],
  "Realistic try-on, exact sizing and a widget in 5 languages, right on your product page. Fewer doubts, fewer returns, more carts.":
    ["Realistische Anprobe, genaue Größe und ein Widget in 5 Sprachen, direkt auf deiner Produktseite. Weniger Zweifel, weniger Retouren, mehr Warenkörbe.",
     "Essayage réaliste, taille exacte et un widget en 5 langues, directement sur votre fiche produit. Moins de doutes, moins de retours, plus de paniers.",
     "Provador realista, tamanho exato e um widget em 5 idiomas, direto na sua página de produto. Menos dúvidas, menos devoluções, mais carrinhos."],
  "See how it works →": ["So funktioniert es →", "Voir comment ça marche →", "Veja como funciona →"],
  "Free to install:": ["Kostenlos installieren:", "Installation gratuite :", "Instalação gratuita:"],
  "no monthly fee": ["keine Monatsgebühr", "sans frais mensuels", "sem taxa mensal"],
  ", pay only per try-on used.": [", du zahlst nur pro genutzter Anprobe.", ", vous ne payez que par essayage utilisé.", ", você paga só por prova usada."],
  "They trusted us first": ["Sie haben uns zuerst vertraut", "Ils nous ont fait confiance en premier", "Confiaram primeiro"],
  "The garment worn, generated with Fittly": ["Das Kleidungsstück getragen, mit Fittly generiert", "Le vêtement porté, généré avec Fittly", "A peça vestida, gerada com Fittly"],
  "The shopper before trying the garment on": ["Der Kunde vor der Anprobe", "Le client avant l'essayage", "O cliente antes de provar"],
  "Before": ["Vorher", "Avant", "Antes"],
  "✦ With Fittly": ["✦ Mit Fittly", "✦ Avec Fittly", "✦ Com Fittly"],
  "Size M": ["Größe M", "Taille M", "Tamanho M"],
  "← Drag to compare →": ["← Ziehen zum Vergleichen →", "← Glissez pour comparer →", "← Arraste para comparar →"],

  // social proof
  "Stores that have used Fittly and helped us grow": ["Shops, die Fittly genutzt und uns beim Wachsen geholfen haben", "Des boutiques qui ont utilisé Fittly et nous ont aidés à grandir", "Lojas que usaram a Fittly e nos ajudaram a crescer"],
  "stores helped us grow": ["Shops halfen uns wachsen", "boutiques nous ont fait grandir", "lojas nos ajudaram a crescer"],
  "try-ons generated": ["Anproben generiert", "essayages générés", "provas geradas"],
  "in 3 days during Cyber Week": ["in 3 Tagen während der Cyber Week", "en 3 jours pendant le Cyber Week", "em 3 dias durante a Cyber Week"],
  "\"A very useful app for fashion ecommerce, a large share of customers use it and it improves the brand's conversion rate considerably.\"":
    ["\"Eine sehr nützliche App für Mode-E-Commerce, ein großer Teil der Kunden nutzt sie und sie verbessert die Conversion-Rate der Marke erheblich.\"",
     "\"Une application très utile pour l'e-commerce de mode, une grande partie des clients l'utilise et elle améliore considérablement le taux de conversion de la marque.\"",
     "\"Um aplicativo muito útil para e-commerce de moda, boa parte dos clientes usa e melhora consideravelmente a taxa de conversão da marca.\""],
  "Review on the Shopify App Store": ["Bewertung im Shopify App Store", "Avis sur le Shopify App Store", "Avaliação na Shopify App Store"],
  "translated from Spanish": ["aus dem Spanischen übersetzt", "traduit de l'espagnol", "traduzido do espanhol"],

  // cómo funciona
  "How it works": ["So funktioniert es", "Comment ça marche", "Como funciona"],
  "From product to body": ["Vom Produkt an den Körper", "Du produit au corps", "Do produto ao corpo"],
  "in seconds.": ["in Sekunden.", "en quelques secondes.", "em segundos."],
  "Pick a model or upload your photo": ["Modell wählen oder Foto hochladen", "Choisissez un modèle ou envoyez votre photo", "Escolha um modelo ou envie sua foto"],
  "8 reference bodies: slim, regular, athletic and plus-size, in male and female. Or the shopper uploads their own photo and sees themselves.":
    ["8 Referenzkörper: slim, regular, athletic und Plus-Size, männlich und weiblich. Oder der Kunde lädt ein eigenes Foto hoch und sieht sich selbst.",
     "8 corps de référence : slim, regular, athletic et grande taille, homme et femme. Ou le client envoie sa propre photo et se voit.",
     "8 corpos de referência: slim, regular, athletic e plus size, masculino e feminino. Ou o cliente envia a própria foto e se vê."],
  "The AI dresses the model in your garment": ["Die KI zieht dem Modell dein Kleidungsstück an", "L'IA habille le modèle avec votre vêtement", "A IA veste o modelo com sua peça"],
  "Fittly generates a realistic try-on of the garment on the chosen body. Standard try-ons are cached for 30 days for instant delivery.":
    ["Fittly generiert eine realistische Anprobe des Kleidungsstücks am gewählten Körper. Standard-Anproben werden 30 Tage gecacht und sofort ausgeliefert.",
     "Fittly génère un essayage réaliste du vêtement sur le corps choisi. Les essayages standards sont mis en cache 30 jours pour un affichage instantané.",
     "A Fittly gera uma prova realista da peça no corpo escolhido. As provas padrão ficam em cache por 30 dias para entrega instantânea."],
  "Buy in the exact size": ["Kauf in der richtigen Größe", "Achetez dans la bonne taille", "Compre no tamanho certo"],
  "The AI analyzes height, weight and fit preference, and recommends the right size. Fewer doubts, fewer returns, more conversion.":
    ["Die KI analysiert Größe, Gewicht und Passform-Vorliebe und empfiehlt die richtige Größe. Weniger Zweifel, weniger Retouren, mehr Conversion.",
     "L'IA analyse la taille, le poids et la coupe préférée, et recommande la bonne taille. Moins de doutes, moins de retours, plus de conversion.",
     "A IA analisa altura, peso e preferência de caimento e recomenda o tamanho certo. Menos dúvidas, menos devoluções, mais conversão."],

  // pilar 1
  "Virtual Try-On": ["Virtuelle Anprobe", "Essayage virtuel", "Provador virtual"],
  "Any garment,": ["Jedes Kleidungsstück,", "N'importe quel vêtement,", "Qualquer peça,"],
  "on any body.": ["an jedem Körper.", "sur n'importe quel corps.", "em qualquer corpo."],
  "The core of Fittly. The shopper sees the garment on, in their own photo or on one of the 8 models, before deciding.":
    ["Der Kern von Fittly. Der Kunde sieht das Kleidungsstück getragen, auf dem eigenen Foto oder an einem der 8 Modelle, bevor er entscheidet.",
     "Le cœur de Fittly. Le client voit le vêtement porté, sur sa propre photo ou sur l'un des 8 modèles, avant de décider.",
     "O núcleo da Fittly. O cliente vê a peça vestida, na própria foto ou em um dos 8 modelos, antes de decidir."],
  "8 predefined models": ["8 vordefinierte Modelle", "8 modèles prédéfinis", "8 modelos predefinidos"],
  ": slim, regular, athletic and plus-size, male and female.": [": slim, regular, athletic und Plus-Size, männlich und weiblich.", " : slim, regular, athletic et grande taille, homme et femme.", ": slim, regular, athletic e plus size, masculino e feminino."],
  "Try-on with their own photo": ["Anprobe mit eigenem Foto", "Essayage avec sa propre photo", "Prova com foto própria"],
  ": the shopper sees themselves. Photos deleted within 72 h.": [": der Kunde sieht sich selbst. Fotos werden binnen 72 Std. gelöscht.", " : le client se voit. Photos supprimées sous 72 h.", ": o cliente se vê. Fotos apagadas em até 72 h."],
  "Saved model": ["Gespeichertes Modell", "Modèle enregistré", "Modelo salvo"],
  ": reused across any store running Fittly.": [": wird in jedem Shop mit Fittly wiederverwendet.", " : réutilisé dans toute boutique équipée de Fittly.", ": reutilizado em qualquer loja com Fittly."],
  "✦ AI generated": ["✦ Von KI generiert", "✦ Généré par IA", "✦ Gerado por IA"],
  "Generated try-on": ["Generierte Anprobe", "Essayage généré", "Prova gerada"],
  "Your store · Classy Hoodie": ["Dein Shop · Classy Hoodie", "Votre boutique · Classy Hoodie", "Sua loja · Classy Hoodie"],
  "This is how it fits 🔥": ["So sitzt es 🔥", "Voilà comment ça tombe 🔥", "Fica assim 🔥"],
  "Add": ["Hinzufügen", "Ajouter", "Adicionar"],

  // pilar 2
  "Size recommendation": ["Größenempfehlung", "Recommandation de taille", "Recomendação de tamanho"],
  "Exact size,": ["Genaue Größe,", "La bonne taille,", "Tamanho exato,"],
  "no confusing charts.": ["ohne verwirrende Tabellen.", "sans tableaux confus.", "sem tabelas confusas."],
  "The AI crosses height, weight and preferred fit with the product's real size guide. Less \"will it fit?\", fewer returns.":
    ["Die KI verknüpft Größe, Gewicht und gewünschte Passform mit der echten Größentabelle des Produkts. Weniger \"passt das?\", weniger Retouren.",
     "L'IA croise la taille, le poids et la coupe souhaitée avec le vrai guide des tailles du produit. Moins de \"est-ce que ça m'ira ?\", moins de retours.",
     "A IA cruza altura, peso e caimento preferido com a tabela de medidas real do produto. Menos \"será que serve?\", menos devoluções."],
  "Sizing AI": ["Größen-KI", "IA de taille", "IA de tamanho"],
  ": analyzes the shopper's height, weight and fit preference.": [": analysiert Größe, Gewicht und Passform-Vorliebe des Kunden.", " : analyse la taille, le poids et la coupe préférée du client.", ": analisa altura, peso e preferência de caimento do cliente."],
  "Size guide OCR": ["Größentabellen-OCR", "OCR du guide des tailles", "OCR da tabela de medidas"],
  ": reads each product's real chart.": [": liest die echte Tabelle jedes Produkts.", " : lit le vrai tableau de chaque produit.", ": lê a tabela real de cada produto."],
  "Confidence level": ["Konfidenzniveau", "Niveau de confiance", "Nível de confiança"],
  ": the shopper knows how solid the recommendation is.": [": der Kunde weiß, wie belastbar die Empfehlung ist.", " : le client sait à quel point la recommandation est fiable.", ": o cliente sabe o quanto a recomendação é sólida."],
  "SIZE RECOMMENDATION": ["GRÖSSENEMPFEHLUNG", "RECOMMANDATION DE TAILLE", "RECOMENDAÇÃO DE TAMANHO"],
  "YOUR SIZE": ["DEINE GRÖSSE", "VOTRE TAILLE", "SEU TAMANHO"],
  "High confidence": ["Hohe Konfidenz", "Confiance élevée", "Alta confiança"],
  "Why size L?": ["Warum Größe L?", "Pourquoi la taille L ?", "Por que tamanho L?"],
  "At 181 cm with a regular fit, L gives the right length without pulling at the shoulders or chest.":
    ["Bei 181 cm und regulärer Passform gibt L die richtige Länge, ohne an Schultern oder Brust zu spannen.",
     "À 181 cm avec une coupe regular, le L donne la bonne longueur sans tirer aux épaules ni à la poitrine.",
     "Com 181 cm e caimento regular, o L dá o comprimento certo sem apertar nos ombros nem no peito."],

  // pilar 3 idiomas
  "Multi-language": ["Mehrsprachig", "Multilingue", "Multi-idioma"],
  "Your store sells abroad.": ["Dein Shop verkauft ins Ausland.", "Votre boutique vend à l'étranger.", "Sua loja vende para fora."],
  "So does the try-on.": ["Die Anprobe auch.", "L'essayage aussi.", "O provador também."],
  "The widget speaks your customer's language, not yours. Five languages included in every plan, nothing to configure.":
    ["Das Widget spricht die Sprache deines Kunden, nicht deine. Fünf Sprachen in jedem Plan enthalten, nichts zu konfigurieren.",
     "Le widget parle la langue de votre client, pas la vôtre. Cinq langues incluses dans tous les plans, rien à configurer.",
     "O widget fala o idioma do seu cliente, não o seu. Cinco idiomas incluídos em todos os planos, sem configurar nada."],
  "5 languages": ["5 Sprachen", "5 langues", "5 idiomas"],
  ": Spanish, English, Portuguese, German and French.": [": Spanisch, Englisch, Portugiesisch, Deutsch und Französisch.", " : espagnol, anglais, portugais, allemand et français.", ": espanhol, inglês, português, alemão e francês."],
  "Follows your store": ["Folgt deinem Shop", "Suit votre boutique", "Segue sua loja"],
  ": it uses the language Shopify already shows each visitor.": [": es nutzt die Sprache, die Shopify jedem Besucher bereits zeigt.", " : il utilise la langue que Shopify montre déjà à chaque visiteur.", ": usa o idioma que a Shopify já mostra para cada visitante."],
  "Fully translated": ["Vollständig übersetzt", "Entièrement traduit", "Totalmente traduzido"],
  ": every screen of the try-on and the sizing, not just the buttons.": [": jeder Bildschirm der Anprobe und der Größenempfehlung, nicht nur die Buttons.", " : chaque écran de l'essayage et de la taille, pas seulement les boutons.", ": cada tela do provador e do tamanho, não só os botões."],
  "SAME BUTTON, 5 LANGUAGES": ["DERSELBE BUTTON, 5 SPRACHEN", "MÊME BOUTON, 5 LANGUES", "MESMO BOTÃO, 5 IDIOMAS"],

  // cross-store
  "Fittly account · Cross-store": ["Fittly-Konto · Shop-übergreifend", "Compte Fittly · Multi-boutique", "Conta Fittly · Cross-store"],
  "One model. Every store.": ["Ein Modell. Alle Shops.", "Un modèle. Toutes les boutiques.", "Um modelo. Todas as lojas."],
  "The shopper saves their model and measurements once. At the next store running Fittly they try on without uploading anything again, and stores never see their photos or try-ons: their data stays fully private. A network effect that grows with every store.":
    ["Der Kunde speichert Modell und Maße einmal. Im nächsten Shop mit Fittly probiert er an, ohne erneut etwas hochzuladen, und Shops sehen nie seine Fotos oder Anproben: seine Daten bleiben vollständig privat. Ein Netzwerkeffekt, der mit jedem Shop wächst.",
     "Le client enregistre son modèle et ses mesures une fois. Dans la boutique suivante équipée de Fittly, il essaie sans rien renvoyer, et les boutiques ne voient jamais ses photos ni ses essayages : ses données restent totalement privées. Un effet réseau qui grandit avec chaque boutique.",
     "O cliente salva seu modelo e medidas uma vez. Na próxima loja com Fittly ele prova sem enviar nada de novo, e as lojas nunca veem suas fotos nem suas provas: os dados ficam totalmente privados. Um efeito de rede que cresce a cada loja."],
  "1 profile": ["1 Profil", "1 profil", "1 perfil"],
  "saved forever": ["für immer gespeichert", "enregistré pour toujours", "salvo para sempre"],
  "0 friction": ["0 Reibung", "0 friction", "0 atrito"],
  "at the 2nd store": ["im 2. Shop", "dans la 2e boutique", "na 2ª loja"],
  "and photos are deleted": ["und Fotos werden gelöscht", "et les photos sont supprimées", "e as fotos são apagadas"],

  // para tiendas
  "For stores": ["Für Shops", "Pour les boutiques", "Para lojas"],
  "Install it, done.": ["Installieren, fertig.", "Installez, c'est tout.", "Instalou, pronto."],
  "Native Shopify app": ["Native Shopify-App", "App Shopify native", "App nativo da Shopify"],
  "Installs from the App Store and shows on your PDP without touching code. Works with any theme.":
    ["Wird aus dem App Store installiert und erscheint auf deiner Produktseite, ohne Code anzufassen. Funktioniert mit jedem Theme.",
     "S'installe depuis l'App Store et s'affiche sur votre fiche produit sans toucher au code. Compatible avec tous les thèmes.",
     "Instala pela App Store e aparece na sua página de produto sem tocar em código. Funciona com qualquer tema."],
  "Control panel": ["Kontrollpanel", "Panneau de contrôle", "Painel de controle"],
  "Enable the try-on and size recommendation per product. Usage and conversion metrics in one dashboard.":
    ["Aktiviere Anprobe und Größenempfehlung pro Produkt. Nutzungs- und Conversion-Kennzahlen in einem Dashboard.",
     "Activez l'essayage et la recommandation de taille par produit. Métriques d'usage et de conversion dans un tableau de bord.",
     "Ative o provador e a recomendação de tamanho por produto. Métricas de uso e conversão em um dashboard."],
  "Efficient try-ons": ["Effiziente Anproben", "Essayages efficaces", "Provas eficientes"],
  "Standard try-ons are cached for 30 days: if another customer tries the same garment on the same model, the result comes from cache at no cost.":
    ["Standard-Anproben werden 30 Tage gecacht: probiert ein anderer Kunde dasselbe Kleidungsstück am selben Modell, kommt das Ergebnis kostenlos aus dem Cache.",
     "Les essayages standards sont mis en cache 30 jours : si un autre client essaie le même vêtement sur le même modèle, le résultat vient du cache sans frais.",
     "As provas padrão ficam em cache por 30 dias: se outro cliente provar a mesma peça no mesmo modelo, o resultado vem do cache sem custo."],

  // precios
  "Pricing": ["Preise", "Tarifs", "Preços"],
  "Free to install.": ["Kostenlos installieren.", "Installation gratuite.", "Instalação gratuita."],
  "Pay only for what they use.": ["Zahl nur, was sie nutzen.", "Ne payez que ce qu'ils utilisent.", "Pague só o que usarem."],
  "No quotas to guess: every plan pays per try-on used, and the monthly fee only lowers your rate. You set your own monthly spend cap.":
    ["Keine Kontingente zu raten: Jeder Plan zahlt pro genutzter Anprobe, und die Monatsgebühr senkt nur deinen Tarif. Dein monatliches Ausgabenlimit legst du selbst fest.",
     "Aucun quota à deviner : chaque plan paie par essayage utilisé, et l'abonnement mensuel ne fait que baisser votre tarif. Vous fixez vous-même votre plafond de dépenses mensuel.",
     "Sem cotas para adivinhar: todo plano paga por prova usada, e a taxa mensal só reduz sua tarifa. Você define seu próprio limite de gasto mensal."],
  "<b>Free to install</b>": ["<b>Kostenlos installieren</b>", "<b>Installation gratuite</b>", "<b>Instalação gratuita</b>"],
  "· pay per use": ["· Zahlung nach Nutzung", "· paiement à l'usage", "· pague pelo uso"],
  "$0.35 per try-on. No monthly fee and no limits: you only pay for what your shoppers use.":
    ["0,35 $ pro Anprobe. Keine Monatsgebühr und keine Limits: Du zahlst nur, was deine Kunden nutzen.",
     "0,35 $ par essayage. Sans frais mensuels ni limites : vous ne payez que ce que vos clients utilisent.",
     "US$ 0,35 por prova. Sem taxa mensal e sem limites: você paga só o que seus clientes usarem."],
  "Pay per try-on, no monthly fee": ["Zahlung pro Anprobe, keine Monatsgebühr", "Paiement par essayage, sans frais mensuels", "Pague por prova, sem taxa mensal"],
  "Try-on with the shopper's own photo": ["Anprobe mit dem eigenen Foto des Kunden", "Essayage avec la photo du client", "Prova com a foto do próprio cliente"],
  "8 body types to choose from": ["8 Körpertypen zur Auswahl", "8 morphologies au choix", "8 tipos de corpo para escolher"],
  "You set your own monthly spend cap": ["Du legst dein monatliches Ausgabenlimit fest", "Vous fixez votre plafond de dépenses mensuel", "Você define seu limite de gasto mensal"],
  "Install free": ["Kostenlos installieren", "Installer gratuitement", "Instalar grátis"],
  "$0.35 per try-on": ["0,35 $ pro Anprobe", "0,35 $ par essayage", "US$ 0,35 por prova"],
  "$0.22 per try-on, no limits.": ["0,22 $ pro Anprobe, ohne Limits.", "0,22 $ par essayage, sans limites.", "US$ 0,22 por prova, sem limites."],
  "Everything in Free, at a lower rate": ["Alles aus Free, zu einem günstigeren Tarif", "Tout ce qu'il y a dans Free, à un tarif plus bas", "Tudo do Free, com tarifa menor"],
  "AI size advice: free, never metered": ["KI-Größenberatung: gratis, nie abgerechnet", "Conseil de taille par IA : gratuit, jamais facturé", "Sugestão de tamanho por IA: grátis, nunca cobrada"],
  "Size guides read from your catalog": ["Größentabellen aus deinem Katalog gelesen", "Guides des tailles lus depuis votre catalogue", "Tabelas de medidas lidas do seu catálogo"],
  "Email support": ["E-Mail-Support", "Support par e-mail", "Suporte por e-mail"],
  "Start with Starter": ["Mit Starter beginnen", "Commencer avec Starter", "Começar com o Starter"],
  "$0.22 per try-on": ["0,22 $ pro Anprobe", "0,22 $ par essayage", "US$ 0,22 por prova"],
  "$0.18 per try-on, the lowest rate.": ["0,18 $ pro Anprobe, der günstigste Tarif.", "0,18 $ par essayage, le tarif le plus bas.", "US$ 0,18 por prova, a menor tarifa."],
  "Everything in Starter, lowest rate": ["Alles aus Starter, günstigster Tarif", "Tout ce qu'il y a dans Starter, tarif le plus bas", "Tudo do Starter, menor tarifa"],
  "Best value from ~250 try-ons/month": ["Bestes Preis-Leistungs-Verhältnis ab ~250 Anproben/Monat", "Meilleur rapport à partir de ~250 essayages/mois", "Melhor custo a partir de ~250 provas/mês"],
  "Priority support": ["Priorisierter Support", "Support prioritaire", "Suporte prioritário"],
  "Start with Growth": ["Mit Growth beginnen", "Commencer avec Growth", "Começar com o Growth"],
  "$0.18 per try-on": ["0,18 $ pro Anprobe", "0,18 $ par essayage", "US$ 0,18 por prova"],
  "📊 You start free paying per use; as your volume grows, the monthly fee lowers your per-try-on rate.":
    ["📊 Du startest kostenlos und zahlst nach Nutzung; wächst dein Volumen, senkt die Monatsgebühr deinen Tarif pro Anprobe.",
     "📊 Vous commencez gratuitement en payant à l'usage ; quand votre volume grandit, l'abonnement mensuel baisse votre tarif par essayage.",
     "📊 Você começa grátis pagando pelo uso; conforme seu volume cresce, a taxa mensal reduz sua tarifa por prova."],
  "/mo": ["/Mon.", "/mois", "/mês"],

  // FAQ
  "Frequently asked questions": ["Häufige Fragen", "Questions fréquentes", "Perguntas frequentes"],
  "Does the shopper have to upload a photo?": ["Muss der Kunde ein Foto hochladen?", "Le client doit-il envoyer une photo ?", "O cliente precisa enviar uma foto?"],
  "No, it's optional. They can choose among 8 reference models (slim, regular, athletic and plus-size, in male and female) or upload their own photo to see themselves. Own photos are deleted within 72 hours.":
    ["Nein, das ist optional. Er kann unter 8 Referenzmodellen wählen (slim, regular, athletic und Plus-Size, männlich und weiblich) oder ein eigenes Foto hochladen, um sich selbst zu sehen. Eigene Fotos werden binnen 72 Stunden gelöscht.",
     "Non, c'est facultatif. Il peut choisir parmi 8 modèles de référence (slim, regular, athletic et grande taille, homme et femme) ou envoyer sa propre photo pour se voir. Les photos personnelles sont supprimées sous 72 heures.",
     "Não, é opcional. Ele pode escolher entre 8 modelos de referência (slim, regular, athletic e plus size, masculino e feminino) ou enviar a própria foto para se ver. Fotos próprias são apagadas em até 72 horas."],
  "How realistic is the try-on?": ["Wie realistisch ist die Anprobe?", "L'essayage est-il réaliste ?", "Quão realista é a prova?"],
  "The AI dresses the real garment on the chosen body, respecting drape, length and proportion. It's not a flat overlay: it's a generation that reflects how it looks on.":
    ["Die KI zieht das echte Kleidungsstück dem gewählten Körper an und respektiert Fall, Länge und Proportion. Es ist kein flaches Overlay: Es ist eine Generierung, die zeigt, wie es getragen aussieht.",
     "L'IA habille le corps choisi avec le vrai vêtement, en respectant le tombé, la longueur et les proportions. Ce n'est pas un calque plat : c'est une génération qui reflète le rendu porté.",
     "A IA veste a peça real no corpo escolhido, respeitando caimento, comprimento e proporção. Não é uma sobreposição plana: é uma geração que reflete como fica vestida."],
  "Does it work with any Shopify theme?": ["Funktioniert es mit jedem Shopify-Theme?", "Fonctionne-t-il avec n'importe quel thème Shopify ?", "Funciona com qualquer tema da Shopify?"],
  "Yes. Fittly is a native Shopify app that installs from the App Store and shows on your product page without touching code, compatible with any theme.":
    ["Ja. Fittly ist eine native Shopify-App, die aus dem App Store installiert wird und ohne Code auf deiner Produktseite erscheint, kompatibel mit jedem Theme.",
     "Oui. Fittly est une app Shopify native qui s'installe depuis l'App Store et s'affiche sur votre fiche produit sans toucher au code, compatible avec tous les thèmes.",
     "Sim. A Fittly é um app nativo da Shopify que instala pela App Store e aparece na sua página de produto sem tocar em código, compatível com qualquer tema."],
  "How much does it cost?": ["Was kostet es?", "Combien ça coûte ?", "Quanto custa?"],
  "Installation is free and there is no required monthly fee: on the Free plan you pay $0.35 per try-on used, with a monthly spend cap you define. As your volume grows, Starter ($9/mo) lowers the rate to $0.22 and Growth ($19/mo) to $0.18, with no try-on limits. Size recommendation is never metered, and standard try-ons are cached, so repeated results are served at no extra cost.":
    ["Die Installation ist kostenlos und es gibt keine Pflicht-Monatsgebühr: Im Free-Plan zahlst du 0,35 $ pro genutzter Anprobe, mit einem Ausgabenlimit, das du festlegst. Wächst dein Volumen, senkt Starter (9 $/Mon.) den Tarif auf 0,22 $ und Growth (19 $/Mon.) auf 0,18 $, ohne Anprobe-Limits. Die Größenempfehlung wird nie abgerechnet, und Standard-Anproben werden gecacht, sodass wiederholte Ergebnisse ohne Zusatzkosten ausgeliefert werden.",
     "L'installation est gratuite et aucun abonnement mensuel n'est obligatoire : sur le plan Free vous payez 0,35 $ par essayage utilisé, avec un plafond de dépenses que vous définissez. Quand votre volume grandit, Starter (9 $/mois) baisse le tarif à 0,22 $ et Growth (19 $/mois) à 0,18 $, sans limite d'essayages. La recommandation de taille n'est jamais facturée, et les essayages standards sont mis en cache, donc les résultats répétés sont servis sans frais supplémentaires.",
     "A instalação é gratuita e não há taxa mensal obrigatória: no plano Free você paga US$ 0,35 por prova usada, com um limite de gasto que você define. Conforme seu volume cresce, o Starter (US$ 9/mês) reduz a tarifa para US$ 0,22 e o Growth (US$ 19/mês) para US$ 0,18, sem limite de provas. A recomendação de tamanho nunca é cobrada, e as provas padrão ficam em cache, então resultados repetidos são entregues sem custo extra."],
  "What languages is the try-on available in?": ["In welchen Sprachen gibt es die Anprobe?", "Dans quelles langues l'essayage est-il disponible ?", "Em quais idiomas está o provador?"],
  "The widget is available in Spanish, English, Portuguese, German and French, included in every plan. It automatically follows the language your Shopify store shows each visitor, so a shopper in Germany sees the try-on in German without you configuring anything.":
    ["Das Widget gibt es auf Spanisch, Englisch, Portugiesisch, Deutsch und Französisch, in jedem Plan enthalten. Es folgt automatisch der Sprache, die dein Shopify-Shop jedem Besucher zeigt, sodass ein Kunde in Deutschland die Anprobe auf Deutsch sieht, ohne dass du etwas konfigurierst.",
     "Le widget est disponible en espagnol, anglais, portugais, allemand et français, inclus dans tous les plans. Il suit automatiquement la langue que votre boutique Shopify montre à chaque visiteur, donc un client en Allemagne voit l'essayage en allemand sans que vous configuriez quoi que ce soit.",
     "O widget está em espanhol, inglês, português, alemão e francês, incluído em todos os planos. Ele segue automaticamente o idioma que sua loja Shopify mostra a cada visitante, então um cliente na Alemanha vê o provador em alemão sem você configurar nada."],
  "What about data privacy?": ["Wie steht es um den Datenschutz?", "Qu'en est-il de la confidentialité des données ?", "E a privacidade dos dados?"],
  "Shopper photos are automatically deleted after 72 hours and are never shared with the store. The cross-store account keeps only the model and measurements the user chooses to save, and they can export or delete them anytime.":
    ["Kundenfotos werden nach 72 Stunden automatisch gelöscht und nie mit dem Shop geteilt. Das shop-übergreifende Konto speichert nur Modell und Maße, die der Nutzer speichern möchte, und er kann sie jederzeit exportieren oder löschen.",
     "Les photos des clients sont automatiquement supprimées après 72 heures et ne sont jamais partagées avec la boutique. Le compte multi-boutique ne conserve que le modèle et les mesures que l'utilisateur choisit d'enregistrer, et il peut les exporter ou les supprimer à tout moment.",
     "As fotos dos clientes são apagadas automaticamente após 72 horas e nunca são compartilhadas com a loja. A conta cross-store guarda apenas o modelo e as medidas que o usuário decide salvar, e ele pode exportá-los ou apagá-los quando quiser."],

  // cierre + footer
  "Try it on your store today.": ["Probier es heute in deinem Shop.", "Essayez-le aujourd'hui dans votre boutique.", "Experimente hoje na sua loja."],
  "Install Fittly from the Shopify App Store and run your first try-on in minutes. Free to install, no monthly fee.":
    ["Installiere Fittly aus dem Shopify App Store und mach deine erste Anprobe in Minuten. Kostenlos installieren, keine Monatsgebühr.",
     "Installez Fittly depuis le Shopify App Store et lancez votre premier essayage en quelques minutes. Installation gratuite, sans frais mensuels.",
     "Instale a Fittly pela Shopify App Store e faça sua primeira prova em minutos. Instalação gratuita, sem taxa mensal."],
  "Install on Shopify →": ["Auf Shopify installieren →", "Installer sur Shopify →", "Instalar no Shopify →"],
  "Product": ["Produkt", "Produit", "Produto"],
  "Languages": ["Sprachen", "Langues", "Idiomas"],
  "Install</a>": ["Installieren</a>", "Installer</a>", "Instalar</a>"],
  "Virtual try-on guide (ES)": ["Anprobe-Guide (ES)", "Guide de l'essayage (ES)", "Guia do provador (ES)"],
  "Size guide (ES)": ["Größen-Guide (ES)", "Guide des tailles (ES)", "Guia de tamanhos (ES)"],
  "2026 comparison (ES)": ["Vergleich 2026 (ES)", "Comparatif 2026 (ES)", "Comparativo 2026 (ES)"],
  "© 2026 Fittly · Made for Shopify": ["© 2026 Fittly · Gemacht für Shopify", "© 2026 Fittly · Conçu pour Shopify", "© 2026 Fittly · Feito para Shopify"],
};

// ── selector de idioma para el nav ───────────────────────────────────────────
const TODOS = [["es", "/"], ["en", "/en"], ["de", "/de"], ["fr", "/fr"], ["pt", "/pt"]];
function selector(actual) {
  return TODOS.map(([code, ruta]) =>
    code === actual
      ? `<span style="font-size:13px;font-weight:800;color:#fff">${code.toUpperCase()}</span>`
      : `<a href="${ruta}" onclick="try{localStorage.setItem('fittly-lang','${code}')}catch(e){}" style="font-size:13px;font-weight:600;color:var(--faint)">${code.toUpperCase()}</a>`
  ).join('<span style="color:var(--faint-2);font-size:11px">·</span>');
}
const hreflangs = (indent = "  ") =>
  TODOS.map(([code, ruta]) => `${indent}<link rel="alternate" hreflang="${code}" href="${BASE}${ruta === "/" ? "/" : ruta}" />`).join("\n") +
  `\n${indent}<link rel="alternate" hreflang="x-default" href="${BASE}/" />`;

// detección automática: manda a cada navegador a su idioma
const AUTODETECT = `  <script>
    (function () {
      try {
        if (/bot|crawler|spider|crawling/i.test(navigator.userAgent)) return;
        var rutas = { es: "/", en: "/en", de: "/de", fr: "/fr", pt: "/pt" };
        var actual = document.documentElement.lang || "es";
        var pref = localStorage.getItem("fittly-lang");
        var idioma = pref || (navigator.language || "en").slice(0, 2).toLowerCase();
        if (!rutas[idioma]) idioma = "en";
        if (idioma !== actual) location.replace(rutas[idioma]);
      } catch (e) {}
    })();
  </script>`;

let fallos = 0;
const fuente = fs.readFileSync(path.join(ROOT, "en", "index.html"), "utf8");

// claves largas primero: evita que una cadena corta rompa una larga que la contiene
const claves = Object.keys(D).sort((a, b) => b.length - a.length);

for (const [lang, meta] of Object.entries(IDIOMAS)) {
  const i = ["de", "fr", "pt"].indexOf(lang);
  let s = fuente;

  for (const k of claves) {
    if (!s.includes(k)) { fallos++; console.log(`  [${lang}] NO ENCONTRADO en la fuente: ${k.slice(0, 60)}`); continue; }
    s = s.split(k).join(D[k][i]);
  }

  // head
  s = s.replace('<html lang="en">', `<html lang="${lang}">`);
  s = s.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  s = s.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${meta.metaDesc}" />`);
  s = s.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${meta.title}" />`);
  s = s.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${meta.ogDesc}" />`);
  s = s.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${BASE}${meta.ruta}" />`);
  s = s.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${BASE}${meta.ruta}" />`);
  s = s.replace(/(\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>)+/, "\n" + hreflangs());
  // Sin autodetección acá a propósito: solo la raíz "/" redirige. Un link
  // compartido a /de tiene que abrir en alemán aunque el navegador esté en otro
  // idioma, o compartir una versión concreta sería imposible.
  // selector de idioma
  s = s.replace(/<a href="\/" onclick="[^"]*">ES<\/a>/, selector(lang));
  // rutas de assets: la fuente EN ya usa /assets/ absolutas
  s = s.replace(/https:\/\/www\.fittlyapp\.com\/assets\/og-en\.jpg/g, `${BASE}/assets/og-en.jpg`);
  // JSON-LD: url del SoftwareApplication
  s = s.replace(`"url": "${BASE}/en"`, `"url": "${BASE}${meta.ruta}"`);

  fs.mkdirSync(path.join(ROOT, lang), { recursive: true });
  fs.writeFileSync(path.join(ROOT, lang, "index.html"), s);
  console.log(`  ${lang}/index.html generado (${(s.length / 1024).toFixed(0)} KB)`);
}

console.log(fallos === 0 ? "TODO OK — 0 fallos" : `${fallos} FALLOS`);
process.exit(fallos ? 1 : 0);
