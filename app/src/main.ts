import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createWebHistory, createRouter } from 'vue-router'
import HomeView from './pages/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

document.title = 'Week Wizard';

const app = createApp(App)
app.use(router)
app.mount('#app')
