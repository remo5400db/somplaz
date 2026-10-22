// Build script: generates the static website (site/) from the design source (src/).
// Run: node build.js
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'site');
const DOMAIN = 'https://chesa-somplaz.ch';

// ---------- 1. Texts from the design source ----------
const main = fs.readFileSync(path.join(SRC, 'Main.dc.html'), 'utf8');
const scriptSrc = main.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
class DCLogic { constructor(p) { this.props = p || {}; } setState() {} }
const Component = new Function('DCLogic', scriptSrc + '\nreturn Component;')(DCLogic);
const TEXTS = new Component({}).texts();

// Images: blob ids from the design editor -> local files
const IMG = {
  '/_blob/49048cf31db27c4afcbf58036d6eabdf': 'img/hero-silsersee.jpg',
  '/_blob/536f17e277a8257cf305326e2fe7cb15': 'img/st-moritz-dorf.jpg',
  '/_blob/a7db435050e95305e8117135cb6ea25a': 'img/langlauf.jpg',
  '/_blob/7d5edb77df85a3ed61ef47d5e530c75a': 'img/piste-corviglia.jpg',
  '/_blob/b1711a7eb60a1bcefd72c04cac01f2b0': 'img/abendstimmung.jpg',
  '/_blob/6607d9a383b98d8b3132bea778274854': 'img/white-turf.jpg',
  '/_blob/978fc29e3a16e1e9269c35e8b9f482fe': 'img/engadin-airport.jpg',
  '/_blob/4afb7bdf7ec1ac731b087ecfae47ec09': 'img/winterreifen.jpg',
  '/_blob/130ade634ed0d60f26c55972d34849a5': 'img/rhaetische-bahn.jpg',
  '/_blob/c15d97683232ee879fb306c9dd11e2ea': 'img/winterwandern.jpg',
  '/_blob/4d6a196a9ae86d033418a413b3e25fb5': 'img/skischule.jpg',
  '/_blob/34f8c2af12141af14c5b8fad4b42c651': 'img/vanessa.jpg',
  '/_blob/c8e82a6eaaa27a9109f5bcbf1314cec2': 'img/wohnung-kueche.jpg',
  '/_blob/820de93755cca8b66f1b41ac91393657': 'img/wohnung-schlafzimmer3.jpg',
  '/_blob/64e13dc22b33e73cca2749ff1e7787c5': 'img/wohnung-bad.jpg',
  '/_blob/03ea634d2e8491620385622a4bfce219': 'img/wohnung-dusche.jpg',
  '/_blob/5318799f00f3bbaf9f0d87a6b4d11ea9': 'img/wohnbereich-cheminee-v3.jpg',
};
const img = (blob) => IMG[blob] || blob;

// ---------- 2. Floor plans (inner markup of the design artboards) ----------
function plan(lang) {
  const f = fs.readFileSync(path.join(SRC, `Grundriss_${lang.toUpperCase()}.dc.html`), 'utf8');
  const start = f.indexOf('</helmet>') + '</helmet>'.length;
  const end = f.indexOf('</x-dc>');
  return f.slice(start, end).trim();
}

