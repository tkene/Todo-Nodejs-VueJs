import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import App from './App.vue'
import router from './router'
import './index.css'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

createApp(App)
  .use(Quasar, {
    plugins: {
      Notify,
      Dialog
    }, // import Quasar plugins and add here
  })
  .use(router)
  .mount('#app')
