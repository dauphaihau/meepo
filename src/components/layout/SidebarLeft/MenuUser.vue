<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  Menu, MenuButton, MenuItem, MenuItems
} from '@headlessui/vue';

import { useAuthStore } from '@stores/auth.ts';
import { PAGE_PATHS } from '@config/const.ts';
import { storeToRefs } from 'pinia';
import { StatusCodes } from 'http-status-codes';
import { useNotificationStore } from '@stores/notification.ts';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const {
  user, isLoggedIn,
} = storeToRefs(authStore);

const onClickLogout = async () => {
  const { status } = await authStore.logout();
  if (status === StatusCodes.OK) {
    await router.push(PAGE_PATHS.EXPLORE);
  }
  else {
    notificationStore.notify({
      text: 'Something wrong',
    });
  }
};

const router = useRouter();

</script>

<template>
  <div>
    <Menu
      v-if="isLoggedIn"
      as="div"
      class="relative"
    >
      <MenuButton>
        <div class="animate flex gap-2 rounded-full hover:bg-zinc-300/50 lg:py-2 lg:pl-2 lg:pr-6">
          <img
            v-if="user?.avatar_url"
            alt="avatar"
            :src="user?.avatar_url"
            class="size-10 rounded-full lg:size-10 "
          >
          <img
            v-else
            alt="avatar"
            src="@/assets/default-avatar.png"
            class="size-10 rounded-full lg:size-10 "
          >
          <div class="hidden max-w-[150px] text-left lg:block">
            <h3 class="truncate text-[13px] font-bold text-zinc-900">
              {{ user?.name }}
            </h3>
            <p class="truncate text-sm text-zinc-500">
              @{{
                user?.username
              }}
            </p>
          </div>
        </div>
      </MenuButton>

      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <MenuItems class="absolute bottom-14 left-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none lg:bottom-16">
          <div>
            <!--              <div class="py-1">-->
            <div class="rounded-tl-lg" />
            <MenuItem v-slot="{ active }">
              <a
                v-tooltip="'Not available'"
                href="#"
                :class="[active ? 'rounded-t-xl bg-zinc-100 text-zinc-900' : 'text-zinc-700', 'block px-4 py-2 text-sm']"
              >Add an existing account</a>
            </MenuItem>

            <MenuItem v-slot="{ active }">
              <span
                class="cursor-pointer"
                :class="[active ? 'rounded-b-xl bg-zinc-100 text-zinc-900' : 'text-zinc-700', 'block px-4 py-2 text-sm']"
                @click="onClickLogout"
              >
                Logout
              </span>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>

<style scoped></style>
