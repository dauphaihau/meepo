import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '../auth.ts';

describe('Auth store', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  test('after authenticated recomputed isLoggedIn', () => {
    const authStore = useAuthStore();
    authStore.authToken = 'auth_token';
    expect(authStore.isLoggedIn).toBeTruthy();
  });
});
