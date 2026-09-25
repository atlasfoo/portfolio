// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { PROJECTS, SECTION_COPY } from '../../content/homepage';
// Component doesn't exist yet (T-041) — this import is expected to fail to
// resolve, which is the "red for the right reason" this test starts red
// for. See the prop/DOM contract this test encodes in the file-level
// comment on ProjectsGrid.tsx once T-041 lands.
import ProjectsGrid from './ProjectsGrid';

// @testing-library/react's auto-cleanup only kicks in when `afterEach` is a
// vitest global; this project doesn't set `test.globals: true`, so clean up
// explicitly to avoid cross-test DOM leakage.
afterEach(cleanup);

describe('ProjectsGrid', () => {
  test('transitions the hover-lift property Tailwind v4 actually animates it on', () => {
    render(<ProjectsGrid />);

    // Tailwind v4's `hover:-translate-y-1` sets the standalone CSS `translate`
    // property, not `transform` — confirmed via getComputedStyle in a real
    // browser. A `transition-[border-color,transform]` class never animates
    // the lift because `transform` itself never changes; only `translate`
    // does. This asserts the class names the property that actually moves.
    const card = screen.getAllByTestId('project-card')[0];
    expect(card.className).toContain('transition-[border-color,translate]');
    expect(card.className).not.toContain('transition-[border-color,transform]');
  });

  test('renders all projects under the default "All" filter', () => {
    render(<ProjectsGrid />);

    expect(screen.getAllByTestId('project-card')).toHaveLength(PROJECTS.length);
    for (const project of PROJECTS) {
      expect(screen.getByRole('heading', { name: project.name })).toBeTruthy();
    }
  });

  test('clicking "Payments" narrows the grid to tag-matching projects and marks that filter active', async () => {
    const user = userEvent.setup();
    render(<ProjectsGrid />);

    const allButton = screen.getByRole('button', { name: /^all$/i });
    const paymentsButton = screen.getByRole('button', { name: /payments/i });

    // Default filter ("All") starts active.
    expect(allButton.getAttribute('aria-pressed')).toBe('true');

    await user.click(paymentsButton);

    expect(paymentsButton.getAttribute('aria-pressed')).toBe('true');
    expect(allButton.getAttribute('aria-pressed')).toBe('false');

    const expected = PROJECTS.filter((p) => p.tags.includes('pay'));
    expect(expected.length).toBeGreaterThan(0);
    expect(expected.length).toBeLessThan(PROJECTS.length);

    expect(screen.getAllByTestId('project-card')).toHaveLength(expected.length);
    for (const project of expected) {
      expect(screen.getByRole('heading', { name: project.name })).toBeTruthy();
    }
    // Projects not tagged "pay" should have dropped out of the grid.
    const notExpected = PROJECTS.filter((p) => !p.tags.includes('pay'));
    for (const project of notExpected) {
      expect(screen.queryByRole('heading', { name: project.name })).toBeNull();
    }
  });

  test('a filter with no matching projects renders the empty-state message', async () => {
    const user = userEvent.setup();

    // Injected via test-only `projects`/`filters` props so this branch is
    // reachable without a gap existing in the real content — with the real
    // PROJECTS/FILTER_DEFS, every filter matches at least one project.
    const projects = [
      {
        name: 'Fixture Project',
        tags: ['fin'],
        stack: ['TypeScript'],
        kind: { en: 'Test fixture', es: 'Fixture de prueba' },
        description: {
          en: 'A minimal fixture project for this test.',
          es: 'Un proyecto fixture mínimo para esta prueba.',
        },
      },
    ];
    const filters = [
      { id: 'all', label: { en: 'All', es: 'Todos' }, matchesAll: true },
      { id: 'nope', label: { en: 'Nope', es: 'Nope' } },
    ];

    render(<ProjectsGrid projects={projects} filters={filters} />);

    await user.click(screen.getByRole('button', { name: /nope/i }));

    expect(screen.queryAllByTestId('project-card')).toHaveLength(0);
    expect(screen.getByText(/no projects match this filter/i)).toBeTruthy();
  });

  test('renders the section header (eyebrow, serif title, lead) in the same row as the filters', () => {
    render(<ProjectsGrid />);

    const heading = screen.getByRole('heading', {
      name: SECTION_COPY.projects.title.en,
    });
    expect(heading.tagName).toBe('H2');
    expect(heading.className).toMatch(/font-serif/);

    expect(
      screen.getByText(
        `${SECTION_COPY.projects.index} — ${SECTION_COPY.projects.tag.en}`,
      ),
    ).toBeTruthy();
    expect(screen.getByText(SECTION_COPY.projects.lead?.en ?? '')).toBeTruthy();

    // Header and filter row share one flex container (justify-between shape).
    const headerRow = heading.closest('[class*="justify-between"]');
    expect(headerRow).not.toBeNull();
    expect(headerRow?.querySelector('button[aria-pressed]')).not.toBeNull();
  });

  test("lead carries no mono font, matching the mock's 16px sans treatment", () => {
    render(<ProjectsGrid />);

    const lead = screen.getByText(SECTION_COPY.projects.lead?.en ?? '');
    expect(lead.className).not.toMatch(/font-mono/);
  });

  test("card metrics match the mock's radius/padding/name-size", () => {
    render(<ProjectsGrid />);

    const card = screen.getAllByTestId('project-card')[0];
    expect(card.className).toMatch(/rounded-\[15px\]/);
    expect(card.className).toMatch(/p-\[26px\]/);

    const name = card.querySelector('h3');
    expect(name?.className).toMatch(/text-\[25px\]/);
  });
});
