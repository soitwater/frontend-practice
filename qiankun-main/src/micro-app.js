import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'vueApp',
    entry: '//localhost:7100',
    container: '#container',
    activeRule: '/app-vue',
  },
]);
// 启动 qiankun
start();