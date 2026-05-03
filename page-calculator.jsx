/* global React, Icon, EMAIL */
const { useState: uSC, useMemo: uMC, useEffect: uEC, useRef: uRC } = React;
const { BREEDS, FEEDING_TABLE, ACTIVITY_MULT } = window;

/* ============================================================
   LÍMITES DE PESO POR ESPECIE
   - MIN: rango razonable mínimo (chihuahuas ~1kg, gatos pequeños)
   - MAX_SLIDER: tope del slider visual
   - MAX_HARD: tope absoluto - no se acepta nada arriba de esto
   - WARN: si el peso supera este valor, mostramos confirmación
   ============================================================ */
const WEIGHT_LIMITS = {
  perro: { min: 1, max_slider: 50, max_hard: 90, warn: 60 },
  gato:  { min: 1, max_slider: 12, max_hard: 15, warn: 10 },
};

const DEFAULT_WEIGHT = { perro: 15, gato: 5 };

function interpolateRow(peso, edadKey) {
  const t = FEEDING_TABLE;
  if (peso <= t[0].peso) return t[0][edadKey];
  if (peso >= t[t.length - 1].peso) return t[t.length - 1][edadKey];
  for (let i = 0; i < t.length - 1; i++) {
    if (peso >= t[i].peso && peso <= t[i+1].peso) {
      const ratio = (peso - t[i].peso) / (t[i+1].peso - t[i].peso);
      return t[i][edadKey] + (t[i+1][edadKey] - t[i][edadKey]) * ratio;
    }
  }
  return t[0][edadKey];
}

function suggestProduct(peso, especie) {
  if (especie === 'gato') {
    return {
      id: 'barf-cats-250',
      name: 'Original Gatos',
      size: '250 g',
      gramsPerBag: 250,
      img: 'assets/products/barf-gatos-250.webp',
      tag: 'Felinos',
      desc: 'Balanceado para gatos con taurina y proteína de alta calidad.',
    };
  }
  if (peso < 8) {
    return {
      id: 'barf-original-250',
      name: 'Original Perros Chicos',
      size: '250 g',
      gramsPerBag: 250,
      img: 'assets/products/barf-original-perros-chicos-250.webp',
      tag: 'Razas pequeñas',
      desc: 'Porciones de 250 g para razas pequeñas y cachorros.',
    };
  }
  if (peso >= 18) {
    return {
      id: 'barf-premium-500',
      name: 'Premium',
      size: '500 g',
      gramsPerBag: 500,
      img: 'assets/products/barf-premium-500.webp',
      tag: '70% Pollo · 30% Carne',
      desc: 'Mezcla con carne de res para perros activos y de talla mediana–grande.',
    };
  }
  return {
    id: 'barf-original-500',
    name: 'Original',
    size: '500 g',
    gramsPerBag: 500,
    img: 'assets/products/barf-original-500.webp',
    tag: 'Pollo',
    desc: 'Nuestra fórmula favorita para perros adultos de talla mediana.',
  };
}

const ESPECIES = [
  { id: 'perro', label: 'Perro' },
  { id: 'gato', label: 'Gato' },
];

const EDADES = [
  { id: 'cachorro', label: 'Cachorro', sub: '2 a 6 meses', icon: 'paw' },
  { id: 'joven', label: 'Joven', sub: '6 a 12 meses', icon: 'sparkle' },
  { id: 'adulto', label: 'Adulto', sub: '1 año en adelante', icon: 'shield' },
];

const ACTIVIDADES = [
  { id: 'baja', label: 'Baja', sub: 'Casa, paseos cortos', mult: 0.9 },
  { id: 'moderada', label: 'Moderada', sub: '30–60 min al día', mult: 1.0 },
  { id: 'alta', label: 'Alta', sub: 'Corre, entrena, trabaja', mult: 1.15 },
];

const PERIODOS = [
  { id: 'quincenal', label: 'Quincenal', sub: 'Cada 15 días' },
  { id: 'mensual', label: 'Mensual', sub: 'Cada 30 días' },
];

const TIPS = [
  'Esto toma menos de 30 segundos.',
  'Recomendación 100% personalizada.',
  'Basado en nutrición BARF real.',
];

const TOTAL_STEPS = 6;

