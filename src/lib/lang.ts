export const LANG_STORAGE_KEY = 'lang';

export type Lang = 'en' | 'es';

export function getInitialLang(stored: string | null): Lang {
  return stored === 'es' ? 'es' : 'en';
}

/**
 * Returns the source of a self-contained script, meant for a `<script
 * is:inline set:html={...}>` tag in <head>. Must run synchronously before
 * first paint to avoid a flash of the wrong language, so it can't be an
 * imported module — `getInitialLang` is inlined via `toString()` to keep
 * the decision logic in one place while the emitted script stays standalone.
 */
export function buildLangInitScript(): string {
  return `(function(){
    var KEY = ${JSON.stringify(LANG_STORAGE_KEY)};
    var getInitialLang = ${getInitialLang.toString()};
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    document.documentElement.setAttribute('data-lang', getInitialLang(stored));
  })();`;
}
