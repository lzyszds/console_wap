import { createI18n } from 'vue-i18n';

import en from './en.json';
import zh from './zh.json';
import th from './th.json';
import ms from './ms.json';
import id from './id.json';
import vi from './vi.json';
import { useStorage } from '@vueuse/core';
import { watch } from 'vue';


const language = useStorage('language', 'zh')

const messages = {
  en,
  zh,
  th,
  ms,
  id,
  vi
};

const i18n = createI18n({
  locale: language.value, // 设置默认语言
  fallbackLocale: 'zh', // 当选择的语言缺少翻译时回退到该语言
  messages,
});

watch(language, (newValue) => {
  i18n.locale = newValue;
});


export default i18n;
