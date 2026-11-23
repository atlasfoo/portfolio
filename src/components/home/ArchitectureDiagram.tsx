import { animate, createDrawable, stagger } from 'animejs';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ARCHITECTURE_CONNECTIONS,
  ARCHITECTURE_LAYERS,
  ARCHITECTURE_NODES,
  type ArchitectureNode,
  type ArchitectureNodeIcon,
  DEFAULT_ARCHITECTURE_NODE_ID,
  SECTION_COPY,
} from '../../content/homepage';
import {
  resolveActiveNode,
  type StageBox,
  shouldAnimateStage,
  stageLinkPath,
} from '../../lib/home/architecture-diagram';
import type { Lang } from '../../lib/lang';
import { getCurrentLang, LANG_CHANGE_EVENT } from '../../lib/lang-client';

const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Node lookup for the line endpoints; the node list is module-constant. */
const NODE_BY_ID = new Map(ARCHITECTURE_NODES.map((node) => [node.id, node]));

/**
 * Current UI language, kept in sync with the `langchange` event dispatched by
 * `LangToggle`. The initial value is read lazily and guarded for SSR: the
 * island is server-rendered before hydration, where `document` doesn't exist.
 * `langchange` carries the new language in its `detail`, which is authoritative
 * — `getCurrentLang()` is the fallback for a bare event.
 */
function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(() =>
    typeof document === 'undefined' ? 'en' : getCurrentLang(),
  );

  useEffect(() => {
    // Re-sync on mount: hydration can land after the toggle already ran.
    setLang(getCurrentLang());

    const onLangChange = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: string }>).detail;
      setLang(
        detail?.lang === 'es' || detail?.lang === 'en'
          ? detail.lang
          : getCurrentLang(),
      );
    };

    window.addEventListener(LANG_CHANGE_EVENT, onLangChange);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, onLangChange);
  }, []);

  return lang;
}

/**
 * Renders SVG icons aligned with Font Awesome:
 * - fa:fa-user
 * - fa:fa-user-tie
 * - fa:fa-circle-nodes
 * - application (fa-window-maximize)
 * - api (fa-code)
 * - negocio (fa-briefcase)
 * - dependencias (fa-database)
 */
function NodeIcon({
  icon,
  className = 'size-3.5',
}: {
  icon: ArchitectureNodeIcon;
  className?: string;
}) {
  switch (icon) {
    case 'user':
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="currentColor"
          viewBox="0 0 448 512"
        >
          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-91.4 0z" />
        </svg>
      );
    case 'user-tie':
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="currentColor"
          viewBox="0 0 448 512"
        >
          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512h388.6c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3h-15.6l-37.1 111.4c-4.3 12.8-16.3 21.4-29.8 21.4-2.8 0-5.6-.4-8.3-1.3l-34.9-11.6 20.3 162.7c1.3 10.3-6 19.5-16.4 20.4-1.2.1-2.4.1-3.6 0l-37.4-4.7-37.4 4.7c-1.2.1-2.4.1-3.6 0-10.4-.9-17.7-10.1-16.4-20.4l20.3-162.7-34.9 11.6c-2.7.9-5.5 1.3-8.3 1.3-13.5 0-25.5-8.6-29.8-21.4L194.3 304h-16z" />
        </svg>
      );
    case 'circle-nodes':
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="currentColor"
          viewBox="0 0 512 512"
        >
          <path d="M384 96c0-35.3-28.7-64-64-64s-64 28.7-64 64c0 7.8 1.4 15.3 4 22.2L179.8 198.4c-14.7-13.8-34.7-22.4-56.8-22.4-44.2 0-80 35.8-80 80s35.8 80 80 80c22 0 42-8.6 56.8-22.4l80.2 80.2c-2.6 6.9-4 14.4-4 22.2 0 35.3 28.7 64 64 64s64-28.7 64-64-28.7-64-64-64c-7.8 0-15.3 1.4-22.2 4l-80.2-80.2c1.4-4.5 2.2-9.2 2.2-14.1s-.8-9.6-2.2-14.1l80.2-80.2c6.9 2.6 14.4 4 22.2 4 35.3 0 64-28.7 64-64z" />
        </svg>
      );
    case 'app':
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="currentColor"
          viewBox="0 0 512 512"
        >
          <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM464 160H48V416c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V160zM96 96a16 16 0 1 0 0 32 16 16 0 1 0 0-32zm48 16a16 16 0 1 0 32 0 16 16 0 1 0 -32 0zm80-16a16 16 0 1 0 0 32 16 16 0 1 0 0-32z" />
        </svg>
      );
    case 'api':
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="currentColor"
          viewBox="0 0 640 512"
        >
          <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L514.7 256 428.1 342.6c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112zm-306.8 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L125.3 256l86.6-86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z" />
        </svg>
      );
    case 'business':
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="currentColor"
          viewBox="0 0 512 512"
        >
          <path d="M128 48c0-26.5 21.5-48 48-48h160c26.5 0 48 21.5 48 48v48h64c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64V48zm48 48h160V48H176v48zm-80 96v256h320V192H96z" />
        </svg>
      );
    case 'dependencies':
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="currentColor"
          viewBox="0 0 448 512"
        >
          <path d="M448 80v48c0 44.2-100.3 80-224 80S0 172.2 0 128V80C0 35.8 100.3 0 224 0s224 35.8 224 80zm0 128v48c0 44.2-100.3 80-224 80S0 300.2 0 256V208c48.8 33.7 131.7 48 224 48s175.2-14.3 224-48zm0 128v48c0 44.2-100.3 80-224 80S0 428.2 0 384V336c48.8 33.7 131.7 48 224 48s175.2-14.3 224-48z" />
        </svg>
      );
  }
}

