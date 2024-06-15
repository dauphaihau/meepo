import { createTestingPinia } from '@pinia/testing';
import { useNotificationStore } from '@stores/notification.ts';

describe('Notification Store', () => {
  test('add notification', () => {
    createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    });

    const notificationStore = useNotificationStore();

    notificationStore.notify({
      text: 'Hi',
    });
    expect(notificationStore.notify).toHaveBeenCalledTimes(1);
    expect(notificationStore.notifications).toHaveLength(1);
  });
});
