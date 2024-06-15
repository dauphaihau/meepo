import { createPinia, setActivePinia } from 'pinia';
import { useDialogStore } from '../dialog.ts';

describe('Dialog Store', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  test('active dialog', () => {
    const dialogStore = useDialogStore();
    dialogStore.showDialog = 'login';
    expect(dialogStore.showDialog).toBe('login');
  });

  test('set data', () => {
    const dialogStore = useDialogStore();
    dialogStore.data = { data: 'data' };
    expect(dialogStore.data).toBeTruthy();
  });
});