/**
 * The hint + active-node blurb shared by the desktop and mobile detail
 * panels — extracted so the two layouts don't duplicate this JSX.
 */
function DetailPanel({
  activeNode,
  lang,
  testId,
  hintTestId,
  placement = 'card',
}: {
  activeNode: ArchitectureNode | undefined;
  lang: Lang;
  testId: string;
  hintTestId: string;
  /** `below` is the full-width strip under the stage, not a side card. */
  placement?: 'card' | 'below';
}) {
  const frame =
    placement === 'below'
      ? 'max-md:mt-3 max-md:rounded-[14px] max-md:border max-md:border-border2 max-md:bg-[var(--arch-node)] max-md:p-4 md:mt-4 md:border-0 md:border-t md:border-border md:bg-transparent md:px-2 md:pt-6 md:pb-2'
      : 'flex flex-col rounded-2xl border border-primary-600/20 bg-panel2 bg-[linear-gradient(180deg,rgba(47,107,255,0.1),transparent_65%)] p-6 backdrop-blur-sm';

  return (
    <div aria-live="polite" className={frame} data-testid={testId}>
      {SECTION_COPY.architecture.hint && (
        <p
          className={`${placement === 'below' ? 'mb-4' : 'mb-auto'} flex items-center gap-2 font-mono text-primary-600 text-xs tracking-wide`}
          data-testid={hintTestId}
        >
          <span
            aria-hidden="true"
            className="size-[7px] flex-none animate-pulse rounded-full bg-[var(--arch-live)] shadow-[0_0_10px_var(--arch-live)] motion-reduce:animate-none"
          />
          {SECTION_COPY.architecture.hint[lang]}
        </p>
      )}

      {activeNode && (
        <div data-arch-detail-body="">
          <div className="mb-2 flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7 flex-none items-center justify-center rounded-lg bg-primary-500/15 p-1.5 text-primary-400"
            >
              <NodeIcon className="size-4" icon={activeNode.icon} />
            </span>
            <h3 className="font-serif font-normal text-3xl text-text">
              {activeNode.label[lang]}
            </h3>
          </div>
          <p className="mb-4 font-mono text-faint text-xs">
            {activeNode.subtitle[lang]}
          </p>
          <p
            className={`text-[15px] text-muted leading-[1.62]${placement === 'below' ? ' max-w-[68ch]' : ''}`}
          >
            {activeNode.description[lang]}
          </p>
        </div>
      )}
    </div>
  );
}

