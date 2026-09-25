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
              className="size-2.5 flex-none rounded-full bg-primary-500 shadow-glow-sm"
            />
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
 * same `activeId` state and `DetailPanel` — the mock has no mobile treatment
 * of its own to port, so this is new layout, matching HOME-009's sad path
 * ("degrades to a legible single-column/stacked layout... rather than
 * shrinking the percentage-positioned diagram illegibly").
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
                    ? 'border-primary-600 bg-primary-600/15'
                    : 'border-border2 bg-panel2'
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
        className="hidden items-stretch gap-6 md:grid md:grid-cols-[1.45fr_1fr]"
        data-testid="arch-desktop"
      >
        <div className="relative aspect-[16/11] min-h-[400px] overflow-hidden rounded-2xl border border-border bg-panel backdrop-blur-sm">
          {ARCHITECTURE_LAYERS.map((layer) => (
            <span
              aria-hidden="true"
              className="-translate-x-1/2 absolute top-[4%] font-mono text-2xs text-dim tracking-[0.1em]"
              key={layer.id}
              style={{ left: `${layer.x}%` }}
            >
              {layer.label}
            </span>
          ))}

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
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

              return (
                <line
                  className="[transition:stroke_.25s_ease,stroke-width_.25s_ease]"
                  data-active={String(from === activeId || to === activeId)}
                  data-testid={`arch-line-${from}-${to}`}
                  key={`${from}-${to}`}
                  stroke={stroke.stroke}
                  strokeDasharray="3 3.5"
                  strokeWidth={stroke.width}
                  vectorEffect="non-scaling-stroke"
                  x1={a.x}
                  x2={b.x}
                  y1={a.y}
                  y2={b.y}
                />
              );
            })}
          </svg>

          {ARCHITECTURE_NODES.map((node) => {
            const isActive = node.id === activeId;

            return (
              <button
                aria-pressed={isActive}
                className={`-translate-x-1/2 -translate-y-1/2 absolute z-10 flex items-center gap-2 rounded-[11px] border px-3 py-2 backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 ${
                  isActive
                    ? 'border-primary-600 bg-primary-600/15 shadow-[0_0_0_1px_rgba(47,107,255,0.55),0_10px_34px_rgba(47,107,255,0.4)]'
                    : 'border-border2 bg-panel2 shadow-[0_4px_18px_rgba(0,0,0,0.4)] hover:border-primary-500/60'
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
