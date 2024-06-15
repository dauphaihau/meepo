import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { PAGE_PATHS } from '@config/const.ts';
import { useAuthStore } from '@stores/auth.ts';

export const routes: RouteRecordRaw[] = [
  {
    path: PAGE_PATHS.HOME,
    name: 'home',
    component: () => import('@pages/home.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: `${PAGE_PATHS.POSTS}/:id`,
    name: 'post',
    component: () => import('@pages/post.vue'),
  },
  {
    path: `${PAGE_PATHS.POSTS}/:id/history`,
    name: 'history',
    component: () => import('@pages/history-edited-posts.vue'),
  },
  {
    path: `${PAGE_PATHS.USER}/:username`,
    name: 'profile',
    component: () => import('@pages/profile.vue'),
  },
  {
    path: `${PAGE_PATHS.USER}/:username/following`,
    name: 'following',
    component: () => import('@pages/follow.vue'),
    props: true,
  },
  {
    path: `${PAGE_PATHS.USER}/:username/followers`,
    name: 'followers',
    component: () => import('@pages/follow.vue'),
    props: true,
  },
  {
    path: PAGE_PATHS.SEARCH,
    name: 'search',
    component: () => import('@pages/search.vue'),
    props: true,
  },
  {
    path: PAGE_PATHS.EXPLORE,
    name: 'explore',
    component: () => import('@pages/explore.vue'),
  },
  {
    path: PAGE_PATHS.MESSAGES,
    name: 'messages',
    component: () => import('@pages/messages.vue'),
  },
  {
    path: PAGE_PATHS.ROOMS,
    name: 'rooms',
    component: () => import('@pages/rooms.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@pages/not-found.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: function (to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    else {
      return { top: 0 };
    }
  },
});

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    const tokenExists = sessionStorage.getItem('auth_token');
    if (tokenExists) {
      await authStore.me();
    }
    else {
      authStore.loadingAuth = false;
    }
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next(PAGE_PATHS.EXPLORE);
  }

  if (to.path === '/') {
    if (authStore.isLoggedIn) {
      return next(PAGE_PATHS.HOME);
    }
    else {
      return next(PAGE_PATHS.EXPLORE);
    }
  }

  next();
});

export default router;
