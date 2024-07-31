import { createRouter, createWebHistory } from 'vue-router'
import UserAvatar from "@/components/Avatar/UserAvatar.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [    
    {
      path : '/',
      component : UserAvatar,
    },
  ]
})

export default router
