import { Fragment, useEffect, useState } from 'react';
import {
  TERMINAL_LINES,
  TERMINAL_TITLE,
  type TerminalTone,
} from '../../content/homepage';
import {
  classifyLine,
  prefersReducedMotion,
  stepReveal,
} from '../../lib/home/typewriter';
import type { Lang } from '../../lib/lang';
import { getCurrentLang, LANG_CHANGE_EVENT } from '../../lib/lang-client';

/** Mock's tick pacing: `setTimeout(tick, 13 + Math.random() * 24)`. */
const TICK_BASE_MS = 13;
const TICK_JITTER_MS = 24;

/**
 * Mock colours mapped onto the theme-aware semantic tokens, preserving the
 * mock's brightness ordering (identity > highlight > body copy) so the
 * terminal stays legible under the light theme too.
 */
const TONE_CLASS: Record<TerminalTone, string> = {
  prompt: 'text-primary2',
  success: 'text-success-400',
  identity: 'text-text',
  highlight: 'text-body',
  muted: 'text-muted',
};

function snippetFor(lang: Lang): string {
  return TERMINAL_LINES.map((line) => line[lang]).join('\n');
}

/** SSR-safe: the island is server-rendered before `document` exists. */
function readLang(): Lang {
  return typeof document === 'undefined' ? 'en' : getCurrentLang();
}

/**
 * Hero terminal window: types the active language's snippet out character by
 * character with a plain `setTimeout` loop over React state (no animation
 * library — see the plan's "Motion" section), and re-types from scratch when
 * the language changes. Under `prefers-reduced-motion` the full snippet is
 * rendered at once and no timer is ever scheduled.
 */
export default function HeroTerminal() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [revealed, setRevealed] = useState('');

  useEffect(() => {
    const onLangChange = () => setLang(readLang());
    window.addEventListener(LANG_CHANGE_EVENT, onLangChange);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, onLangChange);
  }, []);

  useEffect(() => {
    const full = snippetFor(lang);

    if (prefersReducedMotion(window.matchMedia)) {
      setRevealed(full);
      return;
    }

    let index = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      setRevealed(full.slice(0, index));
      // The last tick renders the whole snippet, then stops the loop.
      if (index >= full.length) return;
      index = stepReveal(index, Math.random);
      timer = setTimeout(tick, TICK_BASE_MS + Math.random() * TICK_JITTER_MS);
    };

    tick();

    return () => clearTimeout(timer);
  }, [lang]);

  const shownLines = revealed.split('\n');

  return (
    <div className="overflow-hidden rounded-xl border border-border2 bg-panel2 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-2 border-border border-b bg-panel px-4 py-3">
        <span className="size-2.5 rounded-full bg-term-red" />
        <span className="size-2.5 rounded-full bg-term-amber" />
        <span className="size-2.5 rounded-full bg-term-green" />
        <span className="flex-1" />
        <span className="font-mono text-2xs text-dim">{TERMINAL_TITLE}</span>
      </div>

      <div className="min-h-[262px] px-5 pt-5 pb-6">
        <pre
          data-testid="hero-terminal-output"
          className="m-0 whitespace-pre-wrap break-words font-mono text-muted text-sm leading-7"
        >
          {shownLines.map((text, i) => {
            // Tone comes from the *full* source line so a line's colour does
            // not flip mid-reveal; `revealed` is always a prefix of `full`,
            // so `shownLines[i]` is a prefix of `TERMINAL_LINES[i][lang]`.
            const source = TERMINAL_LINES[i]?.[lang] ?? text;
            return (
              <Fragment key={source}>
                {i > 0 && '\n'}
                <span className={TONE_CLASS[classifyLine(source)]}>{text}</span>
              </Fragment>
            );
          })}
          <span
            aria-hidden="true"
            className="inline-block h-4 w-2 animate-pulse bg-primary2 align-text-bottom shadow-glow-sm motion-reduce:animate-none"
          />
        </pre>
      </div>
    </div>
  );
}
