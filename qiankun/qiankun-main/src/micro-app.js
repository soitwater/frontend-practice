import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'vueApp',
    entry: '//localhost:7100',
    container: '#container',
    activeRule: '/app-vue',
  },
  {
    name: 'vue3-typescript-admin-template',
    entry: '//localhost:7101',
    container: '#container',
    activeRule: '/vue3-ts-admin',
  }
]);
// 启动 qiankun
start();