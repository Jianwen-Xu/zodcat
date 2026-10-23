import { useLayoutEffect, useState } from 'react';
import App from './App';
import { getInitialLocale, I18nProvider, saveLocale, translate } from './i18n';
import type { Locale } from './types';

export default function Root() {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  function setLocale(next: Locale) {
    setLocaleState(next);
    saveLocale(next);
  }

  useLayoutEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = translate(locale, 'page.title');
  }, [locale]);

  return (
    <I18nProvider locale={locale} setLocale={setLocale}>
      <App />
    </I18nProvider>
  );
}
