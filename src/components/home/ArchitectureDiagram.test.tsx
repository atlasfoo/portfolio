// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  ARCHITECTURE_CONNECTIONS,
  ARCHITECTURE_NODES,
  DEFAULT_ARCHITECTURE_NODE_ID,
  SECTION_COPY,
} from '../../content/homepage';
import { dispatchLangChange } from '../../lib/lang-client';
// Component doesn't exist yet (T-036) — this import is expected to fail to
// resolve, which is the "red for the right reason" this test starts red for.
import ArchitectureDiagram from './ArchitectureDiagram';

/**
 * Failing-first tests for `ArchitectureDiagram.tsx` (T-036).
 *
 * This test file IS the DOM contract T-036 implements against — see the
 * helpers below for the exact shape expected:
 *
 * - Each node is a real `<button>` (reachable by Tab, activated by
 *   Enter/Space), `data-testid="arch-node-<id>"`.
 * - The detail panel is `data-testid="arch-detail"`, its text content is
 *   the active node's `description[lang]`.
 * - Each connection is rendered as a line-like element,
 *   `data-testid="arch-line-<from>-<to>"`, carrying `data-active="true"`
 *   when either endpoint is the active node, `"false"` otherwise.
 * - The component reads `getCurrentLang()` on mount and re-renders when
 *   the `langchange` event (see `lib/lang-client.ts`) fires.
 */

function getNode(id: string) {
  const node = ARCHITECTURE_NODES.find((n) => n.id === id);
  if (!node) {
    throw new Error(`fixture node not found: ${id}`);
  }
  return node;
}

/** Asserts the detail panel and every connecting line reflect `nodeId` as active. */
function expectNodeActive(nodeId: string, lang: 'en' | 'es' = 'en') {
  const node = getNode(nodeId);
  const detail = screen.getByTestId('arch-detail');
  expect(detail.textContent ?? '').toContain(node.description[lang]);

  for (const [from, to] of ARCHITECTURE_CONNECTIONS) {
    const isActive = from === nodeId || to === nodeId;
    const line = screen.getByTestId(`arch-line-${from}-${to}`);
    expect(line.getAttribute('data-active')).toBe(String(isActive));
  }
}

/** Tabs forward until `testId`'s element is focused, or fails within a bound. */
async function tabToNode(
  user: ReturnType<typeof userEvent.setup>,
  testId: string,
) {
  const target = screen.getByTestId(testId);
  // The mobile node-button list (T-095/T-096) renders before the desktop
  // canvas in DOM order and stays tabbable in jsdom (no real stylesheet to
  // apply `md:hidden`'s display:none) — real browsers exclude it from tab
  // order, so this generous bound is a test-environment accommodation only.
  const maxPresses = ARCHITECTURE_NODES.length * 2 + 5;
  for (let i = 0; i < maxPresses; i++) {
    await user.tab();
    if (document.activeElement === target) {
      return;
    }
  }
  throw new Error(
    `could not reach ${testId} via Tab within ${maxPresses} presses`,
  );
}

type MatchMediaFn = (query: string) => { matches: boolean };

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const DARK_ONLY_PANEL = /#06080d|#0c101a/i;

