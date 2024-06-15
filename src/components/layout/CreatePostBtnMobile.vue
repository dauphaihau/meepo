<script setup lang="ts">
import { PencilIcon } from '@heroicons/vue/20/solid';

import { useScrollDirection } from '@core/hooks/useScrollDirection.ts';
import { useAuthStore } from '@stores/auth.ts';
import Button from '@core/components/Button.vue';
import { useDialogStore } from '@stores/dialog.ts';
import { PAGE_PATHS } from '@config/const.ts';
import { useNotificationStore } from '@stores/notification.ts';

const direction = useScrollDirection();
const router = useRouter();
const authStore = useAuthStore();
const dialogStore = useDialogStore();
const notificationStore = useNotificationStore();

const { isLoggedIn } = storeToRefs(authStore);

const showCreatePostBtn = computed(() => {
  const arr = [PAGE_PATHS.MESSAGES, PAGE_PATHS.ROOMS];
  return !arr.includes(router.currentRoute.value.path as PAGE_PATHS);
});

const showCreatePostDialog = () => {
  dialogStore.showDialog = 'create-post';
};

</script>

<template>
  <div
    v-if="showCreatePostBtn"
    class="fixed right-4 z-[3] transition-all duration-500 md:hidden"
    :class="[
      {'opacity-50': direction === 'down'},
      notificationStore.notifications.length > 0 ? 'bottom-24' : 'bottom-16'
    ]"
  >
    <Button
      v-if="isLoggedIn"
      size="md"
      class="ml-6 !px-[11px]"
      @click="showCreatePostDialog"
    >
      <PencilIcon class="size-5" />
    </Button>
  </div>
</template>