// ---------- 3. CSS (from the design source, plus static-site additions) ----------
let css = main.match(/<helmet>[\s\S]*?<style>([\s\S]*?)<\/style>/)[1];
css = css.replace(/body\{margin:0;/, 'body{margin:0;-webkit-font-smoothing:antialiased;');
css += `
@font-face{font-family:Manrope;font-style:normal;font-weight:400 800;font-display:swap;src:url(/fonts/manrope-latin-wght-normal.woff2) format("woff2-variations");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:Manrope;font-style:normal;font-weight:400 800;font-display:swap;src:url(/fonts/manrope-latin-ext-wght-normal.woff2) format("woff2-variations");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
.burger{display:none;background:none;border:1px solid #cfd6d2;border-radius:8px;width:44px;height:40px;cursor:pointer;align-items:center;justify-content:center}
.mobnav{display:none;background:#fff;border-bottom:1px solid #e3e7e4}
.mobnav a{display:block;padding:14px 24px;text-decoration:none;color:#1b1f1e;font-weight:600;border-top:1px solid #eef1ef}
.mobnav.open{display:block}
.langs a{text-decoration:none}
picture{display:block;width:100%}
.plan-wrap{position:relative;width:100%;overflow:hidden;border-radius:12px;border:1px solid #e3e7e4;background:#FBF9F4;-webkit-overflow-scrolling:touch}
.plan-scale{transform-origin:top left;width:980px}
.wa-float{position:fixed;right:20px;bottom:20px;z-index:20;width:56px;height:56px;border-radius:50%;background:#25D366;color:#0b2a16;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.2)}
*{min-width:0}
.card,.tip,.faq,.li,.lead,.step,.table td,details,summary,.mobnav a{overflow-wrap:anywhere;word-break:normal}
.li{align-items:flex-start}
.tip a,.faq a,.card a{overflow-wrap:anywhere}
@media (max-width:760px){.burger{display:flex}.hero-grid>picture{order:-1}.table td:first-child{width:40%}.price{font-size:32px}
.hdr-cta{display:none !important}.langs{gap:4px}.lang{min-width:34px;padding:6px 7px;font-size:12px;min-height:36px}.brand{font-size:16px !important}
.li span:first-child{flex:1 1 auto}.li span+span{text-align:right}}
`;

// ---------- 4. Helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const li = (arr) => arr.map((x) => `<li class="li"><span>${esc(x)}</span></li>`).join('');
const liKV = (arr) => arr.map((x) => `<li class="li"><span>${esc(x.n)}</span><span>${esc(x.v)}</span></li>`).join('');
const ext = (u, w) => (u ? ` · <a href="${esc(u)}" target="_blank" rel="noopener">${esc(w)}</a>` : '');
const svgChat = (size) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L4 21l1.4-4.6A8.5 8.5 0 1 1 21 12z"></path></svg>`;

const LANGS = { de: { dir: '', hreflang: 'de', extra: ['de-CH', 'de-DE', 'de-AT'], ogLocale: 'de_CH' }, en: { dir: 'en/', hreflang: 'en', extra: ['en-GB'], ogLocale: 'en_GB' }, it: { dir: 'it/', hreflang: 'it', extra: ['it-IT', 'it-CH'], ogLocale: 'it_IT' } };
const HREFLANGS = Object.values(LANGS).flatMap((v) => [v.hreflang, ...v.extra].map((h) => [h, v.dir]));
const META = {
  de: { title: 'Ferienwohnung St. Moritz Dorf – Saisonmiete Winter 2026/27', desc: "4.5-Zimmer-Ferienwohnung in St. Moritz Dorf, 113 m², bis 6 Personen, Tiefgarage, im Zentrum von St. Moritz Dorf. Saisonmiete Winter 2026/27 CHF 18'000." },
  en: { title: 'Holiday apartment St. Moritz Dorf – seasonal let winter 2026/27', desc: '4.5-room holiday apartment in St. Moritz Dorf, 113 m², up to 6 guests, garage, in the centre of St. Moritz Dorf. Seasonal let winter 2026/27, CHF 18,000.' },
  it: { title: 'Appartamento di vacanza St. Moritz Dorf – affitto stagionale inverno 2026/27', desc: "Appartamento di 4,5 locali a St. Moritz Dorf, 113 m², fino a 6 persone, garage, nel centro di St. Moritz Dorf. Affitto stagionale inverno 2026/27, CHF 18'000." },
};
const WA = '41794191462';

function jsonLd(lang, t) {
  const url = DOMAIN + '/' + LANGS[lang].dir;
  const d = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VacationRental', '@id': url + '#rental', name: 'Chesa Somplaz – ' + t.navApt + ' St. Moritz Dorf', url, inLanguage: lang, telephone: '+41794191462', email: 'booking@chesa-somplaz.ch',
        description: t.aptLead,
        address: { '@type': 'PostalAddress', streetAddress: 'Via Somplaz 10', postalCode: '7500', addressLocality: 'St. Moritz', addressRegion: 'GR', addressCountry: 'CH' },
        geo: { '@type': 'GeoCoordinates', latitude: 46.4979, longitude: 9.8355 },
        numberOfRooms: 4.5, numberOfBedrooms: 3, numberOfBathroomsTotal: 2,
        floorSize: { '@type': 'QuantitativeValue', value: 113, unitCode: 'MTK' },
        occupancy: { '@type': 'QuantitativeValue', maxValue: 6 },
        checkinTime: '16:00', checkoutTime: '10:00', petsAllowed: 'on request',
        containsPlace: [{ '@type': 'Accommodation', name: t.aptSleep[0], bed: { '@type': 'BedDetails', typeOfBed: 'double 160 cm', numberOfBeds: 1 } }, { '@type': 'Accommodation', name: t.aptSleep[1], bed: { '@type': 'BedDetails', typeOfBed: 'bunk bed 2 x 90 cm', numberOfBeds: 2 } }, { '@type': 'Accommodation', name: t.aptSleep[2], bed: { '@type': 'BedDetails', typeOfBed: 'double 180 cm', numberOfBeds: 1 } }],
        amenityFeature: t.aptEquip.map((n) => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })),
        image: [DOMAIN + '/img/st-moritz-dorf.jpg', DOMAIN + '/img/abendstimmung.jpg'],
        offers: { '@type': 'Offer', price: '18000', priceCurrency: 'CHF', validFrom: '2026-12-19', validThrough: '2027-04-06', description: t.priceLead, availability: 'https://schema.org/InStock', url: url + '#preise' },
      },
      { '@type': 'FAQPage', mainEntity: t.faqs.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    ],
  };
  return JSON.stringify(d);
}