function stageFaces(stage: ParentNode): HTMLElement[] {
  return [...stage.querySelectorAll<HTMLElement>('[data-arch-face]')];
}

function stagePaths(stage: ParentNode): SVGPathElement[] {
  return [
    ...stage.querySelectorAll<SVGPathElement>('[data-testid^="arch-line-"]'),
  ];
}

function settleFaces(faces: readonly HTMLElement[]): void {
  for (const face of faces) {
    face.style.opacity = '';
    face.style.transform = '';
  }
}

/** Paint links fully drawn. `createDrawable` leaves a dash if motion is cut. */
function settlePaths(paths: readonly SVGPathElement[]): void {
  for (const path of paths) {
    path.style.strokeDasharray = 'none';
    path.style.strokeDashoffset = '0';
  }
}

type Pausable = { pause: () => void };

/**
 * Traveling packet. Caller must already know motion is allowed — this
 * function calls `animate`.
 */
function playPacket(
  paths: readonly SVGPathElement[],
  packet: SVGGElement,
  isStopped: () => boolean,
): Pausable {
  let current: Pausable | null = null;
  let index = 0;
  const step = () => {
    if (isStopped()) return;
    const path = paths[index % paths.length];
    const length = path?.getTotalLength?.() ?? 0;
    if (!path || length < 1) {
      packet.setAttribute('opacity', '0');
      return;
    }
    const proxy = { t: 0 };
    current = animate(proxy, {
      t: 1,
      duration: 1100,
      ease: 'linear',
      onUpdate: () => {
        if (isStopped()) return;
        const point = path.getPointAtLength(
          Math.max(0, Math.min(1, proxy.t)) * length,
        );
        packet.setAttribute('transform', `translate(${point.x} ${point.y})`);
        packet.setAttribute('opacity', '1');
      },
      onComplete: () => {
        index += 1;
        step();
      },
    });
  };
  try {
    step();
  } catch {
    packet.setAttribute('opacity', '0');
  }
  return { pause: () => current?.pause() };
}

function measureStage(
  stage: HTMLElement,
  svg: SVGSVGElement,
  activeId: string,
): void {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (width < 2 || height < 2) return;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const origin = svg.getBoundingClientRect();
  const boxes = new Map<string, StageBox>();
  for (const button of stage.querySelectorAll<HTMLElement>(
    '[data-testid^="arch-node-"]',
  )) {
    const id = button.dataset.testid?.slice('arch-node-'.length);
    if (!id) continue;
    const rect = button.getBoundingClientRect();
    boxes.set(id, {
      x: rect.left + rect.width / 2 - origin.left,
      y: rect.top + rect.height / 2 - origin.top,
      w: rect.width,
      h: rect.height,
    });
  }

  const hub =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 767px)').matches;
  const core = boxes.get('negocio');
  for (const [from, to] of ARCHITECTURE_CONNECTIONS) {
    const a = boxes.get(from);
    const b = boxes.get(to);
    const path = svg.querySelector<SVGPathElement>(
      `[data-testid="arch-line-${from}-${to}"]`,
    );
    if (!(a && b && path)) continue;
    path.setAttribute(
      'd',
      stageLinkPath(a, b, { hub, fromId: from, toId: to, core }),
    );
  }

  const active = boxes.get(activeId);
  if (!active) return;
  stage.style.setProperty('--glow-x', `${(active.x / width) * 100}%`);
  stage.style.setProperty('--glow-y', `${(active.y / height) * 100}%`);
}

const MOBILE_HUB_NODE_CLASS: Record<string, string> = {
  negocio:
    'max-md:left-1/2 max-md:top-1/2 max-md:z-[3] max-md:max-w-[36%] max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:rounded-full',
  u: 'max-md:left-1/2 max-md:top-0 max-md:max-w-[72%] max-md:-translate-x-1/2',
  a: 'max-md:left-1/2 max-md:bottom-0 max-md:top-auto max-md:max-w-[72%] max-md:-translate-x-1/2',
  dependencias: 'max-md:left-0 max-md:top-[18%]',
  e: 'max-md:right-0 max-md:left-auto max-md:top-[18%]',
  ap: 'max-md:left-0 max-md:bottom-[18%] max-md:top-auto',
  i: 'max-md:right-0 max-md:left-auto max-md:bottom-[18%] max-md:top-auto',
};

