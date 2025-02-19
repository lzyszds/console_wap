import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { Fancybox } from "@fancyapps/ui";//图片放大

import { createPinia } from 'pinia';
import '@/animate.min.css'
import '@/assets/css/style.css'
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import LzyIcon from '@/components/LzyIcon.vue'
import transition from '@/utils/transition'
import i18n from '@/locales'; // 引入 i18n 配置



const pinia = createPinia()

const app = createApp(App)




// vue3全局变量挂载
app.config.globalProperties.$fancyapps = { Fancybox }
app.use(router)
  .use(pinia)
  .use(i18n)
  .directive('transition', transition)
  .component("LzyIcon", LzyIcon)
  .mount('#app')

// 全局设置表格斑马纹 
// const ElementComponents = app._context.components;
// ElementComponents.ElTable.props.stripe = { type: Boolean, default: true };
