<script setup lang="ts">
import router from '@/router';
import { PAGE_PATHS } from '@config/const.ts';
import type { IUser } from '@/types/user.ts';

interface IProp {
  avatarUrl: IUser['avatar_url']
  username?: IUser['username']
}

const { username, avatarUrl } = defineProps<IProp>();

const redirectProfile = () => {
  if (username) {
    router.push(`${PAGE_PATHS.USER}/${username}`);
  }
};

</script>

<template>
  <img
    v-if="avatarUrl"
    alt="avatar"
    v-bind="$attrs"
    :src="avatarUrl"
    class="image"
    @click="redirectProfile"
  >
  <img
    v-else
    alt="avatar"
    v-bind="$attrs"
    src="@/assets/default-avatar.png"
    class="image"
    @click="redirectProfile"
  >
</template>

<style scoped>

.image {
  @apply rounded-full h-10 w-10 bg-black cursor-pointer
}

</style>