function useCountUp(target, duration = 800) {
  const [val, setVal] = uSC(0);
  const startTime = uRC(null);
  const rafRef = uRC(null);
  uEC(() => {
    startTime.current = null;
    cancelAnimationFrame(rafRef.current);
    const step = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

function CalculatorPage({ setRoute }) {
  const [step, setStep] = uSC(0); // 0..5 form steps, 6 = loading, 7 = result
  const [especie, setEspecieRaw] = uSC('perro');
  const [peso, setPesoRaw] = uSC(15);
  const [raza, setRaza] = uSC('Mestizo / Sin raza');
  const [razaSearch, setRazaSearch] = uSC('');
  const [edad, setEdad] = uSC('adulto');
  const [actividad, setActividad] = uSC('moderada');
  const [periodo, setPeriodo] = uSC('mensual');
  const [perros, setPerros] = uSC(1);

  // Límites actuales según la especie
  const limits = WEIGHT_LIMITS[especie];

  // Setter de peso con clamping (no permite valores fuera del rango)
  const setPeso = (val) => {
    const num = Number(val);
    if (isNaN(num) || num <= 0) return setPesoRaw(0); // Permite vacío para que pueda escribir
    const clamped = Math.min(Math.max(num, 0), limits.max_hard);
    setPesoRaw(clamped);
  };

  // Cambio de especie: ajusta el peso si quedó fuera del rango nuevo
  const setEspecie = (nueva) => {
    setEspecieRaw(nueva);
    const newLimits = WEIGHT_LIMITS[nueva];
    if (peso < newLimits.min || peso > newLimits.max_slider) {
      setPesoRaw(DEFAULT_WEIGHT[nueva]);
    }
  };

  // Indicador de peso "sospechoso" para mostrar advertencia
  const isWeightSuspicious = peso >= limits.warn;
  const isWeightInvalid = peso <= 0 || peso > limits.max_hard;

  // Filtered breeds for search
  const filteredBreeds = uMC(() => {
    if (!razaSearch.trim()) return BREEDS;
    const q = razaSearch.toLowerCase();
    return BREEDS.filter(b => b.toLowerCase().includes(q));
  }, [razaSearch]);

  const calc = uMC(() => {
    const baseBolsasMes = interpolateRow(Number(peso) || 0, edad);
    const mult = ACTIVITY_MULT[actividad];
    const product = suggestProduct(Number(peso) || 0, especie);
    const gramosBase500 = (baseBolsasMes * 500) / 30;
    const gramosDia = gramosBase500 * mult;
    const bagsDia = gramosDia / product.gramsPerBag;
    const bagsQuincena = bagsDia * 15 * (Number(perros) || 1);
    const bagsMes = bagsDia * 30 * (Number(perros) || 1);
    return {
      gramosDia: Math.round(gramosDia),
      gramosTotalDia: Math.round(gramosDia * (Number(perros) || 1)),
      product,
      bagsDia,
      bagsQuincena: Math.ceil(bagsQuincena),
      bagsMes: Math.ceil(bagsMes),
      mult,
    };
  }, [peso, edad, actividad, perros, especie]);

  const periodoData = uMC(() => {
    if (periodo === 'quincenal') return { label: 'cada 15 días', bolsas: calc.bagsQuincena, dias: 15 };
    return { label: 'cada 30 días', bolsas: calc.bagsMes, dias: 30 };
  }, [periodo, calc]);

  const tamañoLabel = uMC(() => {
    if (especie === 'gato') return 'Gato';
    if (peso < 8) return 'Perro pequeño';
    if (peso < 25) return 'Perro mediano';
    return 'Perro grande';
  }, [peso, especie]);

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else if (step === TOTAL_STEPS - 1) {
      setStep(TOTAL_STEPS); // loading
      setTimeout(() => setStep(TOTAL_STEPS + 1), 1600);
    }
  };
  const prev = () => { if (step > 0 && step < TOTAL_STEPS) setStep(s => s - 1); };
  const restart = () => { setStep(0); window.scrollTo({top: 0, behavior: 'smooth'}); };

  // Auto-advance helpers
  const pickAndNext = (setter, value) => {
    setter(value);
    setTimeout(() => next(), 280);
  };

  const buildOrderUrl = () => {
    const phone = '523318440265';
    const especieLabel = especie === 'gato' ? 'Gato' : 'Perro';
    const edadLabel = EDADES.find(e => e.id === edad).label;
    const actividadLabel = ACTIVIDADES.find(a => a.id === actividad).label;
    const periodoLabel = periodo === 'quincenal' ? 'Quincenal' : 'Mensual';
    const productoLabel = `${calc.product.name} (${calc.product.tag})`;
    const presentacionLabel = `${calc.product.size} por bolsa`;

    const message =
`¡Hola Doggie Gourmet! Calculé la dieta personalizada para mi mascota, quisiera confirmar si es correcta

Mascota: ${especieLabel}
Raza: ${raza}
Peso: ${peso} kg
Edad: ${edadLabel}
Actividad: ${actividadLabel}
Cantidad: ${perros}
Periodo: ${periodoLabel}

Producto recomendado: ${productoLabel}
Porción diaria: ${calc.gramosDia} g
Bolsas recomendadas: ${periodoData.bolsas}
Presentación: ${presentacionLabel}

Quiero entrega a domicilio.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const buildAsesorUrl = () => {
    const phone = '523318440265';
    const message = 'Hola Doggie Gourmet, quiero hablar con un asesor sobre la dieta BARF para mi mascota.';
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="calc2-page">
      <div className="calc2-bg-orb calc2-bg-orb-1"/>
      <div className="calc2-bg-orb calc2-bg-orb-2"/>

      <div className="container calc2-container">
        {step < TOTAL_STEPS && (
          <header className="calc2-head">
            <div className="calc2-eyebrow"><Icon name="sparkle" size={12}/> &nbsp;Asistente Nutricional</div>
            <h1 className="calc2-title">Calculadora <em>BARF</em></h1>
            <p className="calc2-sub">{TIPS[step % TIPS.length]}</p>

            <div className="calc2-progress">
              <div className="calc2-progress-bar">
                <div className="calc2-progress-fill" style={{width: `${((step + 1) / TOTAL_STEPS) * 100}%`}}/>
              </div>
              <div className="calc2-progress-meta">
                <span>Paso <strong>{step + 1}</strong> / {TOTAL_STEPS}</span>
                <span className="calc2-progress-pct">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
              </div>
            </div>
          </header>
        )}

        <div className="calc2-stage">
          {step === 0 && (
            <Step key="s0" title="¿Cuánto pesa tu mascota?" hint="Si no estás seguro, está bien aproximar.">
              <div className="calc2-species">
                {ESPECIES.map(e => (
                  <button key={e.id} className={`calc2-species-pill ${especie === e.id ? 'active' : ''}`} onClick={() => setEspecie(e.id)}>
                    {e.label}
                  </button>
                ))}
              </div>
              <div className="calc2-weight-display">
                <span className="calc2-weight-num">{peso}</span>
                <span className="calc2-weight-unit">kg</span>
              </div>
              <div className="calc2-weight-tag">{tamañoLabel}</div>
              <div className="calc2-weight-slider-wrap">
                <input
                  type="range" min={limits.min} max={limits.max_slider} step="0.5" value={Math.min(peso, limits.max_slider)}
                  onChange={e => setPeso(Number(e.target.value))}
                  className="calc2-slider"
                  style={{'--pct': `${((Math.min(peso, limits.max_slider) - limits.min)/(limits.max_slider - limits.min))*100}%`}}
                />
                <div className="calc2-weight-marks">
                  <span>{limits.min} kg</span>
                  <span>{Math.round((limits.min + limits.max_slider) / 2)} kg</span>
                  <span>{limits.max_slider} kg</span>
                </div>
              </div>
              <div className="calc2-manual">
                <span>O ingresa manualmente:</span>
                <input
                  type="number"
                  min={limits.min}
                  max={limits.max_hard}
                  step="0.5"
                  value={peso || ''}
                  onChange={e => setPeso(e.target.value)}
                  placeholder="kg"
                />
                <span>kg</span>
              </div>
              {isWeightSuspicious && peso <= limits.max_hard && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(220, 150, 50, 0.12)', border: '1px solid rgba(220, 150, 50, 0.3)',
                  color: 'var(--brown)', fontSize: 14, lineHeight: 1.5
                }}>
                  ⚠️ <strong>{peso} kg es un peso inusual</strong> para {especie === 'gato' ? 'un gato' : 'un perro'}.
                  ¿Estás seguro? Si lo escribiste por error, ajusta el valor antes de continuar.
                </div>
              )}
              {peso === 0 && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(200, 50, 50, 0.08)', border: '1px solid rgba(200, 50, 50, 0.2)',
                  color: '#a33', fontSize: 14
                }}>
                  Ingresa el peso de tu mascota para continuar.
                </div>
              )}
              <StepFooter step={step} onPrev={prev} onNext={next} nextDisabled={isWeightInvalid}/>
            </Step>
          )}

          {step === 1 && (
            <Step key="s1" title={especie === 'gato' ? '¿De qué raza?' : '¿Qué raza es?'} hint="Solo nos ayuda a personalizar tu recomendación.">
              <div className="calc2-search-wrap">
                <input
                  className="calc2-search"
                  placeholder="Buscar raza..."
                  value={razaSearch}
                  onChange={e => setRazaSearch(e.target.value)}
                />
              </div>
              <div className="calc2-breeds">
                {filteredBreeds.map(b => (
                  <button key={b} className={`calc2-breed ${raza === b ? 'active' : ''}`} onClick={() => setRaza(b)}>
                    {raza === b && <span className="calc2-breed-check"><Icon name="check" size={12}/></span>}
                    {b}
                  </button>
                ))}
                {filteredBreeds.length === 0 && (
                  <div className="calc2-breed-empty">No encontramos esa raza. Selecciona "Mestizo / Sin raza".</div>
                )}
              </div>
              <StepFooter step={step} onPrev={prev} onNext={next}/>
            </Step>
          )}

          {step === 2 && (
            <Step key="s2" title="¿Cuál es su edad?" hint="Los más jóvenes comen más por kilo de peso.">
              <div className="calc2-cards">
                {EDADES.map(e => (
                  <button key={e.id} className={`calc2-card ${edad === e.id ? 'active' : ''}`} onClick={() => pickAndNext(setEdad, e.id)}>
                    <div className="calc2-card-icon"><Icon name={e.icon} size={26}/></div>
                    <div className="calc2-card-title">{e.label}</div>
                    <div className="calc2-card-sub">{e.sub}</div>
                    {edad === e.id && <span className="calc2-card-check"><Icon name="check" size={14}/></span>}
                  </button>
                ))}
              </div>
              <StepFooter step={step} onPrev={prev} onNext={next}/>
            </Step>
          )}

          {step === 3 && (
            <Step key="s3" title="¿Qué tan activo es?" hint="Cuanto más activo, más necesita comer.">
              <div className="calc2-cards">
                {ACTIVIDADES.map(a => (
                  <button key={a.id} className={`calc2-card ${actividad === a.id ? 'active' : ''}`} onClick={() => pickAndNext(setActividad, a.id)}>
                    <div className="calc2-card-icon">
                      {a.id === 'baja' && <Icon name="paw" size={26}/>}
                      {a.id === 'moderada' && <Icon name="leaf" size={26}/>}
                      {a.id === 'alta' && <Icon name="sparkle" size={26}/>}
                    </div>
                    <div className="calc2-card-title">{a.label}</div>
                    <div className="calc2-card-sub">{a.sub}</div>
                    <div className="calc2-card-meta">×{a.mult.toFixed(2)}</div>
                    {actividad === a.id && <span className="calc2-card-check"><Icon name="check" size={14}/></span>}
                  </button>
                ))}
              </div>
              <StepFooter step={step} onPrev={prev} onNext={next}/>
            </Step>
          )}

          {step === 4 && (
            <Step key="s4" title="¿Cada cuánto quieres recibirlo?" hint="Te enviamos recordatorios y mantenemos la cadena fría.">
              <div className="calc2-toggle">
                {PERIODOS.map(p => (
                  <button key={p.id} className={`calc2-toggle-opt ${periodo === p.id ? 'active' : ''}`} onClick={() => pickAndNext(setPeriodo, p.id)}>
                    <div className="calc2-toggle-title">{p.label}</div>
                    <div className="calc2-toggle-sub">{p.sub}</div>
                  </button>
                ))}
              </div>
              <StepFooter step={step} onPrev={prev} onNext={next}/>
            </Step>
          )}

          {step === 5 && (
            <Step key="s5" title="¿Cuántas mascotas?" hint="Si tienes varias del mismo tamaño, lo calculamos juntas.">
              <div className="calc2-stepper-big">
                <button className="calc2-stepper-btn" onClick={() => setPerros(Math.max(1, perros - 1))} disabled={perros <= 1}>
                  <Icon name="minus" size={20}/>
                </button>
                <div className="calc2-stepper-display">
                  <span className="calc2-stepper-num">{perros}</span>
                  <span className="calc2-stepper-lbl">{perros === 1 ? 'mascota' : 'mascotas'}</span>
                </div>
                <button className="calc2-stepper-btn" onClick={() => setPerros(Math.min(20, perros + 1))} disabled={perros >= 20}>
                  <Icon name="plus" size={20}/>
                </button>
              </div>
              <div className="calc2-stepper-tip">
                {perros === 1 && 'Ajustamos la porción solo para tu mascota.'}
                {perros > 1 && `Calculamos ${perros} porciones idénticas. Si pesan distinto, ajustaremos al confirmar el pedido.`}
              </div>
              <StepFooter step={step} onPrev={prev} onNext={next} nextLabel="Calcular mi recomendación"/>
            </Step>
          )}

          {step === TOTAL_STEPS && <LoadingState/>}

          {step === TOTAL_STEPS + 1 && (
            <ResultScreen
              calc={calc} periodo={periodo} periodoData={periodoData} peso={peso} raza={raza}
              edad={EDADES.find(e=>e.id===edad).label} actividad={ACTIVIDADES.find(a=>a.id===actividad).label}
              perros={perros} especie={especie}
              onSolicitar={buildOrderUrl} onAsesor={buildAsesorUrl} onRestart={restart}
              setRoute={setRoute}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ title, hint, children }) {
  return (
    <div className="calc2-step">
      <h2 className="calc2-step-title">{title}</h2>
      <p className="calc2-step-hint">{hint}</p>
      <div className="calc2-step-body">{children}</div>
    </div>
  );
}

function StepFooter({ step, onPrev, onNext, nextLabel, nextDisabled }) {
  return (
    <div className="calc2-step-footer">
      <button className="calc2-back" onClick={onPrev} disabled={step === 0}>
        <span style={{display: 'inline-flex', transform: 'scaleX(-1)'}}><Icon name="arrow" size={14}/></span> Atrás
      </button>
      <button
        className="calc2-next"
        onClick={onNext}
        disabled={nextDisabled}
        style={nextDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        {nextLabel || 'Continuar'} <Icon name="arrow" size={14}/>
      </button>
    </div>
  );
}

function LoadingState() {
  const phrases = [
    'Calculando dieta ideal...',
    'Balanceando proteína y vegetales...',
    'Eligiendo presentación correcta...',
    'Casi listo...',
  ];
  const [phraseIdx, setPhraseIdx] = uSC(0);
  uEC(() => {
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % phrases.length), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="calc2-loading">
      <div className="calc2-loader">
        <div className="calc2-loader-ring"/>
        <div className="calc2-loader-ring calc2-loader-ring-2"/>
        <div className="calc2-loader-paw"><Icon name="paw" size={28}/></div>
      </div>
      <h3 className="calc2-loading-title">{phrases[phraseIdx]}</h3>
      <p className="calc2-loading-sub">Recomendación 100% personalizada para tu mascota.</p>
    </div>
  );
}

function ResultScreen({ calc, periodo, periodoData, peso, raza, edad, actividad, perros, especie, onSolicitar, onAsesor, onRestart, setRoute }) {
  const gramos = useCountUp(calc.gramosTotalDia, 1000);
  const bolsas = useCountUp(periodoData.bolsas, 1000);
  const [pdfLoading, setPdfLoading] = uSC(false);
  const resultRef = uRC(null);

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });

  // Helper: cargar imagen como base64 (necesario para meterla en jsPDF)
  const loadImageAsDataURL = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.85),
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = src;
  });

  const handleDownloadPDF = async () => {
    if (pdfLoading || !resultRef.current) return;
    setPdfLoading(true);

    try {
      // Solo necesitamos jsPDF (sin html2canvas — vamos programático)
      if (!window.jspdf) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }

      // Intentar cargar la imagen del producto en paralelo
      // Si falla (ej. CORS), seguimos sin imagen, no rompemos el PDF
      let productImage = null;
      try {
        productImage = await loadImageAsDataURL(calc.product.img);
      } catch (e) {
        console.warn('No se pudo cargar imagen del producto, generando PDF sin ella:', e);
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

      // Paleta corporativa
      const C = {
        green: [115, 150, 60],         // --green
        greenDark: [92, 122, 47],      // --green-dark
        greenSoft: [218, 232, 195],    // verde muy claro
        brown: [74, 59, 16],           // --brown
        brownLight: [120, 100, 50],    // marrón medio
        muted: [140, 130, 110],
        cream: [248, 244, 232],        // --paper
        creamCard: [242, 233, 189],    // --cream
        white: [255, 255, 255]
      };

      const PW = 210, PH = 297;
      const M = 15;
      const CW = PW - M * 2;

      // ============================================================
      // HEADER (banda verde superior)
      // ============================================================
      doc.setFillColor(...C.greenDark);
      doc.rect(0, 0, PW, 22, 'F');

      doc.setTextColor(...C.white);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('DOGGIE GOURMET', M, 12);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('ALIMENTO · ESTILO DE VIDA', M, 17);

      const today = new Date().toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      doc.setFontSize(8);
      doc.text(today, PW - M, 12, { align: 'right' });
      doc.text('Plan personalizado', PW - M, 17, { align: 'right' });

      let y = 32;

      // ============================================================
      // EYEBROW + TÍTULO
      // ============================================================
      // Pill verde
      doc.setFillColor(...C.greenSoft);
      doc.roundedRect(M, y - 4, 56, 6.5, 3.25, 3.25, 'F');
      doc.setTextColor(...C.greenDark);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('• PLAN PERSONALIZADO', M + 28, y, { align: 'center' });

      y += 11;

      doc.setTextColor(...C.brown);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text(`Tu mascota necesita ${calc.gramosTotalDia} g al día`, M, y);

      y += 8;
      doc.setTextColor(...C.muted);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'normal');
      const subtitle = `Plan basado en ${peso} kg, edad ${edad.toLowerCase()}, actividad ${actividad.toLowerCase()}${perros > 1 ? `, ${perros} mascotas` : ''}.`;
      doc.text(subtitle, M, y);

      y += 12;

      // ============================================================
      // CAJA RECOMENDACIÓN (con imagen del producto)
      // ============================================================
      const recBoxH = 56;
      doc.setFillColor(...C.creamCard);
      doc.roundedRect(M, y, CW, recBoxH, 3, 3, 'F');

      // Imagen del producto (lado izquierdo)
      let textStartX = M + 6;
      if (productImage) {
        const imgSize = 48;
        const imgX = M + 4;
        const imgY = y + 4;
        doc.addImage(
          productImage.dataUrl,
          'JPEG',
          imgX,
          imgY,
          imgSize,
          imgSize,
          undefined,
          'FAST'
        );
        textStartX = M + 4 + imgSize + 8;
      }

      // Tag pequeño "RECOMENDACIÓN" en la columna del texto (arriba)
      doc.setTextColor(...C.green);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('• RECOMENDACIÓN DOGGIE GOURMET', textStartX, y + 8);

      // Categoría (POLLO / etc)
      doc.setTextColor(...C.green);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(calc.product.tag.toUpperCase(), textStartX, y + 16);

      // Nombre del producto
      doc.setTextColor(...C.brown);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(calc.product.name, textStartX, y + 27);

      // Tag de tamaño (pill)
      doc.setDrawColor(...C.green);
      doc.setLineWidth(0.4);
      const sizeTagW = doc.getTextWidth(calc.product.size) + 8;
      doc.roundedRect(textStartX, y + 31, sizeTagW, 6, 3, 3, 'D');
      doc.setTextColor(...C.brown);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(calc.product.size, textStartX + sizeTagW / 2, y + 35, { align: 'center' });

      // Descripción
      doc.setTextColor(...C.muted);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(calc.product.desc, CW - (textStartX - M) - 8);
      doc.text(descLines.slice(0, 2), textStartX, y + 45);

      y += recBoxH + 8;

      // ============================================================
      // 3 STATS EN FILA (Porción · Compra sugerida (verde) · Equivale)
      // FIX: capturar getTextWidth ANTES de cambiar fontSize para evitar
      // que la unidad se sobreponga al número.
      // ============================================================
      const statW = (CW - 6) / 3;
      const statH = 38;

      // Helper para escribir "NUMERO unidad" sin sobreposición
      const drawStatValue = (numText, unitText, x, yPos, numColor) => {
        doc.setTextColor(...numColor);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        const numW = doc.getTextWidth(numText); // medir EN size 28
        doc.text(numText, x, yPos);
        // Después escribir la unidad
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(unitText, x + numW + 2, yPos);
      };

      // Stat 1: Porción diaria
      doc.setFillColor(...C.cream);
      doc.setDrawColor(...C.greenSoft);
      doc.setLineWidth(0.4);
      doc.roundedRect(M, y, statW, statH, 3, 3, 'FD');
      doc.setTextColor(...C.muted);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PORCIÓN DIARIA', M + 5, y + 8);
      drawStatValue(`${calc.gramosTotalDia}`, 'g', M + 5, y + 22, C.brown);
      doc.setTextColor(...C.muted);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${calc.bagsDia.toFixed(2)} bolsas/día`, M + 5, y + 31);

      // Stat 2: Compra sugerida (CAJA VERDE - destacada)
      const stat2X = M + statW + 3;
      doc.setFillColor(...C.green);
      doc.roundedRect(stat2X, y, statW, statH, 3, 3, 'F');
      doc.setTextColor(...C.white);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPRA SUGERIDA', stat2X + 5, y + 8);
      drawStatValue(`${periodoData.bolsas}`, 'bolsas', stat2X + 5, y + 22, C.white);
      doc.setTextColor(...C.white);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${periodo === 'quincenal' ? 'Cada 15 días' : 'Cada 30 días'} · ${calc.product.size}`, stat2X + 5, y + 31);

      // Stat 3: Equivale a
      const stat3X = M + (statW + 3) * 2;
      doc.setFillColor(...C.cream);
      doc.setDrawColor(...C.greenSoft);
      doc.roundedRect(stat3X, y, statW, statH, 3, 3, 'FD');
      doc.setTextColor(...C.muted);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('EQUIVALE A', stat3X + 5, y + 8);
      const equivaleNum = periodo === 'quincenal' ? calc.bagsMes : calc.bagsQuincena;
      drawStatValue(`${equivaleNum}`, 'bolsas', stat3X + 5, y + 22, C.brown);
      doc.setTextColor(...C.muted);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(periodo === 'quincenal' ? 'al mes' : 'cada quincena', stat3X + 5, y + 31);

      y += statH + 8;

      // ============================================================
      // BOX ENTREGA (verde claro)
      // ============================================================
      const delivH = 20;
      doc.setFillColor(...C.greenSoft);
      doc.roundedRect(M, y, CW, delivH, 3, 3, 'F');
      doc.setTextColor(...C.greenDark);
      doc.setFontSize(11.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Nosotros nos encargamos de la entrega.', M + 7, y + 9);
      doc.setTextColor(...C.brown);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Domicilio gratis, cadena fría a -18 °C, en 24-48 horas.', M + 7, y + 15);

      y += delivH + 8;

      // ============================================================
      // TU PLAN EN DETALLE (grid 3x2)
      // ============================================================
      doc.setTextColor(...C.green);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('TU PLAN EN DETALLE', M, y);
      // Línea decorativa debajo del header
      doc.setDrawColor(...C.greenSoft);
      doc.setLineWidth(0.4);
      doc.line(M, y + 2, M + 42, y + 2);
      y += 9;

      const datos = [
        ['MASCOTA', `${especie === 'gato' ? 'Gato' : 'Perro'} · ${raza}`],
        ['PESO', `${peso} kg`],
        ['EDAD', edad],
        ['ACTIVIDAD', actividad],
        ['CANTIDAD', `${perros} ${perros === 1 ? 'mascota' : 'mascotas'}`],
        ['PERIODO', periodo === 'quincenal' ? 'Quincenal' : 'Mensual']
      ];

      const colW = CW / 3;
      datos.forEach((d, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = M + col * colW;
        const yy = y + row * 16;
        doc.setTextColor(...C.muted);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(d[0], x, yy);
        doc.setTextColor(...C.brown);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(d[1], x, yy + 6);
      });
      y += 36;

      // ============================================================
      // DISCLAIMER
      // ============================================================
      const discH = 22;
      doc.setFillColor(245, 240, 218);
      doc.roundedRect(M, y, CW, discH, 2, 2, 'F');
      doc.setTextColor(...C.green);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTA IMPORTANTE', M + 5, y + 6);
      doc.setTextColor(...C.brown);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      const disclaimer = 'Las recomendaciones son estimadas con base en peso, edad y actividad. Para mascotas con condiciones especiales (sobrepeso, gestación, enfermedades, alergias), consulta a tu veterinario antes de iniciar la dieta BARF.';
      const splitDisc = doc.splitTextToSize(disclaimer, CW - 10);
      doc.text(splitDisc, M + 5, y + 12);

      // ============================================================
      // FOOTER (banda verde inferior)
      // ============================================================
      doc.setFillColor(...C.greenDark);
      doc.rect(0, PH - 18, PW, 18, 'F');
      doc.setTextColor(...C.white);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('¿Listo para tu pedido?', M, PH - 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('WhatsApp: 33 1844 0265 · doggiegourmet.com.mx', M, PH - 5);
      doc.setFontSize(7);
      doc.text('Plan generado por Doggie Gourmet', PW - M, PH - 6, { align: 'right' });

      // Guardar
      const fileName = `dieta-doggie-gourmet-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('No se pudo generar el PDF. Intenta de nuevo en un momento.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="calc2-result" ref={resultRef}>
      <div className="calc2-result-header">
        <div className="calc2-result-eyebrow">
          <span className="calc2-result-eyebrow-dot"/> Plan personalizado
        </div>
        <h2 className="calc2-result-title">
          Tu mascota necesita <em>{gramos} g</em> al día.
        </h2>
        <p className="calc2-result-sub">
          Plan basado en {peso} kg, edad {edad.toLowerCase()}, actividad {actividad.toLowerCase()}{perros > 1 ? `, ${perros} mascotas` : ''}.
        </p>
      </div>

      <div className="calc2-result-grid">
        <div className="calc2-product-card">
          <span className="calc2-product-tag">RECOMENDACIÓN DOGGIE GOURMET</span>
          <div className="calc2-product-img">
            <img src={calc.product.img} alt={calc.product.name}/>
          </div>
          <div className="calc2-product-body">
            <div className="calc2-product-cat">{calc.product.tag}</div>
            <h3>{calc.product.name}</h3>
            <span className="calc2-product-size">{calc.product.size}</span>
            <p>{calc.product.desc}</p>
          </div>
        </div>

        <div className="calc2-stats">
          <div className="calc2-stat">
            <div className="calc2-stat-label"><Icon name="paw" size={14}/> Porción diaria</div>
            <div className="calc2-stat-value">{gramos}<em>g</em></div>
            <div className="calc2-stat-sub">{perros > 1 ? `${calc.gramosDia} g por mascota` : `${(calc.bagsDia).toFixed(2)} bolsas/día`}</div>
          </div>
          <div className="calc2-stat highlight">
            <div className="calc2-stat-label"><Icon name="box" size={14}/> Compra sugerida</div>
            <div className="calc2-stat-value">{bolsas}<em> bolsas</em></div>
            <div className="calc2-stat-sub">{periodo === 'quincenal' ? 'Cada 15 días' : 'Cada 30 días'} · {calc.product.size}</div>
          </div>
          <div className="calc2-stat">
            <div className="calc2-stat-label"><Icon name="clock" size={14}/> Equivale a</div>
            <div className="calc2-stat-value">{periodo === 'quincenal' ? calc.bagsMes : calc.bagsQuincena}<em> bolsas</em></div>
            <div className="calc2-stat-sub">{periodo === 'quincenal' ? 'al mes' : 'cada quincena'}</div>
          </div>
        </div>
      </div>

      <div className="calc2-delivery">
        <div className="calc2-delivery-icon"><Icon name="snow" size={22}/></div>
        <div>
          <div className="calc2-delivery-title">Nosotros nos encargamos de la entrega.</div>
          <div className="calc2-delivery-sub">Domicilio gratis, cadena fría a −18 °C, en 24–48 horas.</div>
        </div>
      </div>

      <div className="calc2-summary">
        <div className="calc2-summary-head">▮ Tu plan en detalle</div>
        <div className="calc2-summary-grid">
          <div><span>Mascota</span><strong>{especie === 'gato' ? 'Gato' : 'Perro'} · {raza}</strong></div>
          <div><span>Peso</span><strong>{peso} kg</strong></div>
          <div><span>Edad</span><strong>{edad}</strong></div>
          <div><span>Actividad</span><strong>{actividad}</strong></div>
          <div><span>Cantidad</span><strong>{perros} {perros === 1 ? 'mascota' : 'mascotas'}</strong></div>
          <div><span>Periodo</span><strong>{periodo === 'quincenal' ? 'Quincenal' : 'Mensual'}</strong></div>
        </div>
      </div>

      <div className="calc2-cta" data-pdf-hide="true">
        <a className="calc2-cta-primary" href={onSolicitar()} target="_blank" rel="noopener noreferrer">
          <Icon name="wa" size={16}/> Solicitar mi pedido
        </a>
        <a className="calc2-cta-secondary" href={onAsesor()} target="_blank" rel="noopener noreferrer">
          Hablar con un asesor
        </a>
      </div>

      <button
        onClick={handleDownloadPDF}
        disabled={pdfLoading}
        data-pdf-hide="true"
        style={{
          marginTop: 12,
          width: '100%',
          padding: '14px 20px',
          borderRadius: 999,
          background: 'transparent',
          border: '1.5px solid var(--green, #73963C)',
          color: 'var(--green, #73963C)',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: pdfLoading ? 'wait' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: pdfLoading ? 0.6 : 1,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!pdfLoading) {
            e.currentTarget.style.background = 'var(--green, #73963C)';
            e.currentTarget.style.color = '#fff';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--green, #73963C)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {pdfLoading ? 'Generando PDF...' : 'Descargar dieta en PDF'}
      </button>

      <button className="calc2-restart" onClick={onRestart} data-pdf-hide="true">
        ← Recalcular con otros datos
      </button>

      <div className="calc2-disclaimer" style={{
        marginTop: 24, padding: '14px 18px', borderRadius: 12,
        background: 'rgba(92, 122, 47, 0.08)', border: '1px solid rgba(92, 122, 47, 0.2)',
        fontSize: 13, lineHeight: 1.6, color: 'var(--brown)'
      }}>
        <strong style={{ color: 'var(--green)' }}>ℹ️ Nota importante:</strong> Las recomendaciones son estimadas con base en
        peso, edad y actividad. Para mascotas con condiciones especiales (sobrepeso, gestación, enfermedades, alergias),
        consulta a tu veterinario antes de iniciar la dieta BARF.
      </div>
    </div>
  );
}

window.CalculatorPage = CalculatorPage;
