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
  "Realistic try-on and exact sizing from each garment's real measurements, right on your product page. Fewer doubts, fewer returns, more carts.":
    ["Realistische Anprobe und genaue Größe nach den echten Maßen jedes Kleidungsstücks, direkt auf deiner Produktseite. Weniger Zweifel, weniger Retouren, mehr Warenkörbe.",
     "Essayage réaliste et taille exacte selon les vraies mesures de chaque vêtement, directement sur votre fiche produit. Moins de doutes, moins de retours, plus de paniers.",
     "Provador realista e tamanho exato com as medidas reais de cada peça, direto na sua página de produto. Menos dúvidas, menos devoluções, mais carrinhos."],
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

  // pilar 3: instalación
  "Zero setup": ["Keine Einrichtung", "Zéro configuration", "Zero configuração"],
  "One step from you.": ["Ein Schritt von dir.", "Une étape de votre part.", "Um passo seu."],
  "Fittly does the rest.": ["Den Rest macht Fittly.", "Fittly fait le reste.", "O resto a Fittly faz."],
  "No uploading size charts, no picking photos, no touching your theme. You enable the app in the theme editor, hit save, and Fittly handles the rest by reading your own catalog.":
    ["Keine Größentabellen hochladen, keine Fotos auswählen, kein Theme anfassen. Du aktivierst die App im Theme-Editor, speicherst, und Fittly erledigt den Rest, indem es deinen eigenen Katalog liest.",
     "Aucun guide des tailles à envoyer, aucune photo à choisir, aucun thème à toucher. Vous activez l'app dans l'éditeur de thème, vous enregistrez, et Fittly fait le reste en lisant votre propre catalogue.",
     "Sem subir tabelas de medidas, sem escolher fotos, sem mexer no tema. Você ativa o app no editor de temas, salva, e a Fittly faz o resto lendo o seu próprio catálogo."],
  "A single step": ["Ein einziger Schritt", "Une seule étape", "Um único passo"],
  ": enable the app embed and save. No code, no developer.": [": App-Embed aktivieren und speichern. Kein Code, kein Entwickler.", " : activez l'app embed et enregistrez. Sans code, sans développeur.", ": ativar o app embed e salvar. Sem código, sem desenvolvedor."],
  "Reads your size charts": ["Liest deine Größentabellen", "Lit vos guides des tailles", "Lê suas tabelas de medidas"],
  ": it finds them in your product photos and activates them on its own, so you never re-upload anything.":
    [": es findet sie in deinen Produktfotos und aktiviert sie von selbst, du lädst nie wieder etwas hoch.",
     " : il les trouve dans vos photos produit et les active tout seul, vous ne renvoyez jamais rien.",
     ": encontra nas suas fotos de produto e ativa sozinha, você nunca sobe nada de novo."],
  "Picks the best photo": ["Wählt das beste Foto", "Choisit la meilleure photo", "Escolhe a melhor foto"],
  ": it reviews each product's images and keeps the one that works for the try-on.":
    [": es prüft die Bilder jedes Produkts und behält das, was für die Anprobe funktioniert.",
     " : il examine les images de chaque produit et garde celle qui fonctionne pour l'essayage.",
     ": revisa as imagens de cada produto e fica com a que serve para a prova."],
  // video dentro del pilar de instalación
  "Video: how to install Fittly on a Shopify store": ["Video: So installierst du Fittly in einem Shopify-Shop", "Vidéo : comment installer Fittly sur une boutique Shopify", "Vídeo: como instalar a Fittly em uma loja Shopify"],
  "Play the installation video": ["Installationsvideo abspielen", "Lire la vidéo d'installation", "Reproduzir o vídeo de instalação"],
  "▶ How to install · 36 s": ["▶ So wird installiert · 36 s", "▶ Comment l'installer · 36 s", "▶ Como instalar · 36 s"],
  "The video loads from YouTube only when you hit play.":
    ["Auf Englisch gesprochen, mit Untertiteln. Wird erst von YouTube geladen, wenn du auf Play drückst.",
     "Narré en anglais, avec sous-titres. Ne se charge depuis YouTube que lorsque vous appuyez sur lecture.",
     "Narrado em inglês, com legendas. Só carrega do YouTube quando você dá play."],

  // analíticas de demanda
  "Demand analytics": ["Nachfrage-Analytics", "Analytique de la demande", "Analytics de demanda"],
  ">Analytics<": [">Analytics<", ">Analytique<", ">Analytics<"],
  "What you sold is not<br />what they asked for.": ["Was du verkauft hast, ist nicht<br />was sie gebraucht haben.", "Ce que vous avez vendu n'est pas<br />ce qu'ils ont demandé.", "O que você vendeu não é<br />o que pediram."],
  "Your sales data comes filtered by your own stock. If you are always out of XL, your sales say nobody wears XL, and you restock what was already sitting there. Fittly records the size each shopper actually needed, available or not.":
    ["Deine Verkaufsdaten sind durch deinen eigenen Bestand gefiltert. Wenn XL immer ausverkauft ist, sagen deine Verkäufe, dass niemand XL trägt, und du bestellst wieder das nach, was ohnehin liegen blieb. Fittly erfasst die Größe, die jeder Kunde wirklich brauchte, verfügbar oder nicht.",
     "Vos données de vente sont filtrées par votre propre stock. Si vous êtes toujours en rupture de XL, vos ventes disent que personne ne porte du XL, et vous réapprovisionnez ce qui restait déjà. Fittly enregistre la taille dont chaque client avait réellement besoin, disponible ou non.",
     "Seus dados de venda vêm filtrados pelo seu próprio estoque. Se você está sempre sem XL, suas vendas dizem que ninguém usa XL, e você repõe o que já estava parado. A Fittly registra o tamanho que cada cliente realmente precisava, disponível ou não."],
  "PANEL 1": ["PANEL 1", "PANNEAU 1", "PAINEL 1"],
  "PANEL 2": ["PANEL 2", "PANNEAU 2", "PAINEL 2"],
  "Which sizes get asked for, and on which products": ["Welche Größen gefragt sind, und bei welchen Produkten", "Quelles tailles sont demandées, et sur quels produits", "Quais tamanhos pedem, e em quais produtos"],
  "Your store's size curve straight from the real recommendations, by scale and by product. Not what sold: what your shoppers are.":
    ["Die Größenkurve deines Shops direkt aus den echten Empfehlungen, nach Skala und nach Produkt. Nicht was verkauft wurde: was deine Kunden sind.",
     "La courbe des tailles de votre boutique directement issue des recommandations réelles, par échelle et par produit. Pas ce qui s'est vendu : ce que sont vos clients.",
     "A curva de tamanhos da sua loja direto das recomendações reais, por escala e por produto. Não o que vendeu: o que seus clientes são."],
  "How many times you did not have it": ["Wie oft du sie nicht hattest", "Combien de fois vous ne l'aviez pas", "Quantas vezes você não tinha"],
  "On which products, and how many times, the ideal size was out of stock and Fittly offered the closest one instead. That is demand that leaves no trace anywhere else, because nothing happened to record.":
    ["Bei welchen Produkten und wie oft die ideale Größe ausverkauft war und Fittly stattdessen die nächstliegende angeboten hat. Das ist Nachfrage, die sonst nirgends eine Spur hinterlässt, weil nichts passiert ist, das man erfassen könnte.",
     "Sur quels produits, et combien de fois, la taille idéale était en rupture et Fittly a proposé la plus proche à la place. C'est une demande qui ne laisse de trace nulle part ailleurs, parce qu'il ne s'est rien passé à enregistrer.",
     "Em quais produtos, e quantas vezes, o tamanho ideal estava esgotado e a Fittly ofereceu o mais próximo. É demanda que não deixa rastro em nenhum outro lugar, porque não chegou a acontecer nada para registrar."],
  "And the products that break the pattern are worth watching: if one garment consistently comes back a size up from the rest of its scale, it <b>runs small</b>. That is usually the piece quietly generating your returns.":
    ["Und die Produkte, die aus dem Muster fallen, lohnen einen Blick: kommt ein Kleidungsstück immer eine Größe höher zurück als der Rest seiner Skala, <b>fällt es klein aus</b>. Das ist meist das Teil, das im Stillen deine Retouren erzeugt.",
     "Et les produits qui sortent du schéma méritent votre attention : si un vêtement revient toujours une taille au-dessus du reste de son échelle, il <b>taille petit</b>. C'est souvent la pièce qui génère vos retours en silence.",
     "E vale a pena olhar os produtos que fogem do padrão: se uma peça volta sempre um tamanho acima do resto da sua escala, ela <b>veste pequeno</b>. Essa costuma ser a que gera suas devoluções em silêncio."],

  // gráfico de demanda
  "ILLUSTRATIVE EXAMPLE": ["ILLUSTRATIVES BEISPIEL", "EXEMPLE ILLUSTRATIF", "EXEMPLO ILUSTRATIVO"],
  "What you sold": ["Was du verkauft hast", "Ce que vous avez vendu", "O que você vendeu"],
  "What they asked for": ["Was gefragt war", "Ce qu'ils ont demandé", "O que pediram"],
  "the missing size": ["die fehlende Größe", "la taille qui manque", "o tamanho que falta"],
  "Read through sales, your top size is M. Read through demand, it is <b>XL</b>: you never had it, so whoever needed it took an M or an L, or did not buy at all. That gap is what gets restocked wrong season after season.":
    ["Nach den Verkäufen gelesen ist deine Top-Größe M. Nach der Nachfrage gelesen ist es <b>XL</b>: du hattest sie nie, also nahm wer sie brauchte ein M oder ein L, oder kaufte gar nicht. Diese Lücke wird Saison für Saison falsch nachbestellt.",
     "Lu à travers les ventes, votre taille phare est le M. Lu à travers la demande, c'est le <b>XL</b> : vous ne l'aviez jamais, donc celui qui en avait besoin a pris un M ou un L, ou n'a pas acheté. C'est cet écart qui est mal réapprovisionné saison après saison.",
     "Lido pelas vendas, seu tamanho campeão é o M. Lido pela demanda, é o <b>XL</b>: você nunca o teve, então quem precisava levou um M ou um L, ou não comprou. Essa lacuna é o que se repõe errado temporada após temporada."],

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
  // encabezados del footer en columnas
  "Guides": ["Guides", "Guides", "Guias"],
  "<b>15 free try-ons</b> in the theme editor · before you pick a plan":
    ["<b>15 kostenlose Anproben</b> im Theme-Editor · bevor du einen Plan wählst",
     "<b>15 essayages gratuits</b> dans l'éditeur de thème · avant de choisir un plan",
     "<b>15 provas grátis</b> no editor de temas · antes de escolher um plano"],
  "<strong>Try it right there</strong>: 15 free try-ons on your own products, inside the editor and before you pick a plan. Only you see them.":
    ["<strong>Teste es direkt dort</strong>: 15 kostenlose Anproben an deinen eigenen Produkten, im Editor und bevor du einen Plan wählst. Nur du siehst sie.",
     "<strong>Essayez sur place</strong> : 15 essayages gratuits sur vos propres produits, dans l'éditeur et avant de choisir un plan. Vous seul les voyez.",
     "<strong>Teste ali mesmo</strong>: 15 provas grátis nos seus próprios produtos, dentro do editor e antes de escolher um plano. Só você as vê."],
  "AI size recommendation, never metered": ["KI-Größenempfehlung, nie abgerechnet", "Recommandation de taille par IA, jamais facturée", "Recomendação de tamanho com IA, nunca cobrada"],
  "Best value from ~70 try-ons/month": ["Bester Wert ab ~70 Anproben/Monat", "Meilleur rapport dès ~70 essayages/mois", "Melhor valor a partir de ~70 provas/mês"],
  ">FAQ<": [">Häufige Fragen<", ">Questions fréquentes<", ">Perguntas frequentes<"],
  // Estas dos apuntan a guias en ingles: se traduce la etiqueta y se marca el
  // idioma de destino, igual que se hace con las guias en español.
  ">How to install<": [">Installationsanleitung (EN)<", ">Comment installer (EN)<", ">Como instalar (EN)<"],
  ">Size curve<": [">Größenkurve (EN)<", ">Courbe des tailles (EN)<", ">Curva de tamanhos (EN)<"],
  "$0.35 per try-on. No monthly fee and no limits: you only pay for what your shoppers use.":
    ["0,35 $ pro Anprobe. Keine Monatsgebühr und keine Limits: Du zahlst nur, was deine Kunden nutzen.",
     "0,35 $ par essayage. Sans frais mensuels ni limites : vous ne payez que ce que vos clients utilisent.",
     "US$ 0,35 por prova. Sem taxa mensal e sem limites: você paga só o que seus clientes usarem."],
  "Try-on with the shopper's own photo": ["Anprobe mit dem eigenen Foto des Kunden", "Essayage avec la photo du client", "Prova com a foto do próprio cliente"],
  "8 body types to choose from": ["8 Körpertypen zur Auswahl", "8 morphologies au choix", "8 tipos de corpo para escolher"],
  "You set your own monthly spend cap": ["Du legst dein monatliches Ausgabenlimit fest", "Vous fixez votre plafond de dépenses mensuel", "Você define seu limite de gasto mensal"],
  "Install free": ["Kostenlos installieren", "Installer gratuitement", "Instalar grátis"],
  "$0.35 per try-on": ["0,35 $ pro Anprobe", "0,35 $ par essayage", "US$ 0,35 por prova"],
  "$0.22 per try-on, no limits.": ["0,22 $ pro Anprobe, ohne Limits.", "0,22 $ par essayage, sans limites.", "US$ 0,22 por prova, sem limites."],
  "Everything in Free, at a lower rate": ["Alles aus Free, zu einem günstigeren Tarif", "Tout ce qu'il y a dans Free, à un tarif plus bas", "Tudo do Free, com tarifa menor"],
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
  // OJO: la clave lleva las etiquetas a propósito. Como "/mo" suelto, el
  // reemplazo global mordía dentro de /assets/modelo-hombre.webp.
  ">/mo<": [">/Mon.<", ">/mois<", ">/mês<"],

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
  "Installing is free and there is no required monthly fee. Before you pick a plan you try Fittly with 15 free try-ons on your own products, inside the theme editor. Once you activate a plan, on Free you pay $0.35 per try-on used, with a monthly spend cap you define. As your volume grows, Starter ($9/mo) lowers the rate to $0.22 and Growth ($19/mo) to $0.18, with no try-on limits. Size recommendation is included on every plan, Free included, and is never metered: advising a size never costs you a generation. Standard try-ons are also cached, so repeated results are served at no extra cost.":
    ["Die Installation ist kostenlos und es gibt keine Pflicht-Monatsgebühr. Bevor du einen Plan wählst, testest du Fittly mit 15 kostenlosen Anproben an deinen eigenen Produkten, direkt im Theme-Editor. Sobald du einen Plan aktivierst, zahlst du im Free-Plan 0,35 $ pro genutzter Anprobe, mit einem Ausgabenlimit, das du festlegst. Wächst dein Volumen, senkt Starter (9 $/Mon.) den Tarif auf 0,22 $ und Growth (19 $/Mon.) auf 0,18 $, ohne Anprobe-Limits. Die Größenempfehlung ist in jedem Plan enthalten, auch im Free-Plan, und wird nie abgerechnet: eine Größenempfehlung kostet dich nie eine Generierung. Standard-Anproben werden zudem gecacht, sodass wiederholte Ergebnisse ohne Zusatzkosten ausgeliefert werden.",
     "L'installation est gratuite et aucun abonnement mensuel n'est obligatoire. Avant de choisir un plan, vous essayez Fittly avec 15 essayages gratuits sur vos propres produits, directement dans l'éditeur de thème. Une fois un plan activé, sur le plan Free vous payez 0,35 $ par essayage utilisé, avec un plafond de dépenses que vous définissez. Quand votre volume grandit, Starter (9 $/mois) baisse le tarif à 0,22 $ et Growth (19 $/mois) à 0,18 $, sans limite d'essayages. La recommandation de taille est incluse dans tous les plans, Free compris, et n'est jamais facturée : conseiller une taille ne vous coûte jamais une génération. Les essayages standards sont en plus mis en cache, donc les résultats répétés sont servis sans frais supplémentaires.",
     "A instalação é gratuita e não há taxa mensal obrigatória. Antes de escolher um plano você testa a Fittly com 15 provas grátis nos seus próprios produtos, dentro do editor de temas. Ao ativar um plano, no Free você paga US$ 0,35 por prova usada, com um limite de gasto que você define. Conforme seu volume cresce, o Starter (US$ 9/mês) reduz a tarifa para US$ 0,22 e o Growth (US$ 19/mês) para US$ 0,18, sem limite de provas. A recomendação de tamanho está incluída em todos os planos, Free incluído, e nunca é cobrada por uso: sugerir um tamanho nunca gasta uma geração. As provas padrão ainda ficam em cache, então resultados repetidos são entregues sem custo extra."],
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

  // FAQ nuevas (comparación y entidad): las dos consultas que las IA hacen y
  // que el sitio no respondía.
  "How is Fittly different from other virtual try-on apps?":
    ["Was unterscheidet Fittly von anderen Anprobe-Apps?",
     "Qu'est-ce qui différencie Fittly des autres apps d'essayage virtuel ?",
     "O que diferencia a Fittly de outros apps de provador virtual?"],
  "The try-on and the size recommendation are the same widget, not a main feature plus an extra. The shopper sees the garment on and gets a size computed from that garment's real measurements in the same flow. Size recommendation is also included on every plan and never metered, so advising a size never costs you a generation, the install is one step and you can try it with 15 free try-ons in the editor before picking a plan because Fittly scans your catalog on its own, and the widget ships in five languages. There is a comparison against the other apps in the category, with Shopify App Store data, at /en/shopify-virtual-try-on-apps-compared.":
    ["Anprobe und Größenempfehlung sind dasselbe Widget, nicht eine Hauptfunktion plus ein Extra. Der Kunde sieht das Kleidungsstück getragen und bekommt im selben Ablauf eine Größe, die aus den echten Maßen genau dieses Teils berechnet wird. Die Größenempfehlung ist außerdem in jedem Plan enthalten und wird nie abgerechnet, eine Größenempfehlung kostet dich also nie eine Generierung, die Installation ist ein Schritt und du kannst sie vor der Planwahl mit 15 kostenlosen Anproben im Editor testen, weil Fittly deinen Katalog selbst scannt, und das Widget gibt es in fünf Sprachen. Ein Vergleich mit den anderen Apps der Kategorie, mit Daten aus dem Shopify App Store, steht unter /en/shopify-virtual-try-on-apps-compared (auf Englisch).",
     "L'essayage et la recommandation de taille sont le même widget, pas une fonction principale plus un extra. Le client voit le vêtement porté et reçoit dans le même parcours une taille calculée à partir des mesures réelles de ce vêtement précis. La recommandation de taille est en plus incluse dans tous les plans et n'est jamais facturée, conseiller une taille ne vous coûte donc jamais une génération, l'installation tient en une étape et vous pouvez l'essayer avec 15 essayages gratuits dans l'éditeur avant de choisir un plan car Fittly scanne votre catalogue tout seul, et le widget existe en cinq langues. Un comparatif avec les autres apps de la catégorie, avec les données du Shopify App Store, se trouve sur /en/shopify-virtual-try-on-apps-compared (en anglais).",
     "O provador e a recomendação de tamanho são o mesmo widget, não uma função principal mais um extra. O cliente vê a peça vestida e recebe no mesmo fluxo um tamanho calculado com as medidas reais daquela peça. A recomendação de tamanho ainda está incluída em todos os planos e nunca é cobrada por uso, então sugerir um tamanho nunca gasta uma geração, a instalação é de um passo e você pode testá-la com 15 provas grátis no editor antes de escolher um plano porque a Fittly escaneia seu catálogo sozinha, e o widget vem em cinco idiomas. Há um comparativo com os outros apps da categoria, com os dados da Shopify App Store, em /en/shopify-virtual-try-on-apps-compared (em inglês)."],
  "Who is behind Fittly?":
    ["Wer steckt hinter Fittly?", "Qui est derrière Fittly ?", "Quem está por trás da Fittly?"],
  "Fittly SpA, a Chilean company founded in May 2026. Fittly is its only product. It is a new app: as of August 2026 it has 1 public review on the Shopify App Store, at 5 stars. We do not publish conversion-lift percentages because we have not measured them in a controlled way yet.":
    ["Fittly SpA, ein chilenisches Unternehmen, gegründet im Mai 2026. Fittly ist sein einziges Produkt. Es ist eine neue App: Stand August 2026 gibt es 1 öffentliche Bewertung im Shopify App Store, mit 5 Sternen. Wir veröffentlichen keine Prozentzahlen zur Conversion-Steigerung, weil wir sie noch nicht kontrolliert gemessen haben.",
     "Fittly SpA, une entreprise chilienne fondée en mai 2026. Fittly est son seul produit. C'est une app récente : en août 2026 elle compte 1 avis public sur le Shopify App Store, noté 5 étoiles. Nous ne publions pas de pourcentages de hausse de conversion, car nous ne les avons pas encore mesurés de façon contrôlée.",
     "Fittly SpA, uma empresa chilena fundada em maio de 2026. A Fittly é seu único produto. É um app novo: em agosto de 2026 tem 1 avaliação pública na Shopify App Store, com 5 estrelas. Não publicamos percentuais de aumento de conversão porque ainda não os medimos de forma controlada."],

  // featureList del schema: lista de capacidades lista para extraer
  "AI virtual try-on on the shopper's own photo or on 8 body types":
    ["KI-Anprobe auf dem eigenen Foto des Kunden oder auf 8 Körpertypen",
     "Essayage virtuel par IA sur la photo du client ou sur 8 morphologies",
     "Provador virtual com IA na foto do próprio cliente ou em 8 tipos de corpo"],
  "Size recommendation computed from each garment's real measurements, included on every plan and never metered":
    ["Größenempfehlung aus den echten Maßen jedes Kleidungsstücks, in jedem Plan enthalten und nie abgerechnet",
     "Recommandation de taille calculée sur les mesures réelles de chaque vêtement, incluse dans tous les plans et jamais facturée",
     "Recomendação de tamanho calculada com as medidas reais de cada peça, incluída em todos os planos e nunca cobrada por uso"],
  "One-step install: enable the app embed and try it with 15 free try-ons in the editor before picking a plan":
    ["Installation in einem Schritt: App-Embed aktivieren und vor der Planwahl mit 15 kostenlosen Anproben im Editor testen",
     "Installation en une étape : activez l'app embed et essayez avec 15 essayages gratuits dans l'éditeur avant de choisir un plan",
     "Instalação em um passo: ative o app embed e teste com 15 provas grátis no editor antes de escolher um plano"],
  "Automatic reading of size charts already inside the product photos":
    ["Automatisches Auslesen der Größentabellen, die schon in den Produktfotos stecken",
     "Lecture automatique des guides de tailles déjà présents dans les photos produit",
     "Leitura automática das tabelas de medidas que já estão dentro das fotos de produto"],
  "Size demand analytics, including the ideal size that was out of stock":
    ["Analyse der Größennachfrage, inklusive der Wunschgröße, die nicht auf Lager war",
     "Analyse de la demande par taille, y compris la taille idéale en rupture de stock",
     "Analítica de demanda de tamanhos, incluindo o tamanho ideal que estava sem estoque"],
  "Widget in Spanish, English, Portuguese, German and French, following the store's language":
    ["Widget auf Spanisch, Englisch, Portugiesisch, Deutsch und Französisch, der Shop-Sprache folgend",
     "Widget en espagnol, anglais, portugais, allemand et français, suivant la langue de la boutique",
     "Widget em espanhol, inglês, português, alemão e francês, seguindo o idioma da loja"],
  "Shopper photos deleted within 72 hours, never shared with the store":
    ["Kundenfotos werden binnen 72 Stunden gelöscht und nie mit dem Shop geteilt",
     "Photos des clients supprimées sous 72 heures, jamais partagées avec la boutique",
     "Fotos dos clientes apagadas em até 72 horas, nunca compartilhadas com a loja"],

  // cierre + footer
  "Try it on your store today.": ["Probier es heute in deinem Shop.", "Essayez-le aujourd'hui dans votre boutique.", "Experimente hoje na sua loja."],
  "Install Fittly from the Shopify App Store and run your first try-on in minutes. Free to install, no monthly fee.":
    ["Installiere Fittly aus dem Shopify App Store und mach deine erste Anprobe in Minuten. Kostenlos installieren, keine Monatsgebühr.",
     "Installez Fittly depuis le Shopify App Store et lancez votre premier essayage en quelques minutes. Installation gratuite, sans frais mensuels.",
     "Instale a Fittly pela Shopify App Store e faça sua primeira prova em minutos. Instalação gratuita, sem taxa mensal."],
  "Install on Shopify →": ["Auf Shopify installieren →", "Installer sur Shopify →", "Instalar no Shopify →"],
  "Product": ["Produkt", "Produit", "Produto"],
  ">Setup<": [">Einrichtung<", ">Installation<", ">Instalação<"],
  "Install</a>": ["Installieren</a>", "Installer</a>", "Instalar</a>"],
  "Virtual try-on guide (ES)": ["Anprobe-Guide (ES)", "Guide de l'essayage (ES)", "Guia do provador (ES)"],
  "Size guide (ES)": ["Größen-Guide (ES)", "Guide des tailles (ES)", "Guia de tamanhos (ES)"],
  "2026 app comparison": ["App-Vergleich 2026 (EN)", "Comparatif des apps 2026 (EN)", "Comparativo de apps 2026 (EN)"],
  "© 2026 Fittly · Made for Shopify": ["© 2026 Fittly · Gemacht für Shopify", "© 2026 Fittly · Conçu pour Shopify", "© 2026 Fittly · Feito para Shopify"],
};

