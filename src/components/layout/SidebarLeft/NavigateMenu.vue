<script setup lang="ts">
import { useRoute } from 'vue-router';
import { HomeIcon, UserIcon } from '@heroicons/vue/20/solid';
import {
  BellIcon as BellIconOutline,
  BookmarkIcon as BookmarkIconOutline,
  Cog8ToothIcon as SettingIconOutline,
  HomeIcon as HomeIconOutline,
  MagnifyingGlassIcon,
  UserIcon as UserIconOutline
} from '@heroicons/vue/24/outline';

import { PAGE_PATHS } from '@config/const.ts';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@stores/auth.ts';

const route = useRoute();

const { isLoggedIn, user } = storeToRefs(useAuthStore());

</script>

<template>
  <nav>
    <router-link
      :to="isLoggedIn ? PAGE_PATHS.HOME : PAGE_PATHS.EXPLORE "
      class="px-3 py-2 font-[Alphabets4] text-4xl font-black text-black lg:px-4 "
    >
      m
    </router-link>

    <router-link
      v-if="isLoggedIn"
      v-slot="{ isActive }"
      class="link"
      :to="PAGE_PATHS.HOME"
    >
      <HomeIcon v-if="isActive" />
      <HomeIconOutline v-else />
      <p :class="isActive && 'active'">
        Home
      </p>
    </router-link>

    <router-link
      v-slot="{ isActive }"
      class="link"
      :to="PAGE_PATHS.EXPLORE"
    >
      <MagnifyingGlassIcon :class="( route.name === 'search' || isActive ) && 'active' && 'stroke-[3]'" />
      <p :class="( route.name === 'search' || isActive ) && 'active'">
        Explore
      </p>
    </router-link>

    <router-link
      v-if="isLoggedIn"
      class="link"
      :to="`${PAGE_PATHS.USER}/${user.username}`"
      active-class="active"
    >
      <UserIcon v-if="route.name === 'profile'" />
      <UserIconOutline v-else />
      <p :class="route.name === 'profile' && 'active'">
        Profile
      </p>
    </router-link>

    <div
      v-if="isLoggedIn"
      class="link opacity-50"
    >
      <BellIconOutline />
      <p>Notifications</p>
    </div>

    <div
      v-if="isLoggedIn"
      class="link opacity-50"
    >
      <BookmarkIconOutline />
      <p>Bookmarks</p>
    </div>

    <div class="link opacity-50">
      <SettingIconOutline />
      <p>Settings</p>
    </div>
  </nav>
</template>

<style scoped>

.link {
  @apply
  flex items-center justify-center gap-3
  text-black text-2xl md:hover:bg-zinc-200 animate py-2 px-3 lg:px-4 rounded-full md:w-fit cursor-pointer
}

.link .active {
  @apply font-bold
}

.link svg {
  @apply h-7 w-7
}

.link p {
  @apply hidden xl:block tracking-wide
}
</style>
