import { mount } from '@vue/test-utils';
import Notifications from '@components/Notifications.vue';
import { createTestingPinia } from '@pinia/testing';

describe('Notification Component', () => {
  test('show notifications', () => {
    const wrapper = mount(Notifications, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            notification: {
              notifications: [
                { id: 1, text: 'Hi', status: 'default' },
                { id: 2, text: 'Hi', status: 'default' },
              ],
            },
          },
        })],
        stubs: {
          teleport: true,
        },
      },
    });
    expect(wrapper.findAll('#notifications')).toHaveLength(2);
  });
});