// ── selector de idioma para el nav (menú compacto) ──────────────────────────
const TODOS = [["es", "/", "Español"], ["en", "/en", "English"], ["de", "/de", "Deutsch"], ["fr", "/fr", "Français"], ["pt", "/pt", "Português"]];
function selector(actual) {
  const items = TODOS.map(([c, r, n]) =>
    `          <a href="${r}"${c === actual ? ' class="on"' : ""} onclick="try{localStorage.setItem('fittly-lang','${c}')}catch(e){}">${n}</a>`
  ).join("\n");
  return `<div class="langsel">
          <button type="button" class="langsel-btn" aria-label="Cambiar idioma">🌐 ${actual.toUpperCase()} <span class="chev">▾</span></button>
          <div class="langsel-menu">
${items}
          </div>
        </div>`;
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
  // selector de idioma: reemplaza el bloque completo del componente
  const iSel = s.indexOf('<div class="langsel">');
  const fSel = s.indexOf("</div>", s.indexOf('class="langsel-menu"')) + "</div>".length;
  const cierre = s.indexOf("</div>", fSel) + "</div>".length;
  if (iSel === -1) { fallos++; console.log(`  [${lang}] no se encontró el selector en la fuente`); }
  else s = s.slice(0, iSel) + selector(lang) + s.slice(cierre);
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
