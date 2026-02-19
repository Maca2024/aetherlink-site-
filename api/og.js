import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Page metadata for generating contextual OG images
const PAGE_META = {
  // Homepages
  'home-nl': { title: 'AetherLink.ai', sub: 'AI-oplossingen voor Europese bedrijven', accent: '#00C9A7' },
  'home-en': { title: 'AetherLink.ai', sub: 'AI Solutions for European Business', accent: '#00C9A7' },
  'home-fi': { title: 'AetherLink.ai', sub: 'Tekoälyratkaisut eurooppalaisille yrityksille', accent: '#00C9A7' },
  // Products
  'aetherbot': { title: 'AetherBOT', sub: 'Intelligent AI Chatbot Platform', accent: '#0066FF' },
  'aethermind': { title: 'AetherMIND', sub: 'AI Strategy & Intelligence', accent: '#7B68EE' },
  'aetherdev': { title: 'AetherDEV', sub: 'AI Development Platform', accent: '#00C9A7' },
  // Expertise NL
  'ai-lead-architect-nl': { title: 'AI Lead Architect', sub: 'Fractional AI Architecture voor Nederland', accent: '#0066FF' },
  'ai-consultancy-nl': { title: 'AI Consultancy', sub: 'Strategie, Training & Implementatie', accent: '#7B68EE' },
  'ai-verandermanagement': { title: 'AI Verandermanagement', sub: 'Mensgerichte AI Transformatie', accent: '#00C9A7' },
  // Expertise EN
  'ai-lead-architect-en': { title: 'AI Lead Architect', sub: 'Fractional AI Architecture for Europe', accent: '#0066FF' },
  'ai-consultancy-en': { title: 'AI Consultancy', sub: 'Strategy, Training & Implementation', accent: '#7B68EE' },
  'ai-change-management': { title: 'AI Change Management', sub: 'Human-Centered AI Transformation', accent: '#00C9A7' },
  // Expertise FI
  'ai-lead-architect-fi': { title: 'AI Lead Architect', sub: 'Tekoälyarkkitehtuuri Eurooppaan', accent: '#0066FF' },
  'ai-consultancy-fi': { title: 'Tekoälykonsultointi', sub: 'Strategia, Koulutus & Toteutus', accent: '#7B68EE' },
  'ai-muutoshallinta': { title: 'Tekoälyn muutoshallinta', sub: 'Ihmiskeskeinen tekoälymuutos', accent: '#00C9A7' },
};

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || 'home-en';
    const customTitle = url.searchParams.get('title');
    const customSub = url.searchParams.get('sub');

    const meta = PAGE_META[page] || PAGE_META['home-en'];
    const title = customTitle || meta.title;
    const sub = customSub || meta.sub;
    const accent = meta.accent || '#00C9A7';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '80px',
            background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1B2A 40%, #1B2838 100%)',
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orb top-right */}
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '-80px',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
              display: 'flex',
            }}
          />
          {/* Decorative orb bottom-left */}
          <div
            style={{
              position: 'absolute',
              bottom: '-200px',
              left: '-100px',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #0066FF15 0%, transparent 70%)',
              display: 'flex',
            }}
          />
          {/* Top bar accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${accent}, #0066FF, #7B68EE)`,
              display: 'flex',
            }}
          />

          {/* Logo area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            {/* Simple geometric logo mark */}
            <div
              style={{
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
              }}
            >
              A
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#94A3B8',
                letterSpacing: '0.05em',
              }}
            >
              AETHERLINK.AI
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: title.length > 25 ? '56px' : '72px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '20px',
              maxWidth: '900px',
              display: 'flex',
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: '#94A3B8',
              lineHeight: 1.4,
              maxWidth: '800px',
              display: 'flex',
            }}
          >
            {sub}
          </div>

          {/* Bottom accent */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: accent,
                display: 'flex',
              }}
            />
            <span
              style={{
                fontSize: '16px',
                color: '#64748B',
                letterSpacing: '0.1em',
              }}
            >
              AI Solutions for European Business
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG image error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
