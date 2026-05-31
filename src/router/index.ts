import { createRouter, createWebHistory } from 'vue-router'
import SimulatorView from '@/views/SimulatorView.vue'
import EditorView from '@/views/EditorView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'simulator',
      component: SimulatorView,
    },
    {
      path: '/editor',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
  ],
})

export default router