/**
 * Interactive architecture diagram. Uses Open Design's unified responsive stage
 * (mesh, curved links, entrance, packet): square radial hub below `md` and
 * 4-column board from `md` upward, with the detail below.
 *
 * shortcut: glow sits on the active node, not the pointer — upgrade if the
 * stage should track the cursor.
 */
export default function ArchitectureDiagram() {
  const lang = useLang();
  const [activeId, setActiveId] = useState<string>(
    DEFAULT_ARCHITECTURE_NODE_ID,
  );
  const [motionOn, setMotionOn] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const packetRef = useRef<SVGGElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const activeNode = resolveActiveNode(ARCHITECTURE_NODES, activeId);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionOn(shouldAnimateStage(window.matchMedia));
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    const svg = svgRef.current;
    if (!(stage && svg)) return;
    const draw = () => measureStage(stage, svg, activeId);
    draw();
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
    observer?.observe(stage);
    const mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(max-width: 767px)')
        : null;
    mq?.addEventListener('change', draw);
    return () => {
      observer?.disconnect();
      mq?.removeEventListener('change', draw);
    };
  }, [activeId]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const faces = stageFaces(stage);
    const paths = stagePaths(stage);
    if (!motionOn) {
      settleFaces(faces);
      settlePaths(paths);
      return;
    }
    if (faces.length === 0) return;
    const running: Pausable[] = [];
    try {
      for (const face of faces) face.style.opacity = '0';
      running.push(
        animate(faces, {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 320,
          delay: stagger(40),
          ease: 'out(2)',
        }),
      );
      const drawable = paths.filter(
        (path) => (path.getAttribute('d') ?? '').length > 0,
      );
      if (drawable.length > 0) {
        running.push(
          animate(createDrawable(drawable), {
            draw: '0 1',
            duration: 420,
            delay: stagger(36),
            ease: 'out(2)',
          }),
        );
      }
    } catch {
      settleFaces(faces);
      settlePaths(paths);
    }
    return () => {
      for (const anim of running) anim.pause();
    };
  }, [motionOn]);

  useEffect(() => {
    const packet = packetRef.current;
    const stage = stageRef.current;
    if (!(packet && stage)) return;
    if (!motionOn) {
      packet.setAttribute('opacity', '0');
      return;
    }
    const related = stagePaths(stage).filter(
      (path) => path.dataset.from === activeId || path.dataset.to === activeId,
    );
    const paths = related.length > 0 ? related : stagePaths(stage);
    let stopped = false;
    const anim = playPacket(paths, packet, () => stopped);
    return () => {
      stopped = true;
      anim.pause();
      packet.setAttribute('opacity', '0');
    };
  }, [motionOn, activeId]);

  useEffect(() => {
    const root = desktopRef.current;
    if (!(motionOn && root)) return;
    const bodies = [
      ...root.querySelectorAll<HTMLElement>('[data-arch-detail-body]'),
    ];
    // activeId is the trigger: the detail copy just changed.
    if (bodies.length === 0 || !activeId) return;
    let anim: Pausable | null = null;
    try {
      anim = animate(bodies, {
        opacity: [0.72, 1],
        translateY: [4, 0],
        duration: 320,
        ease: 'out(2)',
      });
    } catch {
      for (const body of bodies) {
        body.style.opacity = '1';
        body.style.transform = '';
      }
    }
    return () => anim?.pause();
  }, [motionOn, activeId]);

  return (
    <div data-testid="arch-diagram" ref={desktopRef}>
      <div
        className="relative isolate overflow-visible rounded-2xl border border-border2 bg-panel p-4 md:p-6"
        ref={stageRef}
        style={{
          backgroundImage:
            'radial-gradient(420px 240px at var(--glow-x, 68%) var(--glow-y, 42%), var(--arch-glow), transparent 70%)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage:
              'linear-gradient(var(--arch-mesh) 1px, transparent 1px), linear-gradient(90deg, var(--arch-mesh) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(black, transparent 92%)',
          }}
        />

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          ref={svgRef}
        >
          {ARCHITECTURE_CONNECTIONS.map(([from, to]) => {
            const isConnActive = from === activeId || to === activeId;
            if (!(NODE_BY_ID.has(from) && NODE_BY_ID.has(to))) return null;
            return (
              <path
                data-active={String(isConnActive)}
                data-from={from}
                data-testid={`arch-line-${from}-${to}`}
                data-to={to}
                fill="none"
                key={`${from}-${to}`}
                stroke={
                  isConnActive ? 'var(--arch-link-on)' : 'var(--arch-link)'
                }
                strokeLinecap="round"
                strokeWidth={isConnActive ? 2 : 1.5}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <g className="text-primary2" opacity="0" ref={packetRef}>
            <circle className="fill-current opacity-30" r="9" />
            <circle className="fill-current" r="4" />
          </g>
        </svg>

        <section
          aria-label={SECTION_COPY.architecture.tag[lang]}
          className="relative z-10 block aspect-square min-h-[280px] md:grid md:aspect-auto md:min-h-[480px] md:grid-cols-4 md:gap-3"
          data-testid="arch-board"
        >
          {ARCHITECTURE_LAYERS.map((layer) => (
            <div
              className="contents md:flex md:min-w-0 md:flex-col md:gap-3"
              key={layer.id}
            >
              <p
                className="hidden font-mono text-xs uppercase tracking-[0.08em] text-subtle md:block"
                data-arch-layer-heading=""
              >
                {layer.label}
              </p>
              <div className="contents md:flex md:flex-1 md:flex-col md:items-center md:justify-center md:gap-3">
                {ARCHITECTURE_NODES.filter(
                  (node) => node.layer === layer.id,
                ).map((node) => {
                  const isActive = node.id === activeId;
                  const mobilePos = MOBILE_HUB_NODE_CLASS[node.id] ?? '';
                  return (
                    <button
                      aria-pressed={isActive}
                      className={`flex w-max max-w-full items-center rounded-xl border text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 motion-reduce:transition-none max-md:absolute max-md:min-h-[44px] max-md:max-w-[calc(50%-56px)] ${mobilePos} ${
                        isActive
                          ? 'border-primary-600 bg-[var(--arch-node-active)] shadow-[0_0_0_1px_var(--arch-active-ring),0_8px_20px_var(--arch-active-shadow)]'
                          : 'border-border2 bg-[var(--arch-node)] hover:border-[var(--arch-border-hover)]'
                      }`}
                      data-testid={`arch-node-${node.id}`}
                      key={node.id}
                      onClick={() => setActiveId(node.id)}
                      onFocus={() => setActiveId(node.id)}
                      onMouseEnter={() => setActiveId(node.id)}
                      type="button"
                    >
                      <span
                        className="flex min-w-0 items-center gap-1.5 px-2.5 py-2 md:gap-2.5 md:px-3.5 md:py-3"
                        data-arch-face=""
                      >
                        <span
                          aria-hidden="true"
                          className={`flex size-4 flex-none items-center justify-center md:size-[18px] ${
                            isActive
                              ? 'text-[var(--arch-icon-active)]'
                              : 'text-[var(--arch-icon)]'
                          }`}
                        >
                          <NodeIcon
                            className="size-4 md:size-[18px]"
                            icon={node.icon}
                          />
                        </span>
                        <span className="flex min-w-0 flex-col text-left leading-[1.2]">
                          <span className="truncate font-sans font-semibold text-[13px] text-text">
                            {node.label[lang]}
                          </span>
                          <span
                            className="hidden truncate font-mono text-[11px] text-muted md:block"
                            data-arch-node-sub=""
                          >
                            {node.subtitle[lang]}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      <DetailPanel
        activeNode={activeNode}
        hintTestId="arch-hint"
        lang={lang}
        placement="below"
        testId="arch-detail"
      />
    </div>
  );
}
