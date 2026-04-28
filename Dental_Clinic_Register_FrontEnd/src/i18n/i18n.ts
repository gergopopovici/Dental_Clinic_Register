import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import roTranslations from './locales/ro.json';
import huTranslations from './locales/hu.json';

const savedLanguage = localStorage.getItem('applanguage') || 'ro'
i18next.use(initReactI18next).init({
  lng: savedLanguage,
  fallbackLng: 'en',
  debug: true,
  resources: {
   en:{translation:enTranslations},
   hu:{translation:huTranslations},
   ro:{translation:roTranslations}
  }
});
export default i18next