// ═══ AetherLink Blog Template Engine ═══
// Generates full HTML pages from Supabase blog_posts data
// Matches the existing static blog design 1:1

// ─── i18n ───
const i18n = {
  nl: {
    home: 'Home', blog: 'Blog', products: 'Producten', services: 'Diensten',
    expertise: 'Expertise', contact: 'Contact', about: 'Over ons',
    login: 'Inloggen', cta: 'Aan de slag', readTime: 'min leestijd',
    related: 'Gerelateerde artikelen', allArticles: 'Alle artikelen',
    ctaTitle: 'Klaar voor de volgende stap?',
    ctaText: 'Plan een gratis strategiegesprek met Marco en ontdek wat AI voor uw organisatie kan betekenen.',
    ctaPrimary: 'Plan een strategiegesprek', ctaSecondary: 'Bekijk onze diensten',
    footerTagline: 'De kracht van AI, toegankelijk voor elk bedrijf.',
    copyright: '2026 AetherLink. Alle rechten voorbehouden.',
    privacy: 'Privacybeleid', terms: 'Algemene voorwaarden',
    pricing: 'Prijzen', features: 'Functies', training: 'AI Training',
    aiLead: 'AI Lead Architect', aiConsult: 'AI Consultancy',
    aiChange: 'AI Verandermanagement', available: '24/7 beschikbaar',
    blogTitle: 'Blog', blogSubtitle: 'AI inzichten, strategieën en praktische gidsen voor organisaties die AI succesvol willen inzetten.',
    filterAll: 'Alle', filterBot: 'AetherBot', filterMind: 'AetherMIND', filterDev: 'AetherDEV',
    readMore: 'Lees meer', publishedBy: 'Door',
    locale: 'nl_NL', langCode: 'nl', hreflangSelf: 'nl',
    catLabels: { 'aetherbot': 'AetherBot', 'aethermind': 'AetherMIND', 'aetherdev': 'AetherDEV' },
    months: ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'],
  },
  en: {
    home: 'Home', blog: 'Blog', products: 'Products', services: 'Services',
    expertise: 'Expertise', contact: 'Contact', about: 'About',
    login: 'Sign in', cta: 'Get started', readTime: 'min read',
    related: 'Related articles', allArticles: 'All articles',
    ctaTitle: 'Ready for the next step?',
    ctaText: 'Schedule a free strategy session with Marco and discover what AI can do for your organisation.',
    ctaPrimary: 'Schedule a strategy session', ctaSecondary: 'View our services',
    footerTagline: 'The power of AI, accessible for every business.',
    copyright: '2026 AetherLink. All rights reserved.',
    privacy: 'Privacy policy', terms: 'Terms & conditions',
    pricing: 'Pricing', features: 'Features', training: 'AI Training',
    aiLead: 'AI Lead Architect', aiConsult: 'AI Consultancy',
    aiChange: 'AI Change Management', available: '24/7 available',
    blogTitle: 'Blog', blogSubtitle: 'AI insights, strategies and practical guides for organisations looking to implement AI successfully.',
    filterAll: 'All', filterBot: 'AetherBot', filterMind: 'AetherMIND', filterDev: 'AetherDEV',
    readMore: 'Read more', publishedBy: 'By',
    locale: 'en_GB', langCode: 'en', hreflangSelf: 'en',
    catLabels: { 'aetherbot': 'AetherBot', 'aethermind': 'AetherMIND', 'aetherdev': 'AetherDEV' },
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  },
  fi: {
    home: 'Etusivu', blog: 'Blogi', products: 'Tuotteet', services: 'Palvelut',
    expertise: 'Asiantuntemus', contact: 'Yhteystiedot', about: 'Tietoa meistä',
    login: 'Kirjaudu', cta: 'Aloita', readTime: 'min lukuaika',
    related: 'Aiheeseen liittyvät artikkelit', allArticles: 'Kaikki artikkelit',
    ctaTitle: 'Valmis seuraavaan askeleeseen?',
    ctaText: 'Varaa maksuton strategiakeskustelu Marcon kanssa ja selvitä, mitä tekoäly voi tehdä organisaatiollesi.',
    ctaPrimary: 'Varaa strategiakeskustelu', ctaSecondary: 'Tutustu palveluihimme',
    footerTagline: 'Tekoälyn voima, saavutettavissa jokaiselle yritykselle.',
    copyright: '2026 AetherLink. Kaikki oikeudet pidätetään.',
    privacy: 'Tietosuojakäytäntö', terms: 'Yleiset ehdot',
    pricing: 'Hinnoittelu', features: 'Ominaisuudet', training: 'AI-koulutus',
    aiLead: 'AI Lead Architect', aiConsult: 'Tekoälykonsultointi',
    aiChange: 'Muutoshallinta', available: '24/7 saatavilla',
    blogTitle: 'Blogi', blogSubtitle: 'Tekoälynäkemyksiä, strategioita ja käytännön oppaita organisaatioille, jotka haluavat hyödyntää tekoälyä menestyksekkäästi.',
    filterAll: 'Kaikki', filterBot: 'AetherBot', filterMind: 'AetherMIND', filterDev: 'AetherDEV',
    readMore: 'Lue lisää', publishedBy: 'Kirjoittaja:',
    locale: 'fi_FI', langCode: 'fi', hreflangSelf: 'fi',
    catLabels: { 'aetherbot': 'AetherBot', 'aethermind': 'AetherMIND', 'aetherdev': 'AetherDEV' },
    months: ['tammikuuta','helmikuuta','maaliskuuta','huhtikuuta','toukokuuta','kesäkuuta','heinäkuuta','elokuuta','syyskuuta','lokakuuta','marraskuuta','joulukuuta'],
  },
};

