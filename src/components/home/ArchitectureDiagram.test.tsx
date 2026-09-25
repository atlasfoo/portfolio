// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
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

// @testing-library/react's auto-cleanup only kicks in when `afterEach` is a
// vitest global; this project doesn't set `test.globals: true`, so clean up
// explicitly to avoid cross-test DOM leakage (see ProjectsGrid.test.tsx).
afterEach(cleanup);

describe('ArchitectureDiagram', () => {
  afterEach(() => {
    delete document.documentElement.dataset.lang;
  });

  test('shows the default node detail on first render', () => {
    render(<ArchitectureDiagram />);

    const defaultNode = getNode(DEFAULT_ARCHITECTURE_NODE_ID);
    const detail = screen.getByTestId('arch-detail');
    expect(detail.textContent ?? '').toContain(defaultNode.description.en);
  });

  test('a node button is a real <button>, reachable by Tab', () => {
    render(<ArchitectureDiagram />);

    const button = screen.getByTestId('arch-node-pagos');
    expect(button.tagName).toBe('BUTTON');
  });

  test('clicking a node button updates the detail panel and the connecting lines highlight state', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await user.click(screen.getByTestId('arch-node-pagos'));

    expectNodeActive('pagos');
  });

  test('Tab-ing to a node button and pressing Enter updates state the same way a click does', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await tabToNode(user, 'arch-node-gw');
    await user.keyboard('{Enter}');

    expectNodeActive('gw');
  });

  test('Tab-ing to a node button and pressing Space updates state the same way a click does', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await tabToNode(user, 'arch-node-openb');
    await user.keyboard(' ');

    expectNodeActive('openb');
  });

  test('re-renders the detail panel with the active node text on langchange', async () => {
    const user = userEvent.setup();
    render(<ArchitectureDiagram />);

    await user.click(screen.getByTestId('arch-node-pagos'));
    expectNodeActive('pagos', 'en');

    act(() => {
      dispatchLangChange('es');
    });

    expectNodeActive('pagos', 'es');
  });

  test("node label/subtitle/radius match the mock's exact metrics", () => {
    render(<ArchitectureDiagram />);

    const button = screen.getByTestId('arch-node-pagos');
    expect(button.className).toMatch(/rounded-\[11px\]/);

    const label = button.querySelector('.text-\\[12\\.5px\\]');
    const subtitle = button.querySelector('.text-\\[9px\\]');
    expect(label).not.toBeNull();
    expect(subtitle).not.toBeNull();
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

  // Post-Phase-7 polish (developer QA): the detail panel's background used a
  // hardcoded dark stop (`surface-800`), not a theme-aware token, so it read
  // muddy in light mode though dark mode was fine. Fixed to the same
  // panel-token + primary-tinted-gradient pattern Methodology's card already
  // uses (T-087), which flips correctly with [data-theme="light"].
  test('the detail panel uses theme-aware tokens, not a hardcoded dark gradient stop', () => {
    render(<ArchitectureDiagram />);

    const detail = screen.getByTestId('arch-detail');
    expect(detail.className).not.toMatch(/surface-800/);
    expect(detail.className).toMatch(/\bbg-panel2\b/);
    expect(detail.className).toMatch(/bg-\[.*rgba\(47,107,255/);

    const mobileDetail = screen.getByTestId('arch-detail-mobile');
    expect(mobileDetail.className).not.toMatch(/surface-800/);
    expect(mobileDetail.className).toMatch(/\bbg-panel2\b/);
  });

  // T-095/T-096 (Phase 7): below md:, the absolute-positioned canvas gives way
  // to a plain stacked list of node buttons — no SVG lines, same shared state.
  describe('mobile stacked layout', () => {
    test('renders a node button per node in the mobile list, distinct from the desktop canvas buttons', () => {
      render(<ArchitectureDiagram />);

      const list = screen.getByTestId('arch-mobile-list');
      for (const node of ARCHITECTURE_NODES) {
        const button = screen.getByTestId(`arch-node-mobile-${node.id}`);
        expect(list.contains(button)).toBe(true);
        expect(button.tagName).toBe('BUTTON');
      }
    });

    test('shows the default node detail in the mobile detail panel on first render', () => {
      render(<ArchitectureDiagram />);

      const defaultNode = getNode(DEFAULT_ARCHITECTURE_NODE_ID);
      const detail = screen.getByTestId('arch-detail-mobile');
      expect(detail.textContent ?? '').toContain(defaultNode.description.en);
    });

    test('clicking a mobile node button updates the mobile detail panel and marks it pressed', async () => {
      const user = userEvent.setup();
      render(<ArchitectureDiagram />);

      const button = screen.getByTestId('arch-node-mobile-pagos');
      await user.click(button);

      const node = getNode('pagos');
      const detail = screen.getByTestId('arch-detail-mobile');
      expect(detail.textContent ?? '').toContain(node.description.en);
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    test('the desktop canvas block is hidden below md: and the mobile list only shows at md:hidden', () => {
      render(<ArchitectureDiagram />);

      const mobileList = screen.getByTestId('arch-mobile');
      expect(mobileList.className).toMatch(/\bmd:hidden\b/);

      const desktopCanvas = screen.getByTestId('arch-desktop');
      expect(desktopCanvas.className).toMatch(/\bhidden\b/);
      expect(desktopCanvas.className).toMatch(/\bmd:grid\b/);
    });
  });
});
