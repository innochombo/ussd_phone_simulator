import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

// Load a shared flow from the URL hash after stores are ready
import('@/composables/useShareableUrl').then(({ useShareableUrl }) => {
  useShareableUrl().loadFromHash()
})
