import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/counter',
      name: 'Counter',
      component: () => import('@/views/CounterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/user-form',
      name: 'UserForm',
      component: () => import('@/views/UserFormView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layout/MainLayout.vue'),
      redirect: '/home',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/UsersView.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'learning-records',
          name: 'LearningRecords',
          component: () => import('@/views/LearningRecordsView.vue'),
          meta: { title: '学习记录' }
        },
        {
          path: 'skill-tree',
          name: 'SkillTree',
          component: () => import('@/views/SkillTreeView.vue'),
          meta: { title: '技能树管理' }
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '学时看板' }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn
  console.log('路由守卫:', 'to:', to.path, 'token:', isLoggedIn)

  if (to.meta.requiresAuth === false) {
    if (isLoggedIn && to.path === '/login') {
      next('/home')
    } else {
      next()
    }
  } else {
    if (!isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  }
})

router.afterEach((to) => {
  console.log('路由跳转成功:', to.path)
})

export default router