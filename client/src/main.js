import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import App from './App.vue'
import router from './router'
import { setupInterceptors } from './api/interceptors'
import './index.css'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const app = createApp(App)

// Configurer Quasar
const quasarConfig = {
  plugins: {
    Notify,
    Dialog,
  },
}

app.use(Quasar, quasarConfig)
app.use(router)

// Initialiser les interceptors axios avec le router
setupInterceptors(router)

app.mount('#app')
