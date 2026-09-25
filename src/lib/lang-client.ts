import type { Lang } from './lang';

export const LANG_CHANGE_EVENT = 'langchange';

export function getCurrentLang(): Lang {
  const lang = document.documentElement.dataset.lang;
  return lang === 'es' ? 'es' : 'en';
}

export function dispatchLangChange(lang: Lang): void {
  window.dispatchEvent(
    new CustomEvent(LANG_CHANGE_EVENT, { detail: { lang } }),
  );
}
