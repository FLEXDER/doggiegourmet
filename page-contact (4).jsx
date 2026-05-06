/* global React, Icon */
const { useState: uSCC } = React;

// Constantes para llamar a Supabase Edge Function
const CONTACT_SUPABASE_URL = 'https://oaurovkvyrywmdsjhgaj.supabase.co';
const CONTACT_SUPABASE_KEY = 'sb_publishable_4ORlrwn6sRWVEQ_XTwiOwQ_wbI0UTwF';
const CONTACT_WHATSAPP = '523318440265';
const CONTACT_INSTAGRAM = 'doggie_gourmet';
const CONTACT_EMAIL = 'doggiegourmetmx@gmail.com';

function ContactPage({ setRoute }) {
  const [name, setName] = uSCC('');
  const [email, setEmail] = uSCC('');
  const [phone, setPhone] = uSCC('');
  const [business, setBusiness] = uSCC('');
  const [message, setMessage] = uSCC('');
  const [sending, setSending] = uSCC(false);
  const [feedback, setFeedback] = uSCC(null); // { type: 'success' | 'error', text: string }

  const isValid =
    name.trim().length > 0 &&
    email.trim().includes('@') &&
    message.trim().length >= 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || sending) return;

    setSending(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `${CONTACT_SUPABASE_URL}/functions/v1/submit-contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': CONTACT_SUPABASE_KEY,
            'Authorization': `Bearer ${CONTACT_SUPABASE_KEY}`
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
            business: business.trim() || null,
            message: message.trim()
          })
        }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Error al enviar el mensaje');
      }

      const data = await response.json();
      setFeedback({
        type: 'success',
        text: `¡Mensaje recibido! Te responderemos pronto. Ref: #${data.message_number}`
      });
      // Limpiar form
      setName('');
      setEmail('');
      setPhone('');
      setBusiness('');
      setMessage('');
    } catch (err) {
      console.error('Error enviando contacto:', err);
      setFeedback({
        type: 'error',
        text: 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.'
      });
    } finally {
      setSending(false);
    }
  };

  // Estilos inline (no dependemos de styles.css)
  const S = {
    page: {
      background: 'var(--paper, #F8F4E8)',
      minHeight: '100vh',
      padding: '80px 0 100px'
    },
    container: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 24px'
    },
    eyebrow: {
      fontSize: 12,
      letterSpacing: '0.18em',
      fontWeight: 700,
      color: 'var(--green, #73963C)',
      marginBottom: 16,
      textTransform: 'uppercase'
    },
    heroGrid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      gap: 60,
      alignItems: 'start',
      marginBottom: 60
    },
    h1: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontSize: 'clamp(40px, 6vw, 72px)',
      fontWeight: 700,
      color: 'var(--brown, #4A3B10)',
      lineHeight: 1.05,
      margin: 0,
      letterSpacing: '-0.02em'
    },
    h1Em: {
      fontFamily: '"Instrument Serif", serif',
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'var(--green, #73963C)'
    },
    lede: {
      fontSize: 18,
      lineHeight: 1.6,
      color: 'var(--brown, #4A3B10)',
      opacity: 0.85,
      marginTop: 24
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
      gap: 40,
      alignItems: 'start'
    },
    leftCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    },
    card: {
      background: 'var(--cream, #F2E9BD)',
      borderRadius: 24,
      padding: 32,
      border: '1px solid rgba(115, 150, 60, 0.15)'
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: 'rgba(115, 150, 60, 0.18)',
      color: 'var(--green-dark, #5C7A2F)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24
    },
    cardTitle: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--brown, #4A3B10)',
      margin: '0 0 8px'
    },
    cardSub: {
      fontSize: 14,
      color: 'var(--brown, #4A3B10)',
      opacity: 0.7,
      lineHeight: 1.5,
      margin: '0 0 12px'
    },
    cardLink: {
      color: 'var(--green-dark, #5C7A2F)',
      fontWeight: 600,
      fontSize: 16,
      textDecoration: 'none'
    },
    formCard: {
      background: 'var(--cream, #F2E9BD)',
      borderRadius: 24,
      padding: 40,
      border: '1px solid rgba(115, 150, 60, 0.15)'
    },
    formTitle: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--brown, #4A3B10)',
      margin: '0 0 28px'
    },
    fieldRow: {
      marginBottom: 20
    },
    labelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    },
    label: {
      fontSize: 11,
      letterSpacing: '0.15em',
      fontWeight: 700,
      color: 'var(--brown, #4A3B10)',
      textTransform: 'uppercase'
    },
    labelHint: {
      fontSize: 10,
      letterSpacing: '0.15em',
      fontWeight: 600,
      color: 'var(--brown, #4A3B10)',
      opacity: 0.5,
      textTransform: 'uppercase'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      borderRadius: 999,
      background: 'rgba(248, 244, 232, 0.6)',
      border: '1px solid rgba(115, 150, 60, 0.2)',
      fontSize: 15,
      fontFamily: 'inherit',
      color: 'var(--brown, #4A3B10)',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      width: '100%',
      padding: '14px 18px',
      borderRadius: 18,
      background: 'rgba(248, 244, 232, 0.6)',
      border: '1px solid rgba(115, 150, 60, 0.2)',
      fontSize: 15,
      fontFamily: 'inherit',
      color: 'var(--brown, #4A3B10)',
      outline: 'none',
      boxSizing: 'border-box',
      minHeight: 120,
      resize: 'vertical',
      lineHeight: 1.5,
      transition: 'border-color 0.2s ease'
    },
    submitBtn: {
      marginTop: 12,
      padding: '16px 40px',
      borderRadius: 999,
      background: 'var(--green, #73963C)',
      color: '#fff',
      fontSize: 16,
      fontWeight: 600,
      fontFamily: 'inherit',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      transition: 'all 0.2s ease'
    },
    feedbackOk: {
      marginTop: 16,
      padding: '14px 18px',
      borderRadius: 14,
      background: 'rgba(115, 150, 60, 0.15)',
      color: 'var(--green-dark, #5C7A2F)',
      fontSize: 14,
      fontWeight: 500,
      border: '1px solid rgba(115, 150, 60, 0.3)'
    },
    feedbackErr: {
      marginTop: 16,
      padding: '14px 18px',
      borderRadius: 14,
      background: 'rgba(190, 80, 60, 0.12)',
      color: '#7a3329',
      fontSize: 14,
      fontWeight: 500,
      border: '1px solid rgba(190, 80, 60, 0.25)'
    }
  };

  // Estilo responsive: detectar si es mobile y reaccionar a cambios de tamaño
  const [isMobile, setIsMobile] = uSCC(
    typeof window !== 'undefined' && window.innerWidth < 900
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const heroGridFinal = isMobile
    ? { ...S.heroGrid, gridTemplateColumns: '1fr', gap: 24 }
    : S.heroGrid;
  const gridFinal = isMobile
    ? { ...S.grid, gridTemplateColumns: '1fr', gap: 24 }
    : S.grid;

  // En mobile: cards en grid 2x2 (Correo+Teléfono arriba, Instagram+Cocina abajo)
  // En desktop: stack vertical como antes
  const leftColFinal = isMobile
    ? {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }
    : S.leftCol;

  // En mobile: cards más compactas (menos padding, icono más chico)
  const cardFinal = isMobile
    ? { ...S.card, padding: 18, borderRadius: 18 }
    : S.card;
  const cardIconFinal = isMobile
    ? { ...S.cardIcon, width: 38, height: 38, marginBottom: 14, borderRadius: 11 }
    : S.cardIcon;
  const cardTitleFinal = isMobile
    ? { ...S.cardTitle, fontSize: 16, marginBottom: 4 }
    : S.cardTitle;
  const cardSubFinal = isMobile
    ? { ...S.cardSub, fontSize: 12, marginBottom: 8 }
    : S.cardSub;
  const cardLinkFinal = isMobile
    ? { ...S.cardLink, fontSize: 13, wordBreak: 'break-word' }
    : S.cardLink;

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* Hero */}
        <div style={heroGridFinal}>
          <div>
            <div style={S.eyebrow}>Contacto</div>
            <h1 style={S.h1}>
              Estamos <em style={S.h1Em}>para ayudarte.</em>
            </h1>
          </div>
          <div>
            <p style={S.lede}>
              Dudas, distribución o solo saludar. Respondemos cada mensaje, normalmente en menos de un día.
            </p>
          </div>
        </div>

        {/* Grid: 4 cards a la izquierda, form a la derecha */}
        <div style={gridFinal}>

          {/* Columna izquierda: cards */}
          <div style={leftColFinal}>

            {/* Correo */}
            <div style={cardFinal}>
              <div style={cardIconFinal}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <path d="m3 7 9 6 9-6"/>
                </svg>
              </div>
              <h3 style={cardTitleFinal}>Correo</h3>
              <p style={cardSubFinal}>Información, preguntas, colaboraciones.</p>
              <a href={`mailto:${CONTACT_EMAIL}`} style={cardLinkFinal}>{CONTACT_EMAIL}</a>
            </div>

            {/* Teléfono y WhatsApp */}
            <div style={cardFinal}>
              <div style={cardIconFinal}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3 style={cardTitleFinal}>Teléfono y WhatsApp</h3>
              <p style={cardSubFinal}>Lun–Vie, 9am–6pm</p>
              <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" style={cardLinkFinal}>+52 33 1844 0265</a>
            </div>

            {/* Instagram */}
            <div style={cardFinal}>
              <div style={cardIconFinal}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <h3 style={cardTitleFinal}>Instagram</h3>
              <p style={cardSubFinal}>Síguenos para nuevos lotes y consejos</p>
              <a href={`https://instagram.com/${CONTACT_INSTAGRAM}`} target="_blank" rel="noopener noreferrer" style={cardLinkFinal}>@{CONTACT_INSTAGRAM}</a>
            </div>

            {/* Cocina y oficina */}
            <div style={cardFinal}>
              <div style={cardIconFinal}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 style={cardTitleFinal}>Cocina y oficina</h3>
              <p style={cardSubFinal}>
                Av. Topacio 2451<br/>
                Guadalajara, Jalisco · México
              </p>
            </div>

          </div>

          {/* Columna derecha: form */}
          <div style={S.formCard}>
            <h2 style={S.formTitle}>Envíanos un mensaje</h2>

            <form onSubmit={handleSubmit}>

              <div style={S.fieldRow}>
                <div style={S.labelRow}>
                  <span style={S.label}>Tu nombre</span>
                  <span style={S.labelHint}>Requerido</span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  style={S.input}
                  maxLength={200}
                  required
                />
              </div>

              <div style={S.fieldRow}>
                <div style={S.labelRow}>
                  <span style={S.label}>Correo</span>
                  <span style={S.labelHint}>Requerido</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  style={S.input}
                  maxLength={200}
                  required
                />
              </div>

              <div style={S.fieldRow}>
                <div style={S.labelRow}>
                  <span style={S.label}>Teléfono</span>
                  <span style={S.labelHint}>Opcional</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="33 1234 5678"
                  style={S.input}
                  maxLength={50}
                />
              </div>

              <div style={S.fieldRow}>
                <div style={S.labelRow}>
                  <span style={S.label}>Negocio</span>
                  <span style={S.labelHint}>Opcional</span>
                </div>
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="VetCare Guadalajara"
                  style={S.input}
                  maxLength={200}
                />
              </div>

              <div style={S.fieldRow}>
                <div style={S.labelRow}>
                  <span style={S.label}>Mensaje</span>
                  <span style={S.labelHint}>Requerido</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos cómo te podemos ayudar..."
                  style={S.textarea}
                  maxLength={2000}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!isValid || sending}
                style={{
                  ...S.submitBtn,
                  opacity: (!isValid || sending) ? 0.5 : 1,
                  cursor: (!isValid || sending) ? 'not-allowed' : 'pointer'
                }}
              >
                {sending ? 'Enviando...' : 'Enviar mensaje'}
                {!sending && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>

              {feedback && (
                <div style={feedback.type === 'success' ? S.feedbackOk : S.feedbackErr}>
                  {feedback.text}
                </div>
              )}

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

window.ContactPage = ContactPage;
