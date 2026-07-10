import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de';
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';

export const languages = {
  english: ['en', en],
  german: ['de', de],
  spanish: ['es', es],
  french: ['fr', fr],
};

const resources = Object.values(languages).reduce((acc, langValues) => {
  return {
    ...acc,
    [langValues[0]]: {
      translations: langValues[1],
    },
  };
}, {});

i18n.use(initReactI18next).init({
  fallbackLng: languages.english[0], // If no language found, run this one
  lng: languages.english[0], // default language
  resources: resources,
  ns: ['translations'],
  defaultNS: 'translations',
});

i18n.languages = Object.values(languages).map((langValue) => langValue[0]);

export default i18n;
