import { useEffect, useState } from 'react';
import {
  DEFAULT_FILTER_ID,
  FILTER_DEFS,
  type FilterDef,
  PROJECTS,
  PROJECTS_EMPTY_STATE,
  type Project,
  SECTION_COPY,
} from '../../content/homepage';
import { SECTION_TITLE_CLASS } from '../../lib/home/layout';
import { filterProjects } from '../../lib/home/project-filter';
import type { Lang } from '../../lib/lang';
import { getCurrentLang, LANG_CHANGE_EVENT } from '../../lib/lang-client';

/**
 * Projects section grid: a row of filter pills over a card grid, ported
 * from the mock's `filters` / `projects` blocks.
 *
 * Contract (encoded in `ProjectsGrid.test.tsx`):
 *  - Default export, mounted as a `client:visible` island by `Projects.astro`.
 *  - `projects` / `filters` are optional and default to `PROJECTS` /
 *    `FILTER_DEFS`; they exist so tests can inject edge-case data (the real
 *    content has no filter that matches zero projects).
 *  - Each card carries `data-testid="project-card"` and a heading whose
 *    accessible name is exactly the project name.
 *  - Each filter is a `<button>` whose accessible name is its label in the
 *    active language, with `aria-pressed` reflecting the active filter.
 *  - A filter matching nothing renders `PROJECTS_EMPTY_STATE` instead of
 *    an empty grid.
 *
 * Unlike the `.astro` components, this island cannot use the dual-span
 * `[data-lang-content]` CSS trick: both spans would land in the accessible
 * name of every heading and button. It renders one language at a time and
 * re-renders on `langchange` instead. Language is resolved in an effect
 * rather than during render so the server-rendered island (which has no
 * `document`) and its first client render agree.
 */

interface ProjectsGridProps {
  projects?: readonly Project[];
  filters?: readonly FilterDef[];
}

const FILTER_BASE_CLASS =
  'font-mono text-xs rounded-lg border px-3.5 py-2 transition-colors duration-200 cursor-pointer';

const FILTER_ACTIVE_CLASS =
  'text-text border-primary bg-[rgba(47,107,255,0.18)]';

const FILTER_IDLE_CLASS =
  'text-subtle border-border2 bg-panel hover:border-primary2 hover:text-body';

export default function ProjectsGrid({
  projects = PROJECTS,
  filters = FILTER_DEFS,
}: ProjectsGridProps) {
  const [lang, setLang] = useState<Lang>('en');
  const [activeFilterId, setActiveFilterId] = useState(DEFAULT_FILTER_ID);

  useEffect(() => {
    const syncLang = () => setLang(getCurrentLang());

    syncLang();
    window.addEventListener(LANG_CHANGE_EVENT, syncLang);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, syncLang);
  }, []);

  const visibleProjects = filterProjects(projects, activeFilterId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-primary-600 text-xs uppercase tracking-wide">
            {SECTION_COPY.projects.index} — {SECTION_COPY.projects.tag[lang]}
          </p>
          <h2 className={SECTION_TITLE_CLASS}>
            {SECTION_COPY.projects.title[lang]}
          </h2>
          {SECTION_COPY.projects.lead && (
            <p className="max-w-[600px] font-sans text-base text-muted leading-relaxed">
              {SECTION_COPY.projects.lead[lang]}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = filter.id === activeFilterId;

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilterId(filter.id)}
                className={`${FILTER_BASE_CLASS} ${
                  isActive ? FILTER_ACTIVE_CLASS : FILTER_IDLE_CLASS
                }`}
              >
                {filter.label[lang]}
              </button>
            );
          })}
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <p className="font-mono text-muted rounded-xl border border-border2 bg-panel p-6 text-center text-sm">
          {PROJECTS_EMPTY_STATE[lang]}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
          {visibleProjects.map((project) => (
            <article
              key={project.name}
              data-testid="project-card"
              className="flex flex-col gap-3 rounded-[15px] border border-border2 bg-panel p-[26px] transition-[border-color,translate] duration-200 hover:-translate-y-1 hover:border-[rgba(47,107,255,0.5)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-[25px] text-text">
                  {project.name}
                </h3>
                {/* Decorative: the mock marks every project card with the
                    same "in production" dot — there is no per-project status
                    in `PROJECTS` for a screen reader to announce. */}
                <span
                  aria-hidden="true"
                  className="mt-2 h-[7px] w-[7px] shrink-0 rounded-full bg-success-400 shadow-[0_0_8px_var(--color-success-400)]"
                />
              </div>

              <p className="font-mono text-primary2 text-xs">
                {project.kind[lang]}
              </p>

              <p className="text-muted flex-1 text-sm leading-relaxed">
                {project.description[lang]}
              </p>

              <div className="mt-1 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-muted rounded-lg border border-border2 bg-panel px-3 py-1.5 text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