// ─── Navigation page links per language ───
const navPages = {
  nl: { index: '/nl/', aetherbot: '/nl/aetherbot', aethermind: '/nl/aethermind', aetherdev: '/nl/aetherdev', aiLead: '/nl/ai-lead-architect', aiConsult: '/nl/ai-consultancy', aiChange: '/nl/ai-verandermanagement', blog: '/nl/blog/' },
  en: { index: '/en/', aetherbot: '/en/aetherbot', aethermind: '/en/aethermind', aetherdev: '/en/aetherdev', aiLead: '/en/ai-lead-architect', aiConsult: '/en/ai-consultancy', aiChange: '/en/ai-change-management', blog: '/en/blog/' },
  fi: { index: '/fi/', aetherbot: '/fi/aetherbot', aethermind: '/fi/aethermind', aetherdev: '/fi/aetherdev', aiLead: '/fi/ai-lead-architect', aiConsult: '/fi/ai-consultancy', aiChange: '/fi/ai-muutoshallinta', blog: '/fi/blog/' },
};

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  const t = i18n[lang];
  return `${d.getDate()} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
}

function getSlug(post, lang) {
  return post[`slug_${lang}`];
}
function getTitle(post, lang) {
  return post[`title_${lang}`];
}
function getDescription(post, lang) {
  return post[`description_${lang}`] || '';
}
function getContent(post, lang) {
  return post[`content_${lang}`] || '';
}
function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Accent color per category ───
function catColor(cat) {
  if (cat === 'aetherbot') return 'cyan';
  if (cat === 'aetherdev') return 'emerald';
  return 'violet'; // aethermind
}

// ═══ Shared CSS (inline) ═══
const SHARED_CSS = `*,*::before,*::after{box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#05060f;color:#e4e8f1;overflow-x:hidden;-webkit-text-size-adjust:100%;margin:0}
section:not(:first-of-type){content-visibility:auto;contain-intrinsic-size:auto 800px}.font-display{font-family:'Syne',sans-serif}
body::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:0.4}
.grid-bg{background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:72px 72px}
.orb{position:absolute;border-radius:50%;filter:blur(100px);will-change:transform}
@keyframes orbit-1{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(80px,-60px) scale(1.1)}50%{transform:translate(-40px,80px) scale(.9)}75%{transform:translate(60px,40px) scale(1.05)}}
@keyframes orbit-2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-70px,50px) scale(1.08)}66%{transform:translate(50px,-70px) scale(.95)}}
.glass-card{background:rgba(255,255,255,0.025);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.06);border-radius:20px;transition:all .5s cubic-bezier(.16,1,.3,1)}
.glass-card:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.12);transform:translateY(-8px);box-shadow:0 32px 64px -16px rgba(0,0,0,0.5)}
.accent-line{position:absolute;top:0;left:20%;right:20%;height:2px;border-radius:0 0 2px 2px;opacity:0.6;transition:all .5s ease}
.glass-card:hover .accent-line{left:10%;right:10%;opacity:1}
.accent-cyan{background:linear-gradient(90deg,transparent,#00d4ff,transparent)}
.accent-violet{background:linear-gradient(90deg,transparent,#8b5cf6,transparent)}
.accent-emerald{background:linear-gradient(90deg,transparent,#00dfa2,transparent)}
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#00d4ff,#8b5cf6);color:#fff;padding:15px 32px;border-radius:14px;font-family:'Syne',sans-serif;font-weight:600;font-size:.95rem;text-decoration:none;border:none;cursor:pointer;transition:all .4s cubic-bezier(.16,1,.3,1);box-shadow:0 0 24px rgba(0,212,255,0.15),0 8px 32px -8px rgba(139,92,246,0.2);position:relative;overflow:hidden}
.btn-primary::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#8b5cf6,#00dfa2);opacity:0;transition:opacity .4s ease}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 0 48px rgba(0,212,255,0.25),0 16px 48px -8px rgba(139,92,246,0.3)}
.btn-primary:hover::before{opacity:1}.btn-primary span{position:relative;z-index:1}
.btn-secondary{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#e4e8f1;padding:15px 32px;border-radius:14px;font-family:'Syne',sans-serif;font-weight:500;font-size:.95rem;text-decoration:none;border:1px solid rgba(255,255,255,0.12);cursor:pointer;transition:all .4s cubic-bezier(.16,1,.3,1)}
.btn-secondary:hover{border-color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.05);transform:translateY(-2px)}
.reveal{opacity:0;transform:translateY(40px);transition:all .9s cubic-bezier(.16,1,.3,1)}.reveal.revealed{opacity:1;transform:translateY(0)}
.reveal-delay-1{transition-delay:.1s}.reveal-delay-2{transition-delay:.2s}.reveal-delay-3{transition-delay:.3s}
.nav-glass{background:rgba(5,6,15,0.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.05);box-shadow:0 4px 30px rgba(0,0,0,0.2)}
.nav-link{font-family:'Syne',sans-serif;font-weight:500;font-size:.85rem;color:#8892a8;text-decoration:none;padding:8px 16px;border-radius:8px;transition:color .3s ease;position:relative;letter-spacing:.02em}
.nav-link::after{content:'';position:absolute;bottom:2px;left:50%;right:50%;height:2px;background:linear-gradient(90deg,#00d4ff,#8b5cf6);border-radius:1px;transition:all .35s cubic-bezier(.16,1,.3,1);opacity:0}
.nav-link:hover{color:#e4e8f1}.nav-link:hover::after{left:16px;right:16px;opacity:1}
.nav-link.active{color:#e4e8f1}.nav-link.active::after{left:16px;right:16px;opacity:1}
.btn-login{font-family:'Syne',sans-serif;font-weight:500;font-size:.85rem;color:#b8bfcf;padding:9px 20px;border-radius:10px;border:1px solid rgba(140,79,218,0.2);background:rgba(140,79,218,0.06);text-decoration:none;transition:all .3s ease}
.btn-login:hover{border-color:rgba(140,79,218,0.4);background:rgba(140,79,218,0.12);color:#e4e8f1}
.btn-cta-nav{font-family:'Syne',sans-serif;font-weight:600;font-size:.85rem;color:#fff;padding:9px 22px;border-radius:10px;background:linear-gradient(135deg,#00C2CB,#8C4FDA);text-decoration:none;transition:all .35s cubic-bezier(.16,1,.3,1);box-shadow:0 0 20px rgba(0,194,203,0.15)}
.btn-cta-nav:hover{transform:translateY(-2px);box-shadow:0 0 30px rgba(0,194,203,0.25),0 8px 24px -8px rgba(140,79,218,0.3)}
.mobile-overlay{position:fixed;inset:0;z-index:45;background:rgba(5,6,15,0.96);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;pointer-events:none;transition:opacity .4s ease}
.mobile-overlay.open{opacity:1;pointer-events:auto}.mobile-overlay .nav-link{font-size:1.4rem;padding:12px 24px}.mobile-overlay .nav-link::after{display:none}
.section-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin:0 auto;max-width:1200px}
.cta-gradient{background:linear-gradient(180deg,#05060f 0%,#0c1025 40%,#0f1535 60%,#05060f 100%);position:relative}
.cta-gradient::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:80%;height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent)}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#05060f}::-webkit-scrollbar-thumb{background:#1e2444;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#2a3158}
.prose-article p{font-size:1.125rem;line-height:1.8;color:rgba(228,232,241,0.8);margin-bottom:1.5rem}
.prose-article h2{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.5rem,3vw,1.875rem);color:#e4e8f1;margin-top:4rem;margin-bottom:1.5rem;line-height:1.2}
.prose-article h3{font-family:'Syne',sans-serif;font-weight:700;font-size:1.25rem;color:#e4e8f1;margin-top:2.5rem;margin-bottom:1rem}
.prose-article ul{list-style:none;padding:0;margin-bottom:1.5rem}
.prose-article ul li{position:relative;padding-left:28px;margin-bottom:12px;font-size:1.05rem;line-height:1.7;color:rgba(228,232,241,0.75)}
.prose-article ul li::before{content:'';position:absolute;left:0;top:10px;width:8px;height:8px;border-radius:3px;background:rgba(139,92,246,0.5)}
.prose-article ol{counter-reset:item;padding:0;margin-bottom:1.5rem;list-style:none}
.prose-article ol li{counter-increment:item;position:relative;padding-left:36px;margin-bottom:16px;font-size:1.05rem;line-height:1.7;color:rgba(228,232,241,0.75)}
.prose-article ol li::before{content:counter(item);position:absolute;left:0;top:2px;width:24px;height:24px;border-radius:8px;background:rgba(139,92,246,0.12);color:#8b5cf6;font-family:'Syne',sans-serif;font-weight:700;font-size:.8rem;display:flex;align-items:center;justify-content:center}
.prose-article blockquote{border-left:3px solid rgba(139,92,246,0.4);padding:20px 24px;margin:2rem 0;background:rgba(139,92,246,0.04);border-radius:0 12px 12px 0}
.prose-article blockquote p{font-style:italic;color:rgba(228,232,241,0.7);margin-bottom:0;font-size:1.1rem}
.prose-article strong{color:#e4e8f1;font-weight:600}
.prose-article a{color:#8b5cf6;text-decoration:underline;text-underline-offset:3px;transition:color .2s}.prose-article a:hover{color:#a78bfa}
@media(max-width:768px){.orb{width:250px!important;height:250px!important}}`;

// ─── Tailwind config (inline JS) ───
const TAILWIND_CONFIG = `tailwind.config={theme:{extend:{fontFamily:{display:['Syne','sans-serif'],body:['Plus Jakarta Sans','sans-serif']},colors:{void:'#05060f',surface:{DEFAULT:'#0a0d1a',2:'#111527',3:'#181d35'},accent:{cyan:'#00d4ff',violet:'#8b5cf6',emerald:'#00dfa2'},muted:'#6b7394',light:'#e4e8f1'}}}}`;

// ─── Shared Scripts (inline) ───
const SHARED_SCRIPTS = `
const ro=new IntersectionObserver(e=>{e.forEach(el=>{if(el.isIntersecting)el.target.classList.add('revealed')})},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
const nav=document.getElementById('nav');let ticking=false;
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{nav.classList.toggle('nav-glass',window.scrollY>50);ticking=false});ticking=true}},{passive:true});
const mt=document.getElementById('mobile-toggle'),mm=document.getElementById('mobile-menu'),b1=document.getElementById('bar1'),b2=document.getElementById('bar2'),b3=document.getElementById('bar3');
let menuOpen=false;if(mt)mt.addEventListener('click',()=>{menuOpen=!menuOpen;mm.classList.toggle('open',menuOpen);b1.style.transform=menuOpen?'rotate(45deg) translate(4px,4px)':'';b2.style.opacity=menuOpen?'0':'1';b3.style.transform=menuOpen?'rotate(-45deg) translate(4px,-4px)':'';b3.style.width=menuOpen?'24px':'16px';document.body.style.overflow=menuOpen?'hidden':''});
document.querySelectorAll('[data-close-menu]').forEach(a=>a.addEventListener('click',()=>{if(menuOpen){menuOpen=false;mm.classList.remove('open');b1.style.transform='';b2.style.opacity='1';b3.style.transform='';b3.style.width='16px';document.body.style.overflow=''}}));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));`;

// ═══════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════

function headHTML(post, lang, type = 'article') {
  const t = i18n[lang];
  const title = escHtml(getTitle(post, lang));
  const desc = escHtml(getDescription(post, lang));
  const slug = getSlug(post, lang);
  const url = `https://aetherlink.ai/${lang}/blog/${slug}`;
  const catLabel = t.catLabels[post.category] || post.category;
  const dateISO = post.published_at || post.created_at || new Date().toISOString();
  const ogImage = `https://aetherlink.ai/api/og?page=blog-${slug}`;
  const langs = ['nl', 'en', 'fi'];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | AetherLink ${t.blog}</title>
    <meta name="description" content="${desc}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${url}">
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="${t.locale}">
    <meta property="og:site_name" content="AetherLink.ai">
    <meta property="article:published_time" content="${dateISO}">
    <meta property="article:author" content="${escHtml(post.author)}">
    <meta property="article:section" content="${escHtml(catLabel)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${ogImage}">
    ${langs.map(l => `<link rel="alternate" hreflang="${l}" href="https://aetherlink.ai/${l}/blog/${getSlug(post, l)}">`).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="https://aetherlink.ai/nl/blog/${getSlug(post, 'nl')}">
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org", "@type": "Article",
      headline: getTitle(post, lang),
      description: getDescription(post, lang),
      image: ogImage, datePublished: dateISO, dateModified: post.updated_at || dateISO,
      author: { "@type": "Person", name: post.author, jobTitle: post.author_title, url: "https://aetherlink.ai" },
      publisher: { "@type": "Organization", name: "AetherLink", logo: { "@type": "ImageObject", url: "https://aetherlink.ai/images/logo-color.png" } },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      articleSection: catLabel, wordCount: post.word_count || 0, inLanguage: lang,
    })}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.home, item: `https://aetherlink.ai/${lang}/` },
        { "@type": "ListItem", position: 2, name: t.blog, item: `https://aetherlink.ai/${lang}/blog/` },
        { "@type": "ListItem", position: 3, name: getTitle(post, lang), item: url },
      ]
    })}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>${TAILWIND_CONFIG}</script>
    <style>${SHARED_CSS}</style>
    <link rel="stylesheet" href="/css/theme.css">
    <script src="/js/theme.js"></script>
</head>`;
}

function navHTML(post, lang, isIndex = false) {
  const t = i18n[lang];
  const p = navPages[lang];
  const langs = ['nl', 'en', 'fi'];
  const langLabels = { nl: 'NL', en: 'EN', fi: 'FI' };

  // Language links
  const langLinksDesktop = langs.map(l => {
    const href = isIndex ? `/${l}/blog/` : `/${l}/blog/${getSlug(post, l)}`;
    const active = l === lang;
    return active
      ? `<a href="${href}" class="text-light font-semibold px-2 py-1 rounded-md bg-white/[0.07]">${langLabels[l]}</a>`
      : `<a href="${href}" class="hover:text-light px-2 py-1 rounded-md transition-colors">${langLabels[l]}</a>`;
  }).join('\n                        ');

  const langLinksMobile = langs.map(l => {
    const href = isIndex ? `/${l}/blog/` : `/${l}/blog/${getSlug(post, l)}`;
    const active = l === lang;
    return active
      ? `<a href="${href}" class="text-light font-semibold text-sm px-3 py-1.5 rounded-md bg-white/[0.07]">${langLabels[l]}</a>`
      : `<a href="${href}" class="text-muted hover:text-light text-sm px-3 py-1.5 rounded-md transition-colors">${langLabels[l]}</a>`;
  }).join('\n            ');

  return `<body class="grid-bg">
    <nav id="nav" class="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
        <div class="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div class="flex items-center justify-between h-[72px]">
                <a href="${p.index}" class="flex items-center group relative z-50">
                    <img src="/images/logo-white.png" alt="AetherLink" width="112" height="32" fetchpriority="high" class="h-8 lg:h-9 w-auto transition-transform duration-300 group-hover:scale-105">
                </a>
                <div class="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    <a href="${p.aetherbot}" class="nav-link">AetherBot</a>
                    <a href="${p.aethermind}" class="nav-link">AetherMIND</a>
                    <a href="${p.aetherdev}" class="nav-link">AetherDEV</a>
                    <div class="relative group">
                        <button class="nav-link cursor-pointer">${t.expertise} <svg class="inline w-3 h-3 ml-0.5 opacity-60" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></button>
                        <div class="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div class="bg-surface-2 border border-white/8 rounded-xl p-2 min-w-[220px] shadow-2xl backdrop-blur-xl">
                                <a href="${p.aiLead}" class="block px-4 py-2.5 text-sm text-muted hover:text-light hover:bg-white/5 rounded-lg transition-colors font-body">${t.aiLead}</a>
                                <a href="${p.aiConsult}" class="block px-4 py-2.5 text-sm text-muted hover:text-light hover:bg-white/5 rounded-lg transition-colors font-body">${t.aiConsult}</a>
                                <a href="${p.aiChange}" class="block px-4 py-2.5 text-sm text-muted hover:text-light hover:bg-white/5 rounded-lg transition-colors font-body">${t.aiChange}</a>
                            </div>
                        </div>
                    </div>
                    <a href="${p.index}#why" class="nav-link">${t.about}</a>
                    <a href="${p.blog}" class="nav-link active">${t.blog}</a>
                </div>
                <div class="hidden lg:flex items-center gap-3 relative z-50">
                    <div class="flex items-center gap-0.5 text-xs text-muted mr-1">
                        ${langLinksDesktop}
                    </div>
                    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
                        <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    </button>
                    <a href="https://app.aetherlink.ai/auth/login" class="btn-login">${t.login}</a>
                    <a href="https://calendly.com/aetherlink" class="btn-cta-nav">${t.cta}</a>
                </div>
                <button id="mobile-toggle" class="lg:hidden flex flex-col gap-1.5 p-2 relative z-50" aria-label="Menu">
                    <span class="w-6 h-0.5 bg-light rounded-full transition-all duration-300 origin-center" id="bar1"></span>
                    <span class="w-6 h-0.5 bg-light rounded-full transition-all duration-300" id="bar2"></span>
                    <span class="w-4 h-0.5 bg-light rounded-full transition-all duration-300 origin-center" id="bar3"></span>
                </button>
            </div>
        </div>
    </nav>
    <div id="mobile-menu" class="mobile-overlay lg:hidden">
        <a href="${p.aetherbot}" class="nav-link">AetherBot</a>
        <a href="${p.aethermind}" class="nav-link">AetherMIND</a>
        <a href="${p.aetherdev}" class="nav-link">AetherDEV</a>
        <div class="w-full max-w-xs border-t border-white/5 my-2 mx-auto"></div>
        <a href="${p.aiLead}" class="nav-link text-accent-violet/80">${t.aiLead}</a>
        <a href="${p.aiConsult}" class="nav-link text-accent-violet/80">${t.aiConsult}</a>
        <a href="${p.aiChange}" class="nav-link text-accent-violet/80">${t.aiChange}</a>
        <div class="w-full max-w-xs border-t border-white/5 my-2 mx-auto"></div>
        <a href="${p.index}#why" class="nav-link" data-close-menu>${t.about}</a>
        <a href="${p.blog}" class="nav-link active">${t.blog}</a>
        <div class="flex items-center gap-3 mt-6">
            ${langLinksMobile}
        </div>
        <div class="flex flex-col items-center gap-3 mt-4 w-full max-w-xs">
            <a href="https://app.aetherlink.ai/auth/login" class="btn-login w-full text-center">${t.login}</a>
            <a href="https://calendly.com/aetherlink" class="btn-cta-nav w-full text-center">${t.cta}</a>
        </div>
    </div>
    <main>`;
}

function footerHTML(lang) {
  const t = i18n[lang];
  const p = navPages[lang];
  return `    </main>
    <footer class="border-t border-white/5 py-16 lg:py-20">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
                <div class="sm:col-span-2 lg:col-span-1">
                    <a href="${p.index}" class="inline-block mb-6"><img src="/images/logo-white.png" alt="AetherLink" width="160" height="40" class="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" loading="lazy"></a>
                    <p class="text-muted text-sm leading-relaxed mb-6">${t.footerTagline}</p>
                    <div class="flex items-center gap-3">
                        <a href="https://www.linkedin.com/company/aetherlink/" class="w-9 h-9 rounded-lg border border-white/8 flex items-center justify-center text-muted hover:text-light hover:border-white/15 transition-all" aria-label="LinkedIn"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                        <a href="https://twitter.com/aetherlink" class="w-9 h-9 rounded-lg border border-white/8 flex items-center justify-center text-muted hover:text-light hover:border-white/15 transition-all" aria-label="X / Twitter"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                        <a href="https://www.youtube.com/@Aetherlink" class="w-9 h-9 rounded-lg border border-white/8 flex items-center justify-center text-muted hover:text-light hover:border-white/15 transition-all" aria-label="YouTube"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
                    </div>
                </div>
                <div>
                    <h3 class="font-display font-600 text-sm text-light mb-5 tracking-wide">${t.products}</h3>
                    <ul class="space-y-3">
                        <li><a href="${p.aetherbot}" class="text-sm text-muted hover:text-light transition-colors">AetherBot</a></li>
                        <li><a href="${p.aetherbot}#pricing" class="text-sm text-muted hover:text-light transition-colors">${t.pricing}</a></li>
                        <li><a href="${p.aetherbot}#features" class="text-sm text-muted hover:text-light transition-colors">${t.features}</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-display font-600 text-sm text-light mb-5 tracking-wide">${t.services}</h3>
                    <ul class="space-y-3">
                        <li><a href="${p.aethermind}" class="text-sm text-muted hover:text-light transition-colors">AetherMIND</a></li>
                        <li><a href="${p.aetherdev}" class="text-sm text-muted hover:text-light transition-colors">AetherDEV</a></li>
                        <li><a href="${p.aethermind}#training" class="text-sm text-muted hover:text-light transition-colors">${t.training}</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-display font-600 text-sm text-light mb-5 tracking-wide">${t.expertise}</h3>
                    <ul class="space-y-3">
                        <li><a href="${p.aiLead}" class="text-sm text-muted hover:text-light transition-colors">${t.aiLead}</a></li>
                        <li><a href="${p.aiConsult}" class="text-sm text-muted hover:text-light transition-colors">${t.aiConsult}</a></li>
                        <li><a href="${p.aiChange}" class="text-sm text-muted hover:text-light transition-colors">${t.aiChange}</a></li>
                        <li><a href="${p.blog}" class="text-sm text-muted hover:text-light transition-colors">${t.blog}</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-display font-600 text-sm text-light mb-5 tracking-wide">${t.contact}</h3>
                    <ul class="space-y-3">
                        <li class="flex items-start gap-2 text-sm text-muted"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>+31 6 1377 2333</span></li>
                        <li class="flex items-start gap-2 text-sm text-muted"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 flex-shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg><a href="mailto:info@aetherlink.ai" class="hover:text-light transition-colors">info@aetherlink.ai</a></li>
                        <li class="flex items-start gap-2 text-sm text-muted"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>${t.available}</span></li>
                    </ul>
                </div>
            </div>
            <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p class="text-xs text-muted/60">&copy; ${t.copyright}</p>
                <div class="flex items-center gap-6">
                    <a href="/${lang}/privacy" class="text-xs text-muted/50 hover:text-muted transition-colors">${t.privacy}</a>
                    <a href="/docs/algemene-voorwaarden.pdf" target="_blank" class="text-xs text-muted/50 hover:text-muted transition-colors">${t.terms}</a>
                    <span class="flex items-center gap-2 text-xs text-muted/50"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>EU AI Act &amp; AVG</span>
                </div>
            </div>
        </div>
    </footer>
    <script>${SHARED_SCRIPTS}</script>
    <script src="/js/aether-assist.js" defer></script>
</body>
</html>`;
}

// ═══ RENDER SINGLE BLOG POST ═══
export function renderBlogPost(post, relatedPosts, lang) {
  const t = i18n[lang];
  const p = navPages[lang];
  const color = catColor(post.category);
  const catLabel = t.catLabels[post.category] || post.category;
  const dateStr = formatDate(post.published_at || post.created_at, lang);

  const colorMap = { violet: 'rgba(139,92,246', cyan: 'rgba(0,212,255', emerald: 'rgba(0,223,162' };
  const orbColor = colorMap[color] || colorMap.violet;

  // Related articles HTML
  let relatedHTML = '';
  if (relatedPosts && relatedPosts.length > 0) {
    const cards = relatedPosts.map(rp => {
      const rColor = catColor(rp.category);
      const rCatLabel = t.catLabels[rp.category] || rp.category;
      return `<a href="/${lang}/blog/${getSlug(rp, lang)}" class="glass-card relative overflow-hidden block group reveal reveal-delay-1">
                    <div class="accent-line accent-${rColor}"></div>
                    <div class="p-8">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="inline-block text-xs font-display font-600 tracking-wider uppercase text-accent-${rColor} bg-accent-${rColor}/10 px-3 py-1 rounded-full">${escHtml(rCatLabel)}</span>
                            <span class="text-xs text-muted">${formatDate(rp.published_at || rp.created_at, lang)}</span>
                            <span class="text-xs text-muted">&middot; ${rp.read_time || 5} ${t.readTime}</span>
                        </div>
                        <h3 class="font-display font-700 text-lg text-light mb-2 group-hover:text-accent-${rColor} transition-colors">${escHtml(getTitle(rp, lang))}</h3>
                        <p class="text-muted text-[0.95rem] leading-relaxed">${escHtml(getDescription(rp, lang))}</p>
                    </div>
                </a>`;
    }).join('\n            ');
    relatedHTML = `
        <section class="py-20 lg:py-24">
            <div class="max-w-3xl mx-auto px-6">
                <h2 class="font-display font-700 text-xl text-light mb-8 reveal">${t.related}</h2>
                ${cards}
            </div>
        </section>`;
  }

  return `${headHTML(post, lang)}
${navHTML(post, lang, false)}

        <!-- ARTICLE HERO -->
        <section class="relative min-h-[55vh] flex items-end overflow-hidden pt-24 pb-16">
            <div class="orb" style="width:500px;height:500px;background:radial-gradient(circle,${orbColor},0.25),transparent 70%);top:5%;left:-10%;animation:orbit-1 25s ease-in-out infinite"></div>
            <div class="orb" style="width:400px;height:400px;background:radial-gradient(circle,${orbColor},0.15),transparent 70%);bottom:10%;right:-8%;animation:orbit-2 30s ease-in-out infinite"></div>
            <div class="relative z-10 max-w-3xl mx-auto px-6 w-full">
                <nav class="flex items-center gap-2 text-sm text-muted mb-8 reveal" aria-label="Breadcrumb">
                    <a href="${p.index}" class="hover:text-light transition-colors">${t.home}</a>
                    <span class="text-muted/40">/</span>
                    <a href="${p.blog}" class="hover:text-light transition-colors">${t.blog}</a>
                    <span class="text-muted/40">/</span>
                    <span class="text-light/60">${escHtml(getTitle(post, lang))}</span>
                </nav>
                <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-accent-${color}/20 bg-accent-${color}/5 mb-6 reveal">
                    <span class="font-display font-600 text-xs tracking-wider uppercase text-accent-${color}">${escHtml(catLabel)}</span>
                </div>
                <h1 class="font-display font-800 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-light mb-6 reveal reveal-delay-1">
                    ${escHtml(getTitle(post, lang))}
                </h1>
                <div class="flex flex-wrap items-center gap-4 text-sm text-muted reveal reveal-delay-2">
                    <span class="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${dateStr}
                    </span>
                    <span class="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${post.read_time || 5} ${t.readTime}
                    </span>
                    <span class="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        ${escHtml(post.author)}, ${escHtml(post.author_title)}
                    </span>
                </div>
            </div>
        </section>

        <!-- ARTICLE BODY -->
        <section class="py-12 lg:py-20">
            <article class="max-w-3xl mx-auto px-6 prose-article">
                ${getContent(post, lang)}
            </article>
        </section>

        <!-- AUTHOR BIO -->
        <section class="pb-12">
            <div class="max-w-3xl mx-auto px-6">
                <div class="glass-card p-8 flex items-start gap-6 reveal">
                    <div class="w-14 h-14 rounded-2xl bg-accent-${color}/10 flex items-center justify-center flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color === 'cyan' ? '#00d4ff' : color === 'emerald' ? '#00dfa2' : '#8b5cf6'}" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                        <h3 class="font-display font-700 text-lg text-light mb-1">${escHtml(post.author)}</h3>
                        <p class="text-accent-${color} text-sm font-medium mb-3">${escHtml(post.author_title)} bij AetherLink</p>
                        <p class="text-muted text-[0.95rem] leading-relaxed">Marco is CTO en AI Lead Architect bij AetherLink. Met meer dan 5 jaar ervaring in AI-implementatie helpt hij organisaties in heel Europa om AI strategisch en verantwoord in te zetten.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="cta-gradient py-32 lg:py-40 relative overflow-hidden">
            <div class="orb" style="width:350px;height:350px;background:radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%);bottom:10%;left:-5%;filter:blur(80px)"></div>
            <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
                <h2 class="font-display font-800 text-3xl md:text-5xl text-light leading-tight mb-8 reveal">${t.ctaTitle}</h2>
                <p class="text-lg text-muted leading-relaxed mb-12 reveal reveal-delay-1">${t.ctaText}</p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 reveal reveal-delay-2">
                    <a href="https://calendly.com/aetherlink" class="btn-primary"><span>${t.ctaPrimary}</span><span class="relative z-[1]">&rarr;</span></a>
                    <a href="${p.aethermind}" class="btn-secondary">${t.ctaSecondary}</a>
                </div>
            </div>
        </section>
${relatedHTML}
${footerHTML(lang)}`;
}

// ═══ RENDER BLOG INDEX ═══
export function renderBlogIndex(posts, lang) {
  const t = i18n[lang];
  const p = navPages[lang];

  // Dummy post object for nav language links
  const dummyPost = { slug_nl: '', slug_en: '', slug_fi: '' };

  const postCards = posts.map((post, i) => {
    const color = catColor(post.category);
    const catLabel = t.catLabels[post.category] || post.category;
    const dateStr = formatDate(post.published_at || post.created_at, lang);
    const delay = (i % 4) + 1;
    return `<a href="/${lang}/blog/${getSlug(post, lang)}" class="glass-card relative overflow-hidden block group reveal reveal-delay-${delay}" data-category="${post.category}">
                    <div class="accent-line accent-${color}"></div>
                    <div class="p-8">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="inline-block text-xs font-display font-600 tracking-wider uppercase text-accent-${color} bg-accent-${color}/10 px-3 py-1 rounded-full">${escHtml(catLabel)}</span>
                            <span class="text-xs text-muted">${dateStr}</span>
                            <span class="text-xs text-muted">&middot; ${post.read_time || 5} ${t.readTime}</span>
                        </div>
                        <h2 class="font-display font-700 text-xl text-light mb-3 group-hover:text-accent-${color} transition-colors">${escHtml(getTitle(post, lang))}</h2>
                        <p class="text-muted text-[0.95rem] leading-relaxed mb-4">${escHtml(getDescription(post, lang))}</p>
                        <span class="text-accent-${color} text-sm font-display font-600 group-hover:gap-3 inline-flex items-center gap-2 transition-all">${t.readMore} <span>&rarr;</span></span>
                    </div>
                </a>`;
  }).join('\n            ');

  const indexHead = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.blogTitle} — AI Insights & Strategies | AetherLink</title>
    <meta name="description" content="${escHtml(t.blogSubtitle)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://aetherlink.ai/${lang}/blog/">
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <meta property="og:title" content="${t.blogTitle} — AetherLink">
    <meta property="og:description" content="${escHtml(t.blogSubtitle)}">
    <meta property="og:url" content="https://aetherlink.ai/${lang}/blog/">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${t.locale}">
    <meta property="og:site_name" content="AetherLink.ai">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${t.blogTitle} — AetherLink">
    <meta name="twitter:description" content="${escHtml(t.blogSubtitle)}">
    <link rel="alternate" hreflang="nl" href="https://aetherlink.ai/nl/blog/">
    <link rel="alternate" hreflang="en" href="https://aetherlink.ai/en/blog/">
    <link rel="alternate" hreflang="fi" href="https://aetherlink.ai/fi/blog/">
    <link rel="alternate" hreflang="x-default" href="https://aetherlink.ai/nl/blog/">
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org", "@type": "Blog",
      name: `AetherLink ${t.blogTitle}`,
      description: t.blogSubtitle,
      url: `https://aetherlink.ai/${lang}/blog/`,
      publisher: { "@type": "Organization", name: "AetherLink", url: "https://aetherlink.ai" },
      inLanguage: lang,
    })}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>${TAILWIND_CONFIG}</script>
    <style>${SHARED_CSS}</style>
    <link rel="stylesheet" href="/css/theme.css">
    <script src="/js/theme.js"></script>
</head>`;

  return `${indexHead}
${navHTML(dummyPost, lang, true)}

        <!-- BLOG HERO -->
        <section class="relative min-h-[50vh] flex items-end overflow-hidden pt-24 pb-16">
            <div class="orb" style="width:600px;height:600px;background:radial-gradient(circle,rgba(139,92,246,0.2),transparent 70%);top:0;left:-15%;animation:orbit-1 30s ease-in-out infinite"></div>
            <div class="orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(0,212,255,0.12),transparent 70%);bottom:5%;right:-10%;animation:orbit-2 25s ease-in-out infinite"></div>
            <div class="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
                <h1 class="font-display font-800 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] mb-6 reveal">
                    <span class="gradient-text-violet">${t.blogTitle}</span>
                </h1>
                <p class="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto reveal reveal-delay-1">${t.blogSubtitle}</p>
            </div>
        </section>

        <!-- CATEGORY FILTERS -->
        <section class="pb-8">
            <div class="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-3 reveal">
                <button class="filter-btn active px-5 py-2.5 rounded-full font-display font-600 text-sm border border-white/10 bg-white/5 text-light transition-all hover:bg-white/10" data-filter="all">${t.filterAll}</button>
                <button class="filter-btn px-5 py-2.5 rounded-full font-display font-600 text-sm border border-white/10 text-muted transition-all hover:bg-white/5 hover:text-light" data-filter="aetherbot">${t.filterBot}</button>
                <button class="filter-btn px-5 py-2.5 rounded-full font-display font-600 text-sm border border-white/10 text-muted transition-all hover:bg-white/5 hover:text-light" data-filter="aethermind">${t.filterMind}</button>
                <button class="filter-btn px-5 py-2.5 rounded-full font-display font-600 text-sm border border-white/10 text-muted transition-all hover:bg-white/5 hover:text-light" data-filter="aetherdev">${t.filterDev}</button>
            </div>
        </section>

        <!-- POSTS GRID -->
        <section class="py-12 lg:py-16">
            <div class="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8" id="posts-grid">
            ${postCards}
            </div>
        </section>

        <!-- CTA -->
        <section class="cta-gradient py-32 lg:py-40 relative overflow-hidden">
            <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
                <h2 class="font-display font-800 text-3xl md:text-5xl text-light leading-tight mb-8 reveal">${t.ctaTitle}</h2>
                <p class="text-lg text-muted leading-relaxed mb-12 reveal reveal-delay-1">${t.ctaText}</p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 reveal reveal-delay-2">
                    <a href="https://calendly.com/aetherlink" class="btn-primary"><span>${t.ctaPrimary}</span><span class="relative z-[1]">&rarr;</span></a>
                    <a href="${p.aethermind}" class="btn-secondary">${t.ctaSecondary}</a>
                </div>
            </div>
        </section>

${footerHTML(lang).replace('</body>', `
    <script>
    // Category filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active','bg-white/5','text-light'); b.classList.add('text-muted'); });
            btn.classList.add('active','bg-white/5','text-light'); btn.classList.remove('text-muted');
            const f = btn.dataset.filter;
            document.querySelectorAll('#posts-grid > a').forEach(card => {
                card.style.display = (f === 'all' || card.dataset.category === f) ? '' : 'none';
            });
        });
    });
    </script>
</body>`)}`;
}

// ═══ Export i18n for other modules ═══
export { i18n, navPages, formatDate, getSlug, getTitle, getDescription, escHtml };
