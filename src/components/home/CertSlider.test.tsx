// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
// Component does not exist yet (T-006) — this import fails to resolve,
// providing the TDD failing-first red gate for the React slider island.
import CertSlider from './CertSlider';

/**
 * Failing-first tests for `CertSlider.tsx` (T-005 / HOME-013).
 *
 * Contract:
 * - Two design certs:
 *   1. AWS Certified Solutions Architect (Amazon Web Services, 2024-03 to 2027-03, badge image).
 *   2. Scrum Foundation Professional Certification (SFPC™) (CertiProf, monogram SF / SFPC, no image).
 * - Initial position indicator: "01 / 02".
 * - Controls: Previous button, Next button, two dot buttons.
 * - Autoplay interval: 5200ms (5.2s).
 * - Autoplay turns off on user interaction (next, previous, dot, hover/focus).
 * - Reduced motion (`prefers-reduced-motion: reduce`) or single cert disables autoplay,
 *   renders no empty slide, and does not trap focus.
 */

const FIXTURE_CERTS = [
  {
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issued: '2024-03',
    expires: '2027-03',
    image: '/certs/aws-certified-solutions-architect.png',
  },
  {
    name: 'Scrum Foundation Professional Certification (SFPC™)',
    issuer: 'CertiProf',
    monogram: { top: 'SF', bottom: 'SFPC' },
  },
];

function stubMatchMedia(reducedMotion: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
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

function getNextButton(): HTMLElement {
  return (
    screen.queryByRole('button', { name: /next|siguiente/i }) ??
    screen.getByTestId('cert-next')
  );
}

function getPrevButton(): HTMLElement {
  return (
    screen.queryByRole('button', { name: /prev|anterior/i }) ??
    screen.getByTestId('cert-prev')
  );
}

function getPositionLabel(): HTMLElement {
  return (
    screen.queryByTestId('cert-position') ??
    screen.getByText(/0[1-9]\s*\/\s*0[1-9]/)
  );
}

function getDots(): HTMLElement[] {
  const tabs = screen.queryAllByRole('tab');
  if (tabs.length > 0) return tabs;
  const namedDots = screen.queryAllByRole('button', {
    name: /(?:slide|cert|dot|punto)\s*[1-9]/i,
  });
  if (namedDots.length > 0) return namedDots;
  return screen.getAllByTestId(/^cert-dot-/);
}

beforeEach(() => {
  stubMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('CertSlider — Happy path (HOME-013)', () => {
  test('renders initial slide 1 with AWS cert details and 01 / 02 position label', () => {
    render(<CertSlider certs={FIXTURE_CERTS} />);

    expect(screen.getByText('AWS Certified Solutions Architect')).toBeTruthy();
    expect(screen.getByText('Amazon Web Services')).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('01 / 02');

    expect(getNextButton()).toBeTruthy();
    expect(getPrevButton()).toBeTruthy();
    expect(getDots()).toHaveLength(2);
  });

  test('autoplays to slide 2 after 5200ms when reduced-motion is off', () => {
    vi.useFakeTimers();
    render(<CertSlider certs={FIXTURE_CERTS} />);

    expect(getPositionLabel().textContent).toContain('01 / 02');

    act(() => {
      vi.advanceTimersByTime(5200);
    });

    expect(
      screen.getByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeTruthy();
    expect(screen.getByText('CertiProf')).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('02 / 02');

    // Autoplays back to slide 1 on next tick
    act(() => {
      vi.advanceTimersByTime(5200);
    });

    expect(screen.getByText('AWS Certified Solutions Architect')).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('01 / 02');
  });

  test('clicking next changes visible cert, position label, and stops autoplay', () => {
    vi.useFakeTimers();
    render(<CertSlider certs={FIXTURE_CERTS} />);

    fireEvent.click(getNextButton());

    expect(
      screen.getByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('02 / 02');

    // Autoplay must now be stopped: advancing past 5200ms should NOT switch slides back
    act(() => {
      vi.advanceTimersByTime(10400);
    });

    expect(
      screen.getByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('02 / 02');
  });

  test('clicking previous changes visible cert, position label, and stops autoplay', () => {
    vi.useFakeTimers();
    render(<CertSlider certs={FIXTURE_CERTS} />);

    fireEvent.click(getPrevButton());

    // From slide 1, clicking previous wraps to slide 2
    expect(
      screen.getByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('02 / 02');

    // Autoplay must be stopped
    act(() => {
      vi.advanceTimersByTime(10400);
    });

    expect(
      screen.getByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('02 / 02');
  });

  test('clicking a dot changes visible cert, position label, and stops autoplay', () => {
    vi.useFakeTimers();
    render(<CertSlider certs={FIXTURE_CERTS} />);

    const dots = getDots();
    expect(dots).toHaveLength(2);

    fireEvent.click(dots[1]);

    expect(
      screen.getByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('02 / 02');

    // Autoplay must be stopped
    act(() => {
      vi.advanceTimersByTime(10400);
    });

    expect(
      screen.getByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('02 / 02');
  });

  test('hover or focus on the slider stops autoplay', () => {
    vi.useFakeTimers();
    const { container } = render(<CertSlider certs={FIXTURE_CERTS} />);

    // Trigger hover / focus on slider container
    fireEvent.mouseEnter(container.firstElementChild ?? container);

    act(() => {
      vi.advanceTimersByTime(10400);
    });

    // Should still be on slide 1 because hover/focus stopped autoplay
    expect(screen.getByText('AWS Certified Solutions Architect')).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('01 / 02');
  });
});

describe('CertSlider — Sad path (HOME-013)', () => {
  test('prefers-reduced-motion: reduce disables autoplay', () => {
    stubMatchMedia(true);
    vi.useFakeTimers();

    render(<CertSlider certs={FIXTURE_CERTS} />);

    expect(screen.getByText('AWS Certified Solutions Architect')).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('01 / 02');

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    // Autoplay did not trigger
    expect(screen.getByText('AWS Certified Solutions Architect')).toBeTruthy();
    expect(getPositionLabel().textContent).toContain('01 / 02');
  });

  test('single cert disables autoplay and does not render an empty slide', () => {
    vi.useFakeTimers();

    const singleCert = [FIXTURE_CERTS[0]];
    render(<CertSlider certs={singleCert} />);

    expect(screen.getByText('AWS Certified Solutions Architect')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    // No autoplay
    expect(screen.getByText('AWS Certified Solutions Architect')).toBeTruthy();
    // No empty slide content
    expect(
      screen.queryByText('Scrum Foundation Professional Certification (SFPC™)'),
    ).toBeNull();
    // Position label should not say 01 / 02 when there is only 1 cert
    const pos = screen.queryByTestId('cert-position');
    if (pos) {
      expect(pos.textContent).not.toContain('01 / 02');
    }
    // Prev/next arrow buttons should not render when there is only 1 cert
    expect(screen.queryByTestId('cert-prev')).toBeNull();
    expect(screen.queryByTestId('cert-next')).toBeNull();
  });

  test('does not trap focus when tabbing through slider controls', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <CertSlider certs={FIXTURE_CERTS} />
        <button type="button">after slider</button>
      </div>,
    );
    const after = screen.getByRole('button', { name: 'after slider' });

    for (let i = 0; i < 8; i++) {
      await user.tab();
      if (document.activeElement === after) break;
    }

    expect(document.activeElement).toBe(after);
  });
});