// ---------- 5. Page template ----------
function page(lang) {
  const t = TEXTS[lang];
  const L = LANGS[lang];
  const meta = META[lang];
  const url = DOMAIN + '/' + L.dir;
  const alternates = HREFLANGS.map(([h, d]) => `<link rel="alternate" hreflang="${h}" href="${DOMAIN}/${d}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${DOMAIN}/">`;
  const navLinks = [['#wohnung', t.navApt], ['#lage', t.navLoc], ['#stmoritz', t.navSm], ['#anreise', t.navArr], ['#preise', t.navPrice], ['#buchung', t.navBook]];
  const langLinks = Object.entries(LANGS).map(([l, v]) => `<a class="lang${l === lang ? ' lang-on' : ''}" href="/${v.dir}" lang="${l}" hreflang="${v.hreflang}" style="display:inline-flex;align-items:center;justify-content:center">${l.toUpperCase()}</a>`).join('');
  const waHref = `https://wa.me/${WA}?text=${encodeURIComponent(t.waText)}`;

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.desc)}">
<link rel="canonical" href="${url}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.desc)}">
<meta property="og:image" content="${DOMAIN}/img/st-moritz-dorf.jpg">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${L.ogLocale}">
${Object.values(LANGS).filter((v) => v.ogLocale !== L.ogLocale).map((v) => `<meta property="og:locale:alternate" content="${v.ogLocale}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" as="image" href="/img/st-moritz-dorf.jpg" fetchpriority="high">
<script type="application/ld+json">${jsonLd(lang, t)}</script>
<style>${css}</style>
</head>
<body>

<header style="position:sticky;top:0;background:rgba(255,255,255,0.95);border-bottom:1px solid #e3e7e4;z-index:10;backdrop-filter:blur(6px)">
<div class="wrap" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:nowrap;padding-top:12px;padding-bottom:12px">
<a href="#top" class="brand" style="font-weight:800;font-size:20px;color:#1b1f1e;text-decoration:none;letter-spacing:-0.01em;white-space:nowrap">${esc(t.brand)}</a>
<nav class="nav navlinks" style="display:flex;gap:20px;flex-wrap:nowrap" aria-label="Navigation">
${navLinks.slice(0, 5).map(([h, n]) => `<a href="${h}">${esc(n)}</a>`).join('\n')}
</nav>
<div class="langs" style="display:flex;gap:6px;align-items:center;flex-wrap:nowrap">
${langLinks}
<a class="btn btn-sm hdr-cta" href="#buchung" style="margin-left:6px;white-space:nowrap">${esc(t.navCta)}</a>
<button class="burger" id="burger" aria-label="${esc(t.navMenu)}" aria-expanded="false" aria-controls="mobnav"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1b1f1e" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>
</div>
</div>
<nav class="mobnav" id="mobnav" aria-label="Navigation">
${navLinks.slice(0, 5).map(([h, n]) => `<a href="${h}">${esc(n)}</a>`).join('\n')}
<a href="#buchung" style="color:#1e4d3f;font-weight:800">${esc(t.navBook)} / ${esc(t.navCta)} →</a>
</nav>
</header>

<main>
<section id="top" style="padding:64px 0 64px">
<div class="wrap">
<div class="hero-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px;align-items:center">
<div>
<div style="margin-bottom:18px"><span class="badge"><span class="dot"></span>${esc(t.badgeAvail)}</span></div>
<h1 class="hero-h" style="font-size:50px;margin-bottom:20px">${esc(t.heroTitle)}</h1>
<p class="lead" style="margin:0 0 24px">${esc(t.heroLead)}</p>
<ul style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px">
${t.facts.map((f) => `<li style="background:#f3f5f3;border-radius:999px;padding:8px 16px;font-size:14px;font-weight:600">${esc(f)}</li>`).join('')}
</ul>
<div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">
<a class="btn" href="#buchung">${esc(t.heroCta)}</a>
<a class="link hero-sec" href="#preise">${esc(t.heroSecondary)}</a>
</div>
</div>
<img class="img hero-img" src="/img/st-moritz-dorf.jpg" alt="${esc(t.altHero)}" width="2400" height="1600" fetchpriority="high" style="object-position:center 70%">
</div>
</div>
</section>

<section id="wohnung" class="sec sec-alt">
<div class="wrap">
<div class="eyebrow">${esc(t.navApt)}</div>
<h2 class="h2">${esc(t.aptTitle)}</h2>
<p class="lead" style="margin:0">${esc(t.aptLead)}</p>
<figure style="margin:40px 0 0"><img class="img" src="/img/wohnbereich-cheminee-v3.jpg" alt="${esc(t.altLiving)}" width="1536" height="1024" loading="lazy" style="height:520px"><figcaption style="font-size:14px;color:#5a6361;margin-top:8px">${esc(t.capLiving)}</figcaption></figure>
<div class="grid4" style="margin-top:16px;gap:16px">
${t.aptPhotos.map((p) => `<figure style="margin:0"><img class="img" src="/${img(p.src)}" alt="${esc(p.alt)}" width="788" height="1400" loading="lazy" style="height:260px"><figcaption style="font-size:14px;color:#5a6361;margin-top:8px">${esc(p.cap)}</figcaption></figure>`).join('\n')}
</div>
<p style="margin:16px 0 0;font-size:14px;color:#5a6361"><strong>${esc(t.photoNoteH)}</strong> ${esc(t.photoNote)}</p>
<div class="grid2">
<div class="card"><h3>${esc(t.aptSleepH)}</h3><ul>${li(t.aptSleep)}</ul></div>
<div class="card"><h3>${esc(t.aptBathH)}</h3><ul>${li(t.aptBath)}</ul></div>
<div class="card"><h3>${esc(t.aptEquipH)}</h3><ul>${li(t.aptEquip)}</ul></div>
<div class="card"><h3>${esc(t.aptGoodH)}</h3><ul>${li(t.aptGood)}</ul></div>
</div>
<div style="margin-top:40px">
<h3 style="font-size:22px;margin-bottom:10px">${esc(t.planH)}</h3>
<p style="margin:0 0 20px;font-size:16px;color:#2f3634">${esc(t.planP)}</p>
<div class="plan-wrap" data-plan role="img" aria-label="${esc(t.planAria)}"><div class="plan-scale">${plan(lang)}</div></div>
</div>
</div>
</section>

<section id="lage" class="sec">
<div class="wrap">
<div class="eyebrow">${esc(t.navLoc)}</div>
<h2 class="h2">${esc(t.locTitle)}</h2>
<p class="lead" style="margin:0">${esc(t.locLead)}</p>
<div class="grid2" style="align-items:stretch">
<div class="card" style="display:flex;flex-direction:column;justify-content:center;gap:10px">
<div class="eyebrow" style="margin:0">${esc(t.addrH)}</div>
<div style="font-size:22px;font-weight:700">Chesa Somplaz<br>Via Somplaz 10<br>7500 St. Moritz Dorf, ${esc(t.locNote)}</div>
<p style="margin:6px 0 0;font-size:15px;color:#5a6361">${esc(t.addrP)}</p>
<a class="link" href="https://www.google.com/maps/search/?api=1&amp;query=Via+Somplaz+10%2C+7500+St.+Moritz" target="_blank" rel="noopener" style="align-self:flex-start">${esc(t.addrMap)}</a>
</div>
<iframe title="Google Maps – Via Somplaz 10, St. Moritz" src="https://www.google.com/maps?q=Via+Somplaz+10,+7500+St.+Moritz&amp;z=16&amp;output=embed" width="600" height="300" style="width:100%;height:100%;min-height:300px;border:0;border-radius:12px" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
</div>
<div class="grid2">
<div class="card"><h3>${esc(t.locWalkH)}</h3><ul>${liKV(t.locWalk)}</ul></div>
<div class="card"><h3>${esc(t.locDriveH)}</h3><ul>${liKV(t.locDrive)}</ul>
</div>
</div>
</div>
</section>

<section id="stmoritz" class="sec sec-alt">
<div class="wrap">
<div class="eyebrow">${esc(t.navSm)}</div>
<h2 class="h2">${esc(t.smTitle)}</h2>
<p class="lead" style="margin:0">${esc(t.smLead)}</p>
<div class="grid3">
${t.smCards.map((c) => `<div class="card"><img class="img" src="/${img(c.img)}" alt="${esc(c.alt)}" width="1400" height="900" loading="lazy" style="height:200px;border-radius:8px;margin-bottom:18px"><h3>${esc(c.h)}</h3><p style="margin:0;font-size:16px">${esc(c.p)}</p></div>`).join('\n')}
</div>
<div class="card" style="margin-top:32px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;align-items:start" id="skischulen">
<div>
<img class="img" src="/img/skischule.jpg" alt="${esc(t.altKid)}" width="1920" height="1280" loading="lazy" style="height:260px;border-radius:8px;margin-bottom:18px">
<h3>${esc(t.schoolH)}</h3>
<p style="margin:0;font-size:16px">${esc(t.schoolP)}</p>
</div>
<ul>
${t.schools.map((s) => `<li class="tip"><strong>${esc(s.n)}</strong><br><span style="color:#2f3634">${esc(s.d)}</span><br><span style="font-size:15px">${esc(s.c)} · <a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.w)}</a></span></li>`).join('\n')}
</ul>
</div>
<div class="grid2" style="align-items:start">
<div class="card">
<img class="img" src="/img/white-turf.jpg" alt="${esc(t.altTurf)}" width="2000" height="1333" loading="lazy" style="height:220px;border-radius:8px;margin-bottom:18px">
<h3>${esc(t.smEventsH)}</h3>
<ul>${liKV(t.smEvents)}</ul>
</div>
<div class="card">
<h3>${esc(t.smSecretH)}</h3>
${t.smSecrets.map((x) => `<div class="tip"><strong>${esc(x.n)}</strong> – ${esc(x.v)}${ext(x.u, x.w)}</div>`).join('\n')}
<details style="margin-top:20px">
<summary>${esc(t.smTipsH)}</summary>
<div style="padding:0 0 20px">
${t.smTips.map((x) => `<div class="tip"><strong>${esc(x.n)}</strong> – ${esc(x.v)}${ext(x.u, x.w)}</div>`).join('\n')}
<p style="margin:14px 0 0;font-size:15px;color:#5a6361">${esc(t.smTipsNote)}</p>
</div>
</details>
</div>
</div>
<div class="grid2 pair" style="gap:16px"><img class="img" src="/img/abendstimmung.jpg" alt="${esc(t.altAbend)}" width="1800" height="1013" loading="lazy" style="height:300px"><img class="img" src="/img/hero-silsersee.jpg" alt="${esc(t.altSils)}" width="1800" height="1013" loading="lazy" style="height:300px"></div>
</div>
</section>

<section id="anreise" class="sec">
<div class="wrap">
<div class="eyebrow">${esc(t.navArr)}</div>
<h2 class="h2">${esc(t.arrTitle)}</h2>
<p class="lead" style="margin:0">${esc(t.arrLead)}</p>
<div class="grid3">
${t.arrBlocks.map((b) => `<div class="card"><img class="img" src="/${img(b.img)}" alt="${esc(b.alt)}" width="1400" height="900" loading="lazy" style="height:200px;border-radius:8px;margin-bottom:18px;object-position:${b.pos}"><h3>${esc(b.h)}</h3><p style="margin:0;font-size:16px;white-space:pre-line">${esc(b.p)}</p></div>`).join('\n')}
</div>
</div>
</section>

<section id="preise" class="sec sec-alt">
<div class="wrap">
<div class="eyebrow">${esc(t.navPrice)}</div>
<h2 class="h2">${esc(t.priceTitle)}</h2>
<p class="lead" style="margin:0">${esc(t.priceLead)}</p>
<div class="grid2" style="align-items:start">
<div class="card" style="background:#1e4d3f;color:#ffffff;border-color:#1e4d3f">
<div style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;opacity:0.85">${esc(t.priceSeasonLabel)}</div>
<div class="price" style="margin:6px 0 4px">CHF 18'000</div>
<div style="font-size:15px;opacity:0.9;margin-bottom:20px">${esc(t.pricePeriod)}</div>
<table class="table"><tbody>
${t.priceRows.map((r) => `<tr><td>${esc(r.n)}</td><td>${esc(r.v)}</td></tr>`).join('')}
</tbody></table>
<a class="btn" href="#buchung" style="background:#ffffff;color:#1e4d3f;margin-top:24px">${esc(t.heroCta)}</a>
</div>
<div>
<div class="card"><h3>${esc(t.priceWeekH)}</h3><p style="margin:0 0 16px;font-size:16px">${esc(t.priceWeek)}</p><a class="link" href="#buchung">${esc(t.priceWeekCta)}</a></div>
<div class="card" style="margin-top:20px"><h3>${esc(t.priceExtraH)}</h3><ul>${t.priceExtra.map((x) => `<li class="li" style="display:block;font-size:15px">${esc(x)}</li>`).join('')}</ul></div>
</div>
</div>
</div>
</section>

<section class="sec" style="padding-bottom:0">
<div class="wrap">
<div class="card" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
<img src="/img/vanessa.jpg" alt="${esc(t.hostsH)}" width="400" height="400" loading="lazy" style="width:96px;height:96px;border-radius:50%;object-fit:cover;flex:0 0 96px">
<div style="flex:1 1 400px"><h3 style="font-size:20px;margin-bottom:6px">${esc(t.hostsH)}</h3><p style="margin:0;font-size:16px;color:#2f3634">${esc(t.hostsText)}</p></div>
</div>
</div>
</section>

<section id="buchung" class="sec">
<div class="wrap">
<div class="eyebrow">${esc(t.navBook)}</div>
<h2 class="h2">${esc(t.bookTitle)}</h2>
<div class="grid2" style="margin-top:28px;align-items:start">
<div>
<div class="card"><h3>${esc(t.bookHowH)}</h3>
${t.bookSteps.map((s) => `<div class="step"><div class="num">${esc(s.n)}</div><div><strong>${esc(s.h)}</strong><div style="font-size:15px;color:#2f3634">${esc(s.p)}</div></div></div>`).join('')}
</div>
<div class="card" style="margin-top:24px"><h3>${esc(t.bookCancelH)}</h3><ul>${t.bookCancel.map((x) => `<li class="li" style="display:block;font-size:15px">${esc(x)}</li>`).join('')}</ul></div>
</div>
<div class="card">
<h3>${esc(t.formH)}</h3>
<p style="margin:0 0 20px;font-size:15px;color:#5a6361">${esc(t.formLead)}</p>
<form id="enquiry" action="#" novalidate>
<div class="field"><label class="label" for="f-name">${esc(t.fName)} <span class="req">*</span></label><input class="input" id="f-name" name="name" type="text" required autocomplete="name"></div>
<div class="field"><label class="label" for="f-mail">${esc(t.fMail)} <span class="req">*</span></label><input class="input" id="f-mail" name="mail" type="email" required autocomplete="email"></div>
<div class="grid2" style="margin-top:0;gap:16px">
<div class="field"><label class="label" for="f-from">${esc(t.fFrom)}</label><input class="input" id="f-from" name="from" type="date" min="2026-12-01" max="2027-04-30"></div>
<div class="field"><label class="label" for="f-to">${esc(t.fTo)}</label><input class="input" id="f-to" name="to" type="date" min="2026-12-01" max="2027-04-30"></div>
</div>
<div class="grid2" style="margin-top:0;gap:16px">
<div class="field"><label class="label" for="f-pers">${esc(t.fPers)}</label><input class="input" id="f-pers" name="pers" type="number" min="1" max="6" value="6"></div>
<div class="field"><label class="label" for="f-pet">${esc(t.fPet)}</label><select class="input" id="f-pet" name="pet"><option value="no">${esc(t.fNo)}</option><option value="yes">${esc(t.fYes)}</option></select></div>
</div>
<div class="field"><label class="label" for="f-msg">${esc(t.fMsg)}</label><textarea class="input" id="f-msg" name="msg" rows="4"></textarea></div>
<button class="btn" type="submit" style="width:100%">${esc(t.fSend)}</button>
<p id="form-hint" style="margin:12px 0 0;font-size:14px;color:#5a6361">${esc(t.formAfter)}</p>
</form>
<a class="btn" href="${waHref}" target="_blank" rel="noopener" style="width:100%;text-align:center;margin-top:14px;background:#25D366;color:#0b2a16;display:flex;align-items:center;justify-content:center;gap:10px;box-sizing:border-box">${svgChat(20)} ${esc(t.waBtn)}</a>
<p style="margin:16px 0 0;font-size:15px"><strong>${esc(t.formNote)}</strong> <a href="mailto:booking@chesa-somplaz.ch">booking@chesa-somplaz.ch</a><br><span style="color:#5a6361;font-size:14px">${esc(t.replyLangs)}</span></p>
</div>
</div>
<div style="margin-top:48px">
<h3 style="font-size:22px;margin-bottom:16px">${esc(t.faqH)}</h3>
<div class="card" style="padding:8px 28px">
${t.faqs.map((q) => `<div class="faq"><h3 style="font-size:16px;margin:0 0 4px">${esc(q.q)}</h3>${esc(q.a)}</div>`).join('\n')}
</div>
</div>
</div>
</section>

<section id="rechtliches" class="sec sec-alt" style="padding-top:56px;padding-bottom:56px">
<div class="wrap">
<details id="impressum"><summary>${esc(t.impH)}</summary><div style="padding:0 0 20px;font-size:15px">
${t.imp.map((x) => `<div class="faq"><strong>${esc(x.h)}</strong><span style="white-space:pre-line">${esc(x.p)}</span></div>`).join('\n')}
</div></details>
<details id="datenschutz" style="margin-top:16px"><summary>${esc(t.dsH)}</summary><div style="padding:0 0 20px;font-size:15px">
<p style="margin:0 0 12px;color:#5a6361">${esc(t.dsDate)}</p>
${t.ds.map((x) => `<div class="faq"><strong>${esc(x.h)}</strong><span style="white-space:pre-line">${esc(x.p)}</span></div>`).join('\n')}
</div></details>
</div>
</section>
</main>

<a class="wa-float" href="${waHref}" target="_blank" rel="noopener" aria-label="${esc(t.waBtn)}">${svgChat(26)}</a>

<footer style="background:#1b1f1e;color:#c9d1cd;padding:40px 0;font-size:14px">
<div class="wrap" style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">
<address style="font-style:normal"><strong style="color:#ffffff;font-size:16px">${esc(t.brand)}</strong><br>Via Somplaz 10 · 7500 St. Moritz · ${esc(t.footSwiss)}</address>
<div style="display:flex;gap:18px;flex-wrap:wrap"><a href="#impressum" style="color:#ffffff">${esc(t.impH)}</a><a href="#datenschutz" style="color:#ffffff">${esc(t.dsH)}</a><span>© 2026 Vanessa Fasciati</span></div>
</div>
</footer>

<script>
(function(){
  var b=document.getElementById('burger'),m=document.getElementById('mobnav');
  if(b&&m){b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');});m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open');b.setAttribute('aria-expanded','false');});});}
  ['#impressum','#datenschutz'].forEach(function(id){document.querySelectorAll('a[href="'+id+'"]').forEach(function(a){a.addEventListener('click',function(){var d=document.querySelector(id);if(d)d.open=true;});});});
  function scalePlans(){document.querySelectorAll('[data-plan]').forEach(function(w){var s=w.querySelector('.plan-scale');var k=Math.min(1,Math.max(0.72,w.clientWidth/980));s.style.transform='scale('+k+')';s.style.height='900px';w.style.height=Math.round(900*k)+'px';w.style.overflowX=(w.clientWidth/980<0.72)?'auto':'hidden';});}
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m){m.classList.remove('open');b.setAttribute('aria-expanded','false');}});
  document.addEventListener('click',function(e){if(m&&m.classList.contains('open')&&!m.contains(e.target)&&!b.contains(e.target)){m.classList.remove('open');b.setAttribute('aria-expanded','false');}});
  var wa=document.querySelector('.wa-float'),bk=document.getElementById('buchung');if(wa&&bk&&'IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(x){wa.style.display=x.isIntersecting?'none':'flex';});},{threshold:0.05}).observe(bk);}
  scalePlans();window.addEventListener('resize',scalePlans);
  try{var sy=sessionStorage.getItem('cs-scroll');if(sy!==null){sessionStorage.removeItem('cs-scroll');window.scrollTo(0,parseInt(sy,10)||0);}}catch(e){}
  document.querySelectorAll('.langs a.lang').forEach(function(a){a.addEventListener('click',function(){try{sessionStorage.setItem('cs-scroll',String(window.scrollY));}catch(e){}});});
  var f=document.getElementById('enquiry');
  if(f){f.addEventListener('submit',function(e){e.preventDefault();var g=function(n){return f.elements[n].value.trim();};var L=${JSON.stringify(t.mailLabels)};
    if(!g('name')||!/\\S+@\\S+\\.\\S+/.test(g('mail'))){document.getElementById('form-hint').textContent=${JSON.stringify(t.formNeed)};f.elements[g('name')?'mail':'name'].focus();return;}
    var body=[L.name+': '+g('name'),L.mail+': '+g('mail'),L.from+': '+g('from'),L.to+': '+g('to'),L.pers+': '+g('pers'),L.pet+': '+(g('pet')==='yes'?L.yes:L.no),'',L.msg+':',g('msg')].join('\\n');
    window.location.href='mailto:booking@chesa-somplaz.ch?subject='+encodeURIComponent(${JSON.stringify(t.mailSubject)})+'&body='+encodeURIComponent(body);});}
})();
</script>
</body>
</html>
`;
  return html.replace(/<img class="img([^"]*)" src="\/img\/([a-z0-9-]+)\.jpg"([^>]*)>/g, (m, cls, name, rest) => {
    if (!fs.existsSync(path.join(OUT, 'img', `${name}-800.webp`)) || !fs.existsSync(path.join(OUT, 'img', `${name}-1600.webp`))) return m;
    const sizes = cls.includes('hero-img') ? '(max-width:760px) 100vw, 560px' : /height:(200|220|260|300)px/.test(rest) ? '(max-width:760px) 100vw, 400px' : '(max-width:760px) 100vw, 1120px';
    return `<picture><source type="image/webp" srcset="/img/${name}-800.webp 800w, /img/${name}-1600.webp 1600w" sizes="${sizes}">${m}</picture>`;
  });
}

// ---------- 6. Write output ----------
for (const [lang, v] of Object.entries(LANGS)) {
  const dir = path.join(OUT, v.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(lang));
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${Object.values(LANGS).map((v) => `<url><loc>${DOMAIN}/${v.dir}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>${HREFLANGS.map(([h, d]) => `<xhtml:link rel="alternate" hreflang="${h}" href="${DOMAIN}/${d}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/"/></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'CNAME'), 'chesa-somplaz.ch\n');
fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1e4d3f"/><path d="M12 44 L26 22 L34 34 L40 27 L52 44 Z" fill="#ffffff"/><circle cx="46" cy="18" r="5" fill="#dfe8ec"/></svg>`);
fs.writeFileSync(path.join(OUT, '404.html'), `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/"><title>Chesa Somplaz</title></head><body><a href="/">chesa-somplaz.ch</a></body></html>`);
console.log('built:', Object.values(LANGS).map((v) => v.dir + 'index.html').join(', '));
