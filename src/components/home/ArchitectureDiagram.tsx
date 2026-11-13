import { useEffect, useState } from 'react';
import {
  ARCHITECTURE_CONNECTIONS,
  ARCHITECTURE_LAYERS,
  ARCHITECTURE_NODES,
  type ArchitectureNode,
  DEFAULT_ARCHITECTURE_NODE_ID,
  SECTION_COPY,
} from '../../content/homepage';
import {
  lineState,
  resolveActiveNode,
} from '../../lib/home/architecture-diagram';
import type { Lang } from '../../lib/lang';
import { getCurrentLang, LANG_CHANGE_EVENT } from '../../lib/lang-client';

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

import type { ArchitectureNodeIcon } from '../../content/homepage';

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
}: {
  activeNode: ArchitectureNode | undefined;
  lang: Lang;
  testId: string;
  hintTestId: string;
}) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col rounded-2xl border border-primary-600/20 bg-panel2 bg-[linear-gradient(180deg,rgba(47,107,255,0.1),transparent_65%)] p-6 backdrop-blur-sm"
      data-testid={testId}
    >
      {SECTION_COPY.architecture.hint && (
        <p
          className="mb-auto font-mono text-primary-600 text-xs tracking-wide"
          data-testid={hintTestId}
        >
          {SECTION_COPY.architecture.hint[lang]}
        </p>
      )}

      {activeNode && (
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7 flex-none items-center justify-center rounded-lg bg-primary-500/15 text-primary-400 p-1.5"
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
          <p className="text-[15px] text-muted leading-[1.62]">
            {activeNode.description[lang]}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Interactive architecture diagram: absolutely-positioned node buttons over an
 * SVG of connecting lines, plus the detail panel describing the active node.
 *
 * Unlike the design mock's hover-only `div`s, every node is a real `<button>`:
 * reachable with Tab, activated by the browser's native Enter/Space handling,
 * and carrying a visible `focus-visible` ring. Pointer hover and focus preview
 * a node so mouse and keyboard users get the same affordance.
 *
 * Below `md:`, the absolutely-positioned canvas gives way to a plain stacked
 * list of node buttons (no SVG lines to fit into a narrow width) sharing the
 * same `activeId` state and `DetailPanel`.
 */
export default function ArchitectureDiagram() {
  const lang = useLang();
  const [activeId, setActiveId] = useState<string>(
    DEFAULT_ARCHITECTURE_NODE_ID,
  );

  const activeNode = resolveActiveNode(ARCHITECTURE_NODES, activeId);
  const strokes = lineState(ARCHITECTURE_CONNECTIONS, activeId);

  return (
    <>
      <div className="flex flex-col gap-4 md:hidden" data-testid="arch-mobile">
        <div className="flex flex-col gap-2" data-testid="arch-mobile-list">
          {ARCHITECTURE_NODES.map((node) => {
            const isActive = node.id === activeId;

            return (
              <button
                aria-pressed={isActive}
                className={`flex items-center gap-2.5 rounded-[11px] border px-3.5 py-2.5 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 ${
                  isActive
                    ? 'border-primary-600 bg-bg bg-[linear-gradient(180deg,rgba(47,107,255,0.18),var(--bg))]'
                    : 'border-border2 bg-bg bg-[linear-gradient(180deg,rgba(255,255,255,0.05),var(--bg))]'
                }`}
                data-testid={`arch-node-mobile-${node.id}`}
                key={node.id}
                onClick={() => setActiveId(node.id)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="size-[7px] flex-none rounded-full"
                  style={{
                    background: node.dotColor,
                    boxShadow: `0 0 8px ${node.dotColor}`,
                  }}
                />
                <span
                  aria-hidden="true"
                  className="flex size-4 flex-none items-center justify-center text-primary-400"
                >
                  <NodeIcon className="size-3" icon={node.icon} />
                </span>
                <span className="flex flex-col text-left leading-[1.15]">
                  <span className="font-sans font-semibold text-[12.5px] text-body">
                    {node.label[lang]}
                  </span>
                  <span className="font-mono text-[9px] text-faint">
                    {node.subtitle[lang]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <DetailPanel
          activeNode={activeNode}
          hintTestId="arch-hint-mobile"
          lang={lang}
          testId="arch-detail-mobile"
        />
      </div>

      <div
        className="hidden items-stretch gap-6 md:grid md:grid-cols-[1.6fr_1fr]"
        data-testid="arch-desktop"
      >
        <div className="relative overflow-x-auto overflow-y-hidden rounded-2xl border border-border bg-panel backdrop-blur-sm [scrollbar-color:rgba(91,140,255,0.45)_rgba(255,255,255,0.02)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-primary-500/60 [&::-webkit-scrollbar-track]:bg-panel2/50">
          <div className="relative min-h-[520px] min-w-[1100px] w-full">
            {ARCHITECTURE_LAYERS.map((layer) => (
              <span
                aria-hidden="true"
                className="-translate-x-1/2 absolute top-[4%] z-10 font-mono text-2xs text-dim tracking-[0.1em]"
                key={layer.id}
                style={{ left: `${layer.x}%` }}
              >
                {layer.label}
              </span>
            ))}

            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              {ARCHITECTURE_CONNECTIONS.map(([from, to], index) => {
                const a = NODE_BY_ID.get(from);
                const b = NODE_BY_ID.get(to);
                const stroke = strokes[index];
                if (!(a && b && stroke)) {
                  return null;
                }

                const isConnActive = from === activeId || to === activeId;
                const midX = (a.x + b.x) / 2;
                const midY = (a.y + b.y) / 2;
                const angle =
                  (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

                return (
                  <g key={`${from}-${to}`}>
                    <line
                      className="[transition:stroke_.25s_ease,stroke-width_.25s_ease]"
                      data-active={String(isConnActive)}
                      data-testid={`arch-line-${from}-${to}`}
                      stroke={stroke.stroke}
                      strokeDasharray="3 3.5"
                      strokeWidth={stroke.width}
                      vectorEffect="non-scaling-stroke"
                      x1={a.x}
                      x2={b.x}
                      y1={a.y}
                      y2={b.y}
                    />
                    <polygon
                      className="[transition:fill_.25s_ease]"
                      fill={stroke.stroke}
                      points="-1.2,-1.2 1.5,0 -1.2,1.2"
                      transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                    />
                  </g>
                );
              })}
            </svg>

            {ARCHITECTURE_NODES.map((node) => {
              const isActive = node.id === activeId;

              return (
                <button
                  aria-pressed={isActive}
                  className={`-translate-x-1/2 -translate-y-1/2 absolute z-20 flex items-center gap-2 rounded-[11px] border px-3 py-2 transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 ${
                    isActive
                      ? 'border-primary-600 bg-bg bg-[linear-gradient(180deg,rgba(47,107,255,0.18),var(--bg))] shadow-[0_0_0_1px_rgba(47,107,255,0.55),0_10px_34px_rgba(47,107,255,0.4)]'
                      : 'border-border2 bg-bg bg-[linear-gradient(180deg,rgba(255,255,255,0.05),var(--bg))] shadow-[0_4px_18px_rgba(0,0,0,0.4)] hover:border-primary-500/60 hover:bg-[linear-gradient(180deg,rgba(47,107,255,0.08),var(--bg))]'
                  }`}
                  data-testid={`arch-node-${node.id}`}
                  key={node.id}
                  onClick={() => setActiveId(node.id)}
                  onFocus={() => setActiveId(node.id)}
                  onMouseEnter={() => setActiveId(node.id)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="size-[7px] flex-none rounded-full"
                    style={{
                      background: node.dotColor,
                      boxShadow: `0 0 8px ${node.dotColor}`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="flex size-4 flex-none items-center justify-center text-primary-400"
                  >
                    <NodeIcon className="size-3" icon={node.icon} />
                  </span>
                  <span className="flex flex-col text-left leading-[1.15]">
                    <span className="whitespace-nowrap font-sans font-semibold text-[12.5px] text-body">
                      {node.label[lang]}
                    </span>
                    <span className="whitespace-nowrap font-mono text-[9px] text-faint">
                      {node.subtitle[lang]}
                    </span>
                  </span>
                </button>
              );
            })}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-panel2/90 px-2.5 py-1 font-mono text-[10px] text-primary-400/80 shadow-sm backdrop-blur-md"
            >
              <span>↔ Scroll</span>
            </div>
          </div>
        </div>

        <DetailPanel
          activeNode={activeNode}
          hintTestId="arch-hint"
          lang={lang}
          testId="arch-detail"
        />
      </div>
    </>
  );
}
