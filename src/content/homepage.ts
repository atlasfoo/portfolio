/**
 * Homepage copy and data, ported verbatim from the design mock at
 * `design-import/Portafolio Jerry Mejia.dc.html`.
 *
 * Every translatable string is a `Bilingual` pair so components can pick a
 * side with the active `Lang` (see `src/lib/lang.ts`). Non-translatable
 * values (proper nouns, tech names, hex colors, hrefs, diagram geometry)
 * stay plain.
 *
 * Copy is NOT edited here: it is the mock's text, character for character.
 * Claims that need Jerry's sign-off before launch are listed in
 * `CONTENT_REVIEW_FLAGS` at the bottom of this file rather than silently
 * softened.
 */

/** A translatable string in both supported languages. */
export interface Bilingual {
  en: string;
  es: string;
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface NavLink {
  /** Stable key, also used as the React list key. */
  id: string;
  /** In-page anchor or external document. */
  href: string;
  label: Bilingual;
}

export interface NavLabels {
  /** Wordmark in the nav bar; a proper noun, so not translated. */
  brand: string;
  /**
   * In-page section links, in nav order. The mock's fifth link ("Blog",
   * pointing at a separate mock document) is deliberately absent: the blog
   * is a PRD non-goal for this publish, and HOME-002 requires the nav to
   * ship without it. Re-add it here when the blog route exists.
   */
  links: readonly NavLink[];
  /** Availability pill next to the pulsing status dot. */
  status: Bilingual;
  /**
   * Language-toggle button label. The mock shows the language you would
   * switch TO, so the `es` side reads "EN" and vice versa.
   */
  langToggle: Bilingual;
}

export const NAV_LABELS: NavLabels = {
  brand: 'jerry.mejia',
  links: [
    {
      id: 'architecture',
      href: '#architecture',
      label: { es: 'Arquitectura', en: 'Architecture' },
    },
    { id: 'stack', href: '#stack', label: { es: 'Stack', en: 'Stack' } },
    {
      id: 'sectors',
      href: '#sectors',
      label: { es: 'Sectores', en: 'Sectors' },
    },
    {
      id: 'projects',
      href: '#projects',
      label: { es: 'Proyectos', en: 'Projects' },
    },
  ],
  status: { es: 'Disponible', en: 'Available' },
  langToggle: { es: 'EN', en: 'ES' },
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export interface HeroStat {
  id: string;
  /** Big display figure — "06", "AWS", "LATAM". */
  value: string;
  label: Bilingual;
}

export interface HeroCopy {
  kicker: Bilingual;
  title: Bilingual;
  subtitle: Bilingual;
  ctaPrimary: { href: string; label: Bilingual };
  ctaSecondary: { href: string; label: Bilingual };
  stats: readonly HeroStat[];
}

export const HERO_COPY: HeroCopy = {
  kicker: {
    es: 'Arquitecto de Software · Nube AWS',
    en: 'Software Architect · AWS Cloud',
  },
  title: {
    es: 'Construyo lo que el negocio no ve, pero siente cada día.',
    en: 'I build what the business never sees — but feels every day.',
  },
  subtitle: {
    es: 'Arquitecto de software en la nube con 6 años diseñando sistemas distribuidos en AWS: microservicios observables, resilientes y de alta disponibilidad. Me gusta cerrar la brecha entre la decisión técnica y el crecimiento del negocio.',
    en: 'Cloud software architect with 6 years designing distributed systems on AWS: observable, resilient, highly-available microservices. I love closing the gap between the technical decision and business growth.',
  },
  ctaPrimary: {
    href: '#contact',
    label: { es: 'Hablemos', en: 'Let’s talk' },
  },
  ctaSecondary: {
    href: '#projects',
    label: { es: 'Ver proyectos', en: 'See projects' },
  },
  stats: [
    {
      id: 'years',
      value: '06',
      label: { es: 'años de experiencia', en: 'years of experience' },
    },
    {
      id: 'cert',
      value: 'AWS',
      label: { es: 'arquitecto certificado', en: 'certified architect' },
    },
    {
      id: 'region',
      value: 'LATAM',
      label: {
        es: 'financiero · médico · pagos',
        en: 'finance · health · payments',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Section headers                                                     */
/* ------------------------------------------------------------------ */

export interface SectionHeader {
  /** Ordinal shown before the eyebrow, e.g. "01". */
  index: string;
  /** Eyebrow / kicker above the heading. */
  tag: Bilingual;
  title: Bilingual;
  /** Optional intro paragraph under the heading. */
  lead?: Bilingual;
  /** Optional inline hint (architecture panel only). */
  hint?: Bilingual;
}

export interface SectionCopy {
  architecture: SectionHeader;
  capabilities: SectionHeader;
  stack: SectionHeader;
  sectors: SectionHeader;
  projects: SectionHeader;
}

export const SECTION_COPY: SectionCopy = {
  architecture: {
    index: '01',
    tag: { es: 'ARQUITECTURA EN VIVO', en: 'LIVE ARCHITECTURE' },
    title: {
      es: 'Una arquitectura, contada en vivo',
      en: 'One architecture, told live',
    },
    lead: {
      es: 'Así se ve un sistema diseñado para fallar bien: capas desacopladas, comunicación asíncrona y visibilidad de punta a punta.',
      en: 'This is what a system designed to fail gracefully looks like: decoupled layers, async communication and end-to-end visibility.',
    },
    hint: {
      es: '// pasa el cursor o toca cada pieza',
      en: '// hover or tap each piece',
    },
  },
  capabilities: {
    index: '02',
    tag: { es: 'CAPACIDADES', en: 'CAPABILITIES' },
    title: { es: 'Lo que hago bien', en: 'What I do well' },
  },
  stack: {
    index: '03',
    tag: { es: 'STACK', en: 'STACK' },
    title: {
      es: 'Herramientas que domino',
      en: 'Tools I’m fluent in',
    },
  },
  sectors: {
    index: '04',
    tag: { es: 'DOMINIOS', en: 'DOMAINS' },
    title: {
      es: 'Dónde he dejado huella',
      en: 'Where I’ve left a mark',
    },
    lead: {
      es: 'Seis años cruzando sectores donde un error no es una opción.',
      en: 'Six years across sectors where a mistake is not an option.',
    },
  },
  projects: {
    index: '05',
    tag: { es: 'PROYECTOS', en: 'PROJECTS' },
    title: { es: 'Proyectos', en: 'Projects' },
    lead: {
      es: 'Una muestra de sistemas que llevé a producción.',
      en: 'A sample of systems I took to production.',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Architecture diagram                                                */
/* ------------------------------------------------------------------ */

/** Vertical column the node sits in; matches the mock's column captions. */
export type ArchitectureLayer = 'client' | 'edge' | 'services' | 'state';

export interface ArchitectureLayerCaption {
  id: ArchitectureLayer;
  /** Lowercase technical caption — same word in both languages. */
  label: string;
  /** Horizontal position, percent of the diagram box. */
  x: number;
}

export const ARCHITECTURE_LAYERS: readonly ArchitectureLayerCaption[] = [
  { id: 'client', label: 'client', x: 8 },
  { id: 'edge', label: 'edge', x: 32 },
  { id: 'services', label: 'services', x: 57 },
  { id: 'state', label: 'state', x: 86 },
];

export interface ArchitectureNode {
  id: string;
  layer: ArchitectureLayer;
  /** Position inside the diagram box, percent of width/height. */
  x: number;
  y: number;
  /** Status-dot hex from the mock; components may map it to a token. */
  dotColor: string;
  /** Node title. */
  label: Bilingual;
  /** Monospace sub-label under the title. */
  subtitle: Bilingual;
  /** Long copy shown in the detail panel when the node is active. */
  description: Bilingual;
}

export const ARCHITECTURE_NODES: readonly ArchitectureNode[] = [
  {
    id: 'web',
    layer: 'client',
    x: 8,
    y: 24,
    dotColor: '#5B8CFF',
    label: { es: 'Web', en: 'Web' },
    subtitle: { es: 'Next.js · React', en: 'Next.js · React' },
    description: {
      es: 'Aplicaciones web rápidas y accesibles, renderizadas en el borde para sentirse instantáneas.',
      en: 'Fast, accessible web apps rendered at the edge so they feel instant.',
    },
  },
  {
    id: 'mobile',
    layer: 'client',
    x: 8,
    y: 72,
    dotColor: '#5B8CFF',
    label: { es: 'Mobile', en: 'Mobile' },
    subtitle: { es: 'React Native', en: 'React Native' },
    description: {
      es: 'Una sola base de código que llega a iOS y Android sin duplicar el esfuerzo.',
      en: 'A single codebase shipping to iOS and Android without duplicating effort.',
    },
  },
  {
    id: 'gw',
    layer: 'edge',
    x: 32,
    y: 48,
    dotColor: '#2F6BFF',
    label: { es: 'API Gateway', en: 'API Gateway' },
    subtitle: { es: 'Auth · Rate limit', en: 'Auth · Rate limit' },
    description: {
      es: 'Punto de entrada único: autenticación, límites de tráfico y enrutamiento a cada servicio.',
      en: 'A single entry point: authentication, throttling and routing to each service.',
    },
  },
  {
    id: 'pagos',
    layer: 'services',
    x: 57,
    y: 18,
    dotColor: '#6B8BFF',
    label: { es: 'Pagos', en: 'Payments' },
    subtitle: { es: '.NET · FastAPI', en: '.NET · FastAPI' },
    description: {
      es: 'Aceptación de pagos con conciliación y reintentos idempotentes: cobrar bien, siempre.',
      en: 'Payment acceptance with reconciliation and idempotent retries: charge right, every time.',
    },
  },
  {
    id: 'tarjetas',
    layer: 'services',
    x: 57,
    y: 48,
    dotColor: '#2F6BFF',
    label: { es: 'Tarjetas', en: 'Cards' },
    subtitle: { es: 'Emisión · Control', en: 'Issuing · Control' },
    description: {
      es: 'Core de emisión y control de medios de pago operando a escala regional.',
      en: 'A card issuing and control core operating at regional scale.',
    },
  },
  {
    id: 'openb',
    layer: 'services',
    x: 57,
    y: 78,
    dotColor: '#6B8BFF',
    label: { es: 'Open Banking', en: 'Open Banking' },
    subtitle: { es: 'Integraciones', en: 'Integrations' },
    description: {
      es: 'Integraciones de terceros con plataformas bancarias, bajo estándar y con seguridad.',
      en: 'Third-party integrations with banking platforms — by the standard, and secure.',
    },
  },
  {
    id: 'pg',
    layer: 'state',
    x: 86,
    y: 22,
    dotColor: '#7AA0FF',
    label: { es: 'PostgreSQL', en: 'PostgreSQL' },
    subtitle: { es: 'Datos', en: 'Data' },
    description: {
      es: 'Persistencia transaccional con réplicas de lectura para escalar sin perder consistencia.',
      en: 'Transactional persistence with read replicas to scale without losing consistency.',
    },
  },
  {
    id: 'bus',
    layer: 'state',
    x: 86,
    y: 50,
    dotColor: '#7AA0FF',
    label: { es: 'Event Bus', en: 'Event Bus' },
    subtitle: { es: 'Async', en: 'Async' },
    description: {
      es: 'Comunicación asíncrona entre servicios: desacoplada, resiliente y lista para fallar bien.',
      en: 'Async communication between services: decoupled, resilient and ready to fail gracefully.',
    },
  },
  {
    id: 'obs',
    layer: 'state',
    x: 86,
    y: 80,
    dotColor: '#9BB6FF',
    label: { es: 'Observabilidad', en: 'Observability' },
    subtitle: { es: 'Trazas · Métricas', en: 'Traces · Metrics' },
    description: {
      es: 'Visibilidad de punta a punta: logs, métricas y trazas para saber qué pasa antes que el usuario.',
      en: 'End-to-end visibility: logs, metrics and traces — you know before the user does.',
    },
  },
];

/** `[fromNodeId, toNodeId]` edges drawn between architecture nodes. */
export type ArchitectureConnection = [string, string];

export const ARCHITECTURE_CONNECTIONS: readonly ArchitectureConnection[] = [
  ['web', 'gw'],
  ['mobile', 'gw'],
  ['gw', 'pagos'],
  ['gw', 'tarjetas'],
  ['gw', 'openb'],
  ['pagos', 'bus'],
  ['tarjetas', 'pg'],
  ['tarjetas', 'bus'],
  ['openb', 'bus'],
  ['bus', 'obs'],
  ['pg', 'obs'],
];

/** Node selected on first render (the mock's initial `active` state). */
export const DEFAULT_ARCHITECTURE_NODE_ID = 'tarjetas';

/* ------------------------------------------------------------------ */
/* Capabilities                                                        */
/* ------------------------------------------------------------------ */

export interface Capability {
  /** Ordinal shown on the card, e.g. "01". */
  number: string;
  title: Bilingual;
  description: Bilingual;
}

export const CAPABILITIES: readonly Capability[] = [
  {
    number: '01',
    title: { es: 'Sistemas distribuidos', en: 'Distributed systems' },
    description: {
      es: 'Microservicios desacoplados que escalan por separado y fallan sin arrastrar al resto.',
      en: 'Decoupled microservices that scale independently and fail without dragging the rest down.',
    },
  },
  {
    number: '02',
    title: {
      es: 'Observabilidad y trazabilidad',
      en: 'Observability & tracing',
    },
    description: {
      es: 'Logs, métricas y trazas para entender el sistema antes de que el usuario note algo.',
      en: 'Logs, metrics and traces to understand the system before users notice anything.',
    },
  },
  {
    number: '03',
    title: {
      es: 'Resiliencia y alta disponibilidad',
      en: 'Resilience & high availability',
    },
    description: {
      es: 'Reintentos, circuit breakers y redundancia para que todo siga de pie.',
      en: 'Retries, circuit breakers and redundancy that keep everything standing.',
    },
  },
  {
    number: '04',
    title: { es: 'DevOps y CI/CD', en: 'DevOps & CI/CD' },
    description: {
      es: 'Pipelines en GitHub Actions y Azure DevOps que entregan sin drama ni sorpresas.',
      en: 'GitHub Actions and Azure DevOps pipelines that ship with no drama, no surprises.',
    },
  },
  {
    number: '05',
    title: { es: 'Liderazgo técnico', en: 'Technical leadership' },
    description: {
      es: 'Acompaño equipos: decisiones de arquitectura, mentoría y foco compartido.',
      en: 'I guide teams: architecture decisions, mentorship and shared focus.',
    },
  },
  {
    number: '06',
    title: { es: 'Puente técnico–negocio', en: 'Tech–business bridge' },
    description: {
      es: 'Traduzco requisitos de negocio en arquitectura, y arquitectura en valor real.',
      en: 'I translate business needs into architecture, and architecture into real value.',
    },
  },
  {
    number: '07',
    title: { es: 'Auditoría y cumplimiento', en: 'Audit & compliance' },
    description: {
      es: 'Sistemas auditables y alineados a la regulación de cada sector.',
      en: 'Auditable systems aligned with each sector’s regulation.',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Stack                                                               */
/* ------------------------------------------------------------------ */

export interface StackGroup {
  id: string;
  label: Bilingual;
  /** Tool and language names; proper nouns, not translated. */
  items: readonly string[];
}

export const STACK_GROUPS: readonly StackGroup[] = [
  {
    id: 'languages',
    label: { es: 'Lenguajes', en: 'Languages' },
    items: [
      'C# (.NET Core)',
      'Python · Django · FastAPI',
      'Node.js',
      'Java',
      'SQL',
    ],
  },
  {
    id: 'frontend',
    label: { es: 'Frontend', en: 'Frontend' },
    items: ['Next.js', 'React', 'React Native'],
  },
  {
    id: 'devops',
    label: { es: 'DevOps & CI/CD', en: 'DevOps & CI/CD' },
    items: ['GitHub Actions', 'Azure Pipelines', 'GitHub', 'Azure DevOps'],
  },
  {
    id: 'cloud',
    label: { es: 'Contenedores & Nube', en: 'Containers & Cloud' },
    items: ['AWS', 'Amazon ECS', 'Kubernetes'],
  },
  {
    id: 'architecture',
    label: { es: 'Arquitectura', en: 'Architecture' },
    items: ['Microservicios', 'Event-driven', 'Vendorizada', 'No vendorizada'],
  },
];

/* ------------------------------------------------------------------ */
/* Sectors                                                             */
/* ------------------------------------------------------------------ */

export interface Sector {
  id: string;
  title: Bilingual;
  description: Bilingual;
}

export const SECTORS: readonly Sector[] = [
  {
    id: 'financial',
    title: { es: 'Sector financiero', en: 'Financial sector' },
    description: {
      es: 'Banca, transacciones y cumplimiento regulatorio.',
      en: 'Banking, transactions and regulatory compliance.',
    },
  },
  {
    id: 'healthcare',
    title: { es: 'Sector médico', en: 'Healthcare' },
    description: {
      es: 'Sistemas para laboratorios y manejo de datos sensibles.',
      en: 'Systems for labs and handling sensitive data.',
    },
  },
  {
    id: 'non-bank',
    title: { es: 'Sucursales no bancarias', en: 'Non-bank branches' },
    description: {
      es: 'Corresponsalía y servicios financieros distribuidos.',
      en: 'Agent networks and distributed financial services.',
    },
  },
  {
    id: 'integrations',
    title: { es: 'Integraciones bancarias', en: 'Banking integrations' },
    description: {
      es: 'Conexión de terceros con plataformas bancarias.',
      en: 'Connecting third parties to banking platforms.',
    },
  },
  {
    id: 'acceptance',
    title: { es: 'Aceptación de pagos', en: 'Payment acceptance' },
    description: {
      es: 'Cobros confiables, conciliados y a prueba de fallos.',
      en: 'Reliable, reconciled, fail-safe collections.',
    },
  },
  {
    id: 'issuing',
    title: { es: 'Emisión de tarjetas', en: 'Card issuing' },
    description: {
      es: 'Emisión y control de medios de pago a escala.',
      en: 'Issuing and controlling payment cards at scale.',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Projects & filters                                                  */
/* ------------------------------------------------------------------ */

export interface FilterDef {
  /** Filter id; `PROJECTS[].tags` reference these. */
  id: string;
  label: Bilingual;
  /** True for the catch-all filter that matches every project. */
  matchesAll?: boolean;
}

export const FILTER_DEFS: readonly FilterDef[] = [
  { id: 'all', label: { es: 'Todos', en: 'All' }, matchesAll: true },
  { id: 'fin', label: { es: 'Financiero', en: 'Financial' } },
  { id: 'pay', label: { es: 'Pagos', en: 'Payments' } },
  { id: 'med', label: { es: 'Médico', en: 'Healthcare' } },
];

/** Filter selected on first render (the mock's initial `filter` state). */
export const DEFAULT_FILTER_ID = 'all';

export interface Project {
  /** Product name; a proper noun, so not translated. */
  name: string;
  /** Filter ids this project belongs to; each matches a `FilterDef.id`. */
  tags: string[];
  /** Tech chips under the card body. */
  stack: readonly string[];
  /** Monospace line under the title, e.g. "Digital wallet · Payments". */
  kind: Bilingual;
  description: Bilingual;
}

export const PROJECTS: readonly Project[] = [
  {
    name: 'Poket',
    tags: ['pay', 'fin'],
    stack: ['React Native', 'Node.js', 'AWS', 'Kubernetes'],
    kind: {
      es: 'Billetera digital · Pagos',
      en: 'Digital wallet · Payments',
    },
    description: {
      es: 'Billetera y aceptación de pagos pensada para acercar servicios financieros a más personas.',
      en: 'A wallet and payment acceptance product built to bring financial services to more people.',
    },
  },
  {
    name: 'Core de Tarjetas LAFISE',
    tags: ['pay', 'fin'],
    stack: ['C# .NET', 'PostgreSQL', 'Amazon ECS', 'Event-driven'],
    kind: {
      es: 'Emisión y control de tarjetas',
      en: 'Card issuing & control',
    },
    description: {
      es: 'Core regional para emitir y controlar medios de pago en varios países.',
      en: 'A regional core to issue and control payment cards across several countries.',
    },
  },
  {
    name: 'ServiRED LAFISE',
    tags: ['fin'],
    stack: ['.NET Core', 'SQL', 'Azure DevOps'],
    kind: {
      es: 'Red de sucursales no bancarias',
      en: 'Non-bank branch network',
    },
    description: {
      es: 'Plataforma para operar servicios financieros fuera de la sucursal tradicional.',
      en: 'A platform to run financial services beyond the traditional branch.',
    },
  },
  {
    name: 'OpenBanking',
    tags: ['fin'],
    stack: ['FastAPI', 'OAuth2', 'AWS', 'Observabilidad'],
    kind: {
      es: 'Integraciones · Open Banking',
      en: 'Integrations · Open Banking',
    },
    description: {
      es: 'Capa estándar para que terceros se conecten a plataformas bancarias con seguridad.',
      en: 'A standard layer for third parties to securely connect to banking platforms.',
    },
  },
  {
    name: 'Labsys',
    tags: ['med'],
    stack: ['Django', 'PostgreSQL', 'React'],
    kind: {
      es: 'Sistema para sector médico',
      en: 'Healthcare system',
    },
    description: {
      es: 'Sistema para laboratorios médicos, con foco en la trazabilidad de los resultados.',
      en: 'A system for medical labs, focused on the traceability of results.',
    },
  },
];

/**
 * Shown by `ProjectsGrid` when the active filter matches no project.
 *
 * The one string in this file with no counterpart in the mock: the mock's
 * grid can never be empty (every `FilterDef` matches at least one project),
 * so it never needed the state. The component can still reach it — a filter
 * added here before its first project, or a project losing its last tag —
 * and an empty grid with no explanation reads as a broken page.
 */
export const PROJECTS_EMPTY_STATE: Bilingual = {
  es: 'Ningún proyecto coincide con este filtro.',
  en: 'No projects match this filter.',
};

/* ------------------------------------------------------------------ */
/* Methodology                                                         */
/* ------------------------------------------------------------------ */

export interface MethodologyCopy {
  index: string;
  tag: Bilingual;
  title: Bilingual;
  body: Bilingual;
  /** AI tooling chips; product names, not translated. */
  tools: readonly string[];
  /** Static terminal card beside the copy. */
  terminal: {
    /** Prompt line, identical in both languages. */
    command: string;
    comment: Bilingual;
    /** Lines prefixed with a green check mark. */
    done: readonly Bilingual[];
    /** Last line, followed by the blinking caret. */
    running: Bilingual;
  };
}

export const METHODOLOGY_COPY: MethodologyCopy = {
  index: '06',
  tag: { es: 'METODOLOGÍA', en: 'METHODOLOGY' },
  title: { es: 'Cómo construyo hoy', en: 'How I build today' },
  body: {
    es: 'Integro agentes de IA dentro de una metodología de desarrollo propia. No para reemplazar el criterio, sino para multiplicarlo: más velocidad, menos trabajo repetitivo y más tiempo para la arquitectura y el negocio.',
    en: 'I weave AI agents into my own development methodology. Not to replace judgment, but to multiply it: more speed, less busywork and more time for architecture and the business.',
  },
  tools: ['Claude Code', 'Cursor', 'Antigravity'],
  terminal: {
    command: '$ claude --role architect',
    comment: {
      es: '# desarrollo agéntico + criterio humano',
      en: '# agentic dev + human judgment',
    },
    done: [
      { es: 'arquitectura propuesta', en: 'architecture proposed' },
      { es: 'tests generados', en: 'tests generated' },
    ],
    running: { es: '> construyendo', en: '> building' },
  },
};

/* ------------------------------------------------------------------ */
/* Hero terminal                                                       */
/* ------------------------------------------------------------------ */

/**
 * Line tone, derived from the mock's `colorTerm()` rules: prompt lines
 * (`$`), success lines (`✓`), the identity line, the closing highlight,
 * and everything else.
 */
export type TerminalTone =
  | 'prompt'
  | 'success'
  | 'identity'
  | 'highlight'
  | 'muted';

export interface TerminalLine extends Bilingual {
  tone: TerminalTone;
}

/** Window title in the terminal chrome. */
export const TERMINAL_TITLE = '~/jerry — zsh';

export const TERMINAL_LINES: readonly TerminalLine[] = [
  { tone: 'prompt', es: '$ whoami', en: '$ whoami' },
  {
    tone: 'identity',
    es: 'jerry_mejia · arquitecto_cloud',
    en: 'jerry_mejia · cloud_architect',
  },
  { tone: 'prompt', es: '$ cat perfil.json', en: '$ cat profile.json' },
  { tone: 'muted', es: '{', en: '{' },
  { tone: 'muted', es: '  "años": 6,', en: '  "years": 6,' },
  { tone: 'muted', es: '  "nube": "AWS",', en: '  "cloud": "AWS",' },
  {
    tone: 'muted',
    es: '  "foco": ["distribuido","resiliente","alta_disponibilidad"]',
    en: '  "focus": ["distributed","resilient","high_availability"]',
  },
  { tone: 'muted', es: '}', en: '}' },
  {
    tone: 'prompt',
    es: '$ ./deploy --region latam --strategy zero-downtime',
    en: '$ ./deploy --region latam --strategy zero-downtime',
  },
  {
    tone: 'success',
    es: '✓ build   ✓ tests   ✓ canary 100%',
    en: '✓ build   ✓ tests   ✓ canary 100%',
  },
  {
    tone: 'highlight',
    es: 'sistemas en producción. negocio creciendo.',
    en: 'systems in production. business growing.',
  },
];

/* ------------------------------------------------------------------ */
/* Certification                                                       */
/* ------------------------------------------------------------------ */

export interface CertCopy {
  tag: Bilingual;
  /** Badge tile text — "AWS" over "CERTIFIED". */
  badge: { top: string; bottom: string };
  /** Certification name; not translated. */
  name: string;
  issuer: string;
}

export const CERT_COPY: CertCopy = {
  tag: { es: 'CERTIFICACIÓN', en: 'CERTIFICATION' },
  badge: { top: 'AWS', bottom: 'CERTIFIED' },
  name: 'AWS Certified Solutions Architect',
  issuer: 'Amazon Web Services',
};

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export interface ContactLink {
  id: string;
  href: string;
  /** Handle as displayed; a proper noun, not translated. */
  label: string;
  external: boolean;
}

export interface ContactCopy {
  title: Bilingual;
  lead: Bilingual;
  links: readonly ContactLink[];
}

export const CONTACT_COPY: ContactCopy = {
  title: {
    es: 'Hablemos de tu sistema',
    en: 'Let’s talk about your system',
  },
  lead: {
    es: 'Reclutador o cliente: si necesitas a alguien que entienda el código y el negocio por igual, escríbeme.',
    en: 'Recruiter or client: if you need someone who speaks both code and business, reach out.',
  },
  links: [
    {
      id: 'email',
      href: 'mailto:iscomejia15@outlook.com',
      label: 'iscomejia15@outlook.com',
      external: false,
    },
    {
      id: 'github',
      href: 'https://github.com/atlasfoo',
      label: 'github/atlasfoo',
      external: true,
    },
    {
      id: 'linkedin',
      href: 'https://linkedin.com/in/jerrymejia15',
      label: 'in/jerrymejia15',
      external: true,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export interface FooterCopy {
  /** Left side, paired with `HERO_COPY.kicker` in the mock. */
  name: string;
  credit: Bilingual;
}

export const FOOTER_COPY: FooterCopy = {
  name: 'Jerry Mejía',
  credit: {
    es: 'Diseñado y construido por Jerry Mejía',
    en: 'Designed and built by Jerry Mejía',
  },
};

/* ------------------------------------------------------------------ */
/* Content review                                                      */
/* ------------------------------------------------------------------ */

/**
 * Copy ported from the mock that asserts something factual about Jerry and
 * must be confirmed by him before the site is considered final. Nothing
 * here blocks the build; it is a checklist for the human, kept next to the
 * copy it refers to so it cannot drift out of sight.
 */
export interface ContentReviewFlag {
  id: string;
  topic: string;
  note: string;
  /** Exports/fields carrying the claim. */
  locations: readonly string[];
}

export const CONTENT_REVIEW_FLAGS: readonly ContentReviewFlag[] = [
  {
    id: 'years-of-experience',
    topic: 'Years of experience ("06" / "6 years" / "Seis años")',
    note: 'A time-bound claim repeated in four places. Confirm the current figure and update every occurrence together, or make it derive from a start year.',
    locations: [
      'HERO_COPY.stats[0].value',
      'HERO_COPY.subtitle',
      'SECTION_COPY.sectors.lead',
      'TERMINAL_LINES[4]',
    ],
  },
  {
    id: 'aws-certification',
    topic: 'AWS Certified Solutions Architect claim',
    note: 'Confirm the certification is held and currently valid (AWS certs expire), and that the exact title and level are stated correctly before publishing.',
    locations: ['CERT_COPY.name', 'HERO_COPY.stats[1]', 'HERO_COPY.kicker'],
  },
  {
    id: 'named-clients',
    topic: 'Named clients, employers and internal product names',
    note: 'LAFISE, ServiRED, Poket, OpenBanking and Labsys are named with project descriptions. Confirm each may be disclosed publicly (NDA / employer policy) and that the described scope is accurate.',
    locations: ['PROJECTS[].name', 'PROJECTS[].description'],
  },
  {
    id: 'contact-handles',
    topic: 'Contact handles',
    note: 'Confirm iscomejia15@outlook.com, github.com/atlasfoo and linkedin.com/in/jerrymejia15 are the handles to publish — an email address on a public page attracts scraping, so a professional alias may be preferred.',
    locations: ['CONTACT_COPY.links'],
  },
  {
    id: 'availability-status',
    topic: 'Availability status ("Disponible" / "Available")',
    note: 'The nav pill states Jerry is open to work. It goes stale the moment that changes; confirm it should ship and decide who flips it.',
    locations: ['NAV_LABELS.status'],
  },
];
