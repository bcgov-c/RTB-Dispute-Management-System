import Polyglot from 'polyglot.js';
import en from './locales.js';

const polyglotInstance = new Polyglot({
  // "locale" is used only for detecting singluar/plural handling
  locale: 'en',
  // we can use jsx-style templating using {{ }}
  interpolation: { prefix: '{{', suffix: '}}' },

  // pre-load the English phrases
  phrases: en
});

// NOTE: Leaving this here for backwards compatibility during dev
export { en as localeEn };

// Allow the raw locale data to be used by components in cases where polyglot is not the solution
export { en as rawLocaleEn };

export { polyglotInstance as polyglot };