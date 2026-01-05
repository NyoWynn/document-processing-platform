import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#6366f1', // Indigo minimal
          secondary: '#8b5cf6', // Purple minimal
          accent: '#ec4899', // Pink accent
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#10b981',
          background: '#0f172a', // Dark slate background
          surface: '#1e293b', // Dark slate surface
          'surface-variant': '#334155',
          'on-surface': '#f1f5f9',
          'on-primary': '#ffffff',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
