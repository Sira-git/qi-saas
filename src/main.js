import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './styles/global.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)

// 全局错误处理：把 JS 错误显示到页面上（避免白屏时无法诊断）
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info)
  const el = document.getElementById('app')
  if (el) {
    el.innerHTML = `
      <div style="padding:24px;font-family:monospace;color:#c00;background:#fff5f5;border:1px solid #fcc;border-radius:8px;margin:24px;">
        <h3 style="margin:0 0 12px;">应用启动失败</h3>
        <pre style="white-space:pre-wrap;word-break:break-all;">${(err && err.stack) || err}</pre>
        <p style="color:#666;font-size:12px;margin-top:12px;">信息: ${info}</p>
      </div>
    `
  }
}

window.addEventListener('error', (e) => {
  console.error('[Window Error]', e.error || e.message)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Promise]', e.reason)
})

app.mount('#app')