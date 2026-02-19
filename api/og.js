import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

// Cache across warm invocations
let fontData = null;
let wasmInitialized = false;

async function initResvg() {
  if (wasmInitialized) return;
  try {
    const wasmRes = await fetch('https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm');
    const wasmBuffer = await wasmRes.arrayBuffer();
    await initWasm(wasmBuffer);
    wasmInitialized = true;
  } catch (e) {
    if (e.message && e.message.includes('Already initialized')) {
      wasmInitialized = true;
    } else {
      throw e;
    }
  }
}

async function loadFont() {
  if (fontData) return fontData;
  const res = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2'
  );
  fontData = await res.arrayBuffer();
  return fontData;
}

// Page metadata for generating contextual OG images
const PAGE_META = {
  'home-nl': { title: 'AetherLink.ai', sub: 'AI-oplossingen voor Europese bedrijven', accent: '#00C9A7' },
  'home-en': { title: 'AetherLink.ai', sub: 'AI Solutions for European Business', accent: '#00C9A7' },
  'home-fi': { title: 'AetherLink.ai', sub: 'Tekoalyratkaisut eurooppalaisille yrityksille', accent: '#00C9A7' },
  'aetherbot': { title: 'AetherBOT', sub: 'Intelligent AI Chatbot Platform', accent: '#0066FF' },
  'aethermind': { title: 'AetherMIND', sub: 'AI Strategy & Intelligence', accent: '#7B68EE' },
  'aetherdev': { title: 'AetherDEV', sub: 'AI Development Platform', accent: '#00C9A7' },
  'ai-lead-architect-nl': { title: 'AI Lead Architect', sub: 'Fractional AI Architecture voor Nederland', accent: '#0066FF' },
  'ai-consultancy-nl': { title: 'AI Consultancy', sub: 'Strategie, Training & Implementatie', accent: '#7B68EE' },
  'ai-verandermanagement': { title: 'AI Verandermanagement', sub: 'Mensgerichte AI Transformatie', accent: '#00C9A7' },
  'ai-lead-architect-en': { title: 'AI Lead Architect', sub: 'Fractional AI Architecture for Europe', accent: '#0066FF' },
  'ai-consultancy-en': { title: 'AI Consultancy', sub: 'Strategy, Training & Implementation', accent: '#7B68EE' },
  'ai-change-management': { title: 'AI Change Management', sub: 'Human-Centered AI Transformation', accent: '#00C9A7' },
  'ai-lead-architect-fi': { title: 'AI Lead Architect', sub: 'Tekoalyarkkitehtuuri Eurooppaan', accent: '#0066FF' },
  'ai-consultancy-fi': { title: 'Tekoalykonsultointi', sub: 'Strategia, Koulutus & Toteutus', accent: '#7B68EE' },
  'ai-muutoshallinta': { title: 'Tekoalyn muutoshallinta', sub: 'Ihmiskeskeinen tekoalymuutos', accent: '#00C9A7' },
};

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const page = url.searchParams.get('page') || 'home-en';
    const customTitle = url.searchParams.get('title');
    const customSub = url.searchParams.get('sub');

    const meta = PAGE_META[page] || PAGE_META['home-en'];
    const title = customTitle || meta.title;
    const sub = customSub || meta.sub;
    const accent = meta.accent || '#00C9A7';

    const [font] = await Promise.all([loadFont(), initResvg()]);

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px',
            background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1B2A 40%, #1B2838 100%)',
            fontFamily: 'Inter',
            position: 'relative',
          },
          children: [
            // Top accent bar
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: `linear-gradient(90deg, ${accent}, #0066FF, #7B68EE)`,
                  display: 'flex',
                },
              },
            },
            // Logo area
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '40px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${accent}, #0066FF)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'white',
                      },
                      children: 'A',
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#94A3B8',
                        letterSpacing: '0.05em',
                      },
                      children: 'AETHERLINK.AI',
                    },
                  },
                ],
              },
            },
            // Main title
            {
              type: 'div',
              props: {
                style: {
                  fontSize: title.length > 25 ? '56px' : '72px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                  marginBottom: '20px',
                  display: 'flex',
                },
                children: title,
              },
            },
            // Subtitle
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#94A3B8',
                  lineHeight: 1.4,
                  display: 'flex',
                },
                children: sub,
              },
            },
            // Bottom accent
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: '40px',
                  left: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: accent,
                        display: 'flex',
                      },
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '16px',
                        color: '#64748B',
                        letterSpacing: '0.1em',
                      },
                      children: 'AI Solutions for European Business',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: font,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    });
    const png = resvg.render().asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    res.send(Buffer.from(png));
  } catch (error) {
    console.error('OG image error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
