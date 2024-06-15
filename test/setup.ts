import { config } from '@vue/test-utils';
import { QueryClient } from '@tanstack/vue-query';
import { vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createRouterMock, injectRouterMock, VueRouterMock } from 'vue-router-mock';
import { createWebHistory } from 'vue-router';
import { routes } from '../src/router';

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

config.global.provide = {
  VUE_QUERY_CLIENT: new QueryClient(),
};

export const routerMock = createRouterMock({
  history: createWebHistory(),
  routes: routes,
});

beforeEach(() => {
  setActivePinia(createPinia());

  routerMock.reset(); // reset the router state
  injectRouterMock(routerMock);
});

config.plugins.VueWrapper.install(VueRouterMock);
