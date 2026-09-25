export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'dark' | 'light';

export function getInitialTheme(stored: string | null): Theme {
  return stored === 'light' ? 'light' : 'dark';
}

/**
 * Returns the source of a self-contained script, meant for a `<script
 * is:inline set:html={...}>` tag in <head>. Must run synchronously before
 * first paint to avoid a flash of the wrong theme, so it can't be an
 * imported module — `getInitialTheme` is inlined via `toString()` to keep
 * the decision logic in one place while the emitted script stays standalone.
 */
export function buildThemeInitScript(): string {
  return `(function(){
    var KEY = ${JSON.stringify(THEME_STORAGE_KEY)};
    var getInitialTheme = ${getInitialTheme.toString()};
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    document.documentElement.setAttribute('data-theme', getInitialTheme(stored));
  })();`;
}
