import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../store/auth';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/Landing.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/new',
    name: 'RecipeForm',
    component: () => import('../views/RecipeForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/:id/edit',
    name: 'RecipeEdit',
    component: () => import('../views/RecipeForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family',
    name: 'FamilyManagement',
    component: () => import('../views/FamilyManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/public/:slug',
    name: 'PublicRecipe',
    component: () => import('../views/RecipeDetail.vue'),
    meta: { public: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;