function stubMatchMedia(reducedMotion: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query === REDUCED_MOTION,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function readDiagramSources(): { component: string; lib: string } {
  const root = process.cwd();
  return {
    component: readFileSync(
      `${root}/src/components/home/ArchitectureDiagram.tsx`,
      'utf8',
    ),
    lib: readFileSync(`${root}/src/lib/home/architecture-diagram.ts`, 'utf8'),
  };
}

/**
 * Stage motion is a call to `shouldAnimateStage` plus an animejs `animate`
 * import. Absent today — the assertion fails on that, not on a bad import.
 */
function stageMotionEntryPresent(component: string, lib: string): boolean {
  const gatesMotion = /shouldAnimateStage\s*\(/.test(component);
  const runsMotion =
    /from ['"]animejs['"]/.test(component) || /from ['"]animejs['"]/.test(lib);
  return gatesMotion && runsMotion;
}

// @testing-library/react's auto-cleanup only kicks in when `afterEach` is a
// vitest global; this project doesn't set `test.globals: true`, so clean up
// explicitly to avoid cross-test DOM leakage (see ProjectsGrid.test.tsx).
afterEach(cleanup);

describe('ArchitectureDiagram', () => {
  afterEach(() => {
    delete document.documentElement.dataset.lang;
    delete document.documentElement.dataset.theme;
    vi.unstubAllGlobals();
  });

  test('shows the default node detail on first render', () => {
    render(<ArchitectureDiagram />);

    const defaultNode = getNode(DEFAULT_ARCHITECTURE_NODE_ID);
    const detail = screen.getByTestId('arch-detail');
    expect(detail.textContent ?? '').toContain(defaultNode.description.en);
  });

  test('a node button is a real <button>, reachable by Tab', () => {
    render(<ArchitectureDiagram />);

    const button = screen.getByTestId('arch-node-a');
    expect(button.tagName).toBe('BUTTON');
  });

  test('clicking a node button updates the detail panel and the connecting lines highlight state', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await user.click(screen.getByTestId('arch-node-a'));

    expectNodeActive('a');
  });

  test('Tab-ing to a node button and pressing Enter updates state the same way a click does', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await tabToNode(user, 'arch-node-ap');
    await user.keyboard('{Enter}');

    expectNodeActive('ap');
  });

  test('Tab-ing to a node button and pressing Space updates state the same way a click does', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await tabToNode(user, 'arch-node-u');
    await user.keyboard(' ');

    expectNodeActive('u');
  });

  test('re-renders the detail panel with the active node text on langchange', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await user.click(screen.getByTestId('arch-node-a'));
    expectNodeActive('a', 'en');

    act(() => {
      dispatchLangChange('es');
    });

    expectNodeActive('a', 'es');
  });

  test('a node button shows its label and subtitle, not old SVG metrics', () => {
    render(<ArchitectureDiagram />);

    const node = getNode('a');
    const button = screen.getByTestId('arch-node-a');
    expect(button.textContent ?? '').toContain(node.label.en);
    expect(button.textContent ?? '').toContain(node.subtitle.en);
  });

  test('renders the hover/tap hint inside the detail panel, above the active node detail', () => {
    render(<ArchitectureDiagram />);

    const hint = screen.getByTestId('arch-hint');
    expect(hint.textContent ?? '').toContain(
      SECTION_COPY.architecture.hint?.en,
    );

    const detail = screen.getByTestId('arch-detail');
    const hintIndex = Array.from(detail.querySelectorAll('*')).indexOf(hint);
    const nodeDetailHeading = detail.querySelector('h3');
    const headingIndex = nodeDetailHeading
      ? Array.from(detail.querySelectorAll('*')).indexOf(nodeDetailHeading)
      : -1;
    expect(hintIndex).toBeGreaterThanOrEqual(0);
    expect(headingIndex).toBeGreaterThan(hintIndex);
  });

  // Detail sits under the stage: card treatment on mobile, top-bordered strip
  // on desktop, never a hardcoded dark fill or surface-800.
  test('the detail panel uses theme-aware tokens, not a hardcoded dark gradient stop', () => {
    render(<ArchitectureDiagram />);

    const detail = screen.getByTestId('arch-detail');
    expect(detail.className).not.toMatch(/surface-800/);
    expect(detail.className).not.toMatch(DARK_ONLY_PANEL);
    expect(detail.className).toMatch(/\bmd:border-t\b/);
    expect(detail.className).toMatch(/\bmd:border-border\b/);
    expect(detail.className).toMatch(/max-md:bg-\[var\(--arch-node\)\]/);
  });

  describe('mobile radial hub', () => {
    test('uses one unified stage for mobile and desktop without duplicating nodes or detail panels', () => {
      render(<ArchitectureDiagram />);

      expect(screen.queryByTestId('arch-mobile-list')).toBeNull();
      expect(screen.queryByTestId('arch-detail-mobile')).toBeNull();

      for (const node of ARCHITECTURE_NODES) {
        expect(screen.getAllByTestId(`arch-node-${node.id}`)).toHaveLength(1);
      }
    });

    test('renders a square radial hub below md and a 4-column grid from md upward', () => {
      render(<ArchitectureDiagram />);

      const board = screen.getByTestId('arch-board');
      expect(board.className).toMatch(/\baspect-square\b/);
      expect(board.className).toContain('min-h-[280px]');
      expect(board.className).toMatch(/\bmd:grid\b/);
      expect(board.className).toMatch(/\bmd:grid-cols-4\b/);
      expect(board.className).toMatch(/\bmd:aspect-auto\b/);

      const layers = board.querySelectorAll('[data-arch-layer-heading]');
      expect(layers.length).toBeGreaterThan(0);
      for (const heading of layers) {
        expect(heading.className).toMatch(/\bhidden\b/);
        expect(heading.className).toMatch(/\bmd:block\b/);
      }
    });

    test('positions nodes radially below md with negocio centered as a pill and subtitles hidden on mobile', () => {
      render(<ArchitectureDiagram />);

      const negocio = screen.getByTestId('arch-node-negocio');
      expect(negocio.className).toMatch(/\bmax-md:absolute\b/);
      expect(negocio.className).toMatch(/\bmax-md:left-1\/2\b/);
      expect(negocio.className).toMatch(/\bmax-md:top-1\/2\b/);
      expect(negocio.className).toMatch(/\bmax-md:rounded-full\b/);

      const userNode = screen.getByTestId('arch-node-u');
      expect(userNode.className).toMatch(/\bmax-md:top-0\b/);
      const appNode = screen.getByTestId('arch-node-a');
      expect(appNode.className).toMatch(/\bmax-md:bottom-0\b/);

      const subtitles = screen
        .getByTestId('arch-board')
        .querySelectorAll('[data-arch-node-sub]');
      expect(subtitles.length).toBe(ARCHITECTURE_NODES.length);
      for (const sub of subtitles) {
        expect(sub.className).toMatch(/\bhidden\b/);
        expect(sub.className).toMatch(/\bmd:block\b/);
      }
    });

    test('detail sits below the full-width stage with mobile card and desktop top-border strip', () => {
      render(<ArchitectureDiagram />);

      const diagram = screen.getByTestId('arch-diagram');
      const detail = screen.getByTestId('arch-detail');
      const stage = diagram.firstElementChild;

      expect(diagram.className).not.toMatch(/\bmd:grid\b/);
      expect(diagram.className).not.toMatch(/grid-cols-/);

      expect(stage).toBeTruthy();
      expect(stage).not.toBe(detail);
      expect(stage?.nextElementSibling).toBe(detail);
      expect(detail.className).toContain('max-md:rounded-[14px]');
      expect(detail.className).toMatch(/\bmd:border-t\b/);
      expect(detail.className).toMatch(/\bmd:mt-4\b/);

      const description = detail.querySelector(
        '[data-arch-detail-body] p:last-of-type',
      );
      expect(description?.className ?? '').toMatch(/max-w-\[68ch\]/);
    });
  });

  // HOME-012. Motion is not wired yet: these fail because the stage-motion
  // entry point is absent, not because the suite cannot load.
  describe('stage motion', () => {
    test('click or keyboard chooses a node, shows that detail in the active language, and runs stage motion when reduced-motion is off', async () => {
      document.documentElement.dataset.lang = 'es';
      stubMatchMedia(false);
      const user = userEvent.setup();
      render(<ArchitectureDiagram />);

      await user.click(screen.getByTestId('arch-node-a'));
      expectNodeActive('a', 'es');

      await tabToNode(user, 'arch-node-ap');
      await user.keyboard('{Enter}');
      expectNodeActive('ap', 'es');

      const { component, lib } = readDiagramSources();
      if (!stageMotionEntryPresent(component, lib)) {
        expect.fail('stage motion entry point is absent');
      }
    });

    test('with reduced-motion the stage is settled, does not animate, and click or keyboard still updates the detail', async () => {
      document.documentElement.dataset.lang = 'en';
      stubMatchMedia(true);
      const user = userEvent.setup();
      render(<ArchitectureDiagram />);

      await user.click(screen.getByTestId('arch-node-a'));
      expectNodeActive('a', 'en');

      await tabToNode(user, 'arch-node-u');
      await user.keyboard(' ');
      expectNodeActive('u', 'en');

      const mod = (await import('../../lib/home/architecture-diagram')) as {
        shouldAnimateStage?: (matchMedia: MatchMediaFn) => boolean;
      };
      if (typeof mod.shouldAnimateStage !== 'function') {
        expect.fail('shouldAnimateStage is not exported');
      }
      expect(mod.shouldAnimateStage(window.matchMedia)).toBe(false);

      const { component, lib } = readDiagramSources();
      if (!stageMotionEntryPresent(component, lib)) {
        expect.fail('stage motion entry point is absent');
      }
    });

    test('light theme stage does not depend on a hardcoded dark-only panel fill', () => {
      document.documentElement.dataset.theme = 'light';
      render(<ArchitectureDiagram />);

      const { component, lib } = readDiagramSources();
      expect(component).not.toMatch(DARK_ONLY_PANEL);
      expect(lib).not.toMatch(DARK_ONLY_PANEL);
      // surface-800 is #0c101a and does not flip under [data-theme="light"].
      expect(component).not.toMatch(/\bsurface-800\b/);
      expect(component).toMatch(/\bbg-panel\b|\bbg-bg\b|var\(--(?:panel|bg)\)/);

      const root = screen.getByTestId('arch-diagram');
      expect(root.outerHTML).not.toMatch(DARK_ONLY_PANEL);
    });
  });
});
