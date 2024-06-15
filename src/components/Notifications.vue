<script setup lang="ts">

import type { INotification } from '@stores/notification.ts';
import { useNotificationStore } from '@stores/notification.ts';

const notificationStore = useNotificationStore();

const clickBtnRight = (noti: INotification) => {
  noti.btnRight.onClick();
  notificationStore.clearNotiById(noti.id);
};

</script>

<template>
  <Teleport to="body">
    <Transition name="noti">
      <div
        v-if="notificationStore.notifications.length"
        class="wrapper"
      >
        <TransitionGroup
          class="flex flex-col gap-2"
          name="noti"
          tag="ul"
        >
          <li
            v-for="noti of notificationStore.notifications"
            id="notifications"
            :key="noti.id"
          >
            <div class="noti">
              <div
                id="noti-text"
                class="font-medium"
              >
                {{ noti.text }}
              </div>

              <div
                v-if="noti?.btnRight"
                class="cursor-pointer font-bold md:ml-6"
                @click="clickBtnRight(noti)"
              >
                {{ noti.btnRight?.title }}
              </div>
            </div>
          </li>
        </TransitionGroup>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>

.wrapper {
  @apply fixed z-10 bottom-12 md:bottom-5
  mx-auto
  min-w-[100vw] md:min-w-0 md:max-w-[400px] w-fit;
  left: calc(-50vw + 50%);
  right: calc(-50vw + 50%);
}

.noti {
 @apply bg-black md:rounded-lg
 py-2.5 px-7 md:px-4
 flex items-center justify-between
 text-white text-sm
}

.noti-enter-from,
.noti-leave-to {
  @apply -bottom-32;
  opacity: 0;
}

.noti-enter-active,
.noti-leave-active {
  transition: 0.25s ease all;
}

</style>
