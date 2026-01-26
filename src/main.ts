import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Wir entfernen hier den direkten Datenbank-Test, 
// damit die App auch startet, wenn Firebase noch Probleme macht.

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')