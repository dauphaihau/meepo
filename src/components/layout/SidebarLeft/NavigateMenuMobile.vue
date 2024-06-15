<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  HomeIcon, UserIcon, EnvelopeIcon
} from '@heroicons/vue/20/solid';
import {
  BellIcon as BellIconOutline,
  HomeIcon as HomeIconOutline,
  UserIcon as UserIconOutline,
  MagnifyingGlassIcon,
  EnvelopeIcon as EnvelopeIconOutline
} from '@heroicons/vue/24/outline';

import { useScrollDirection } from '@/core/hooks/useScrollDirection';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@stores/auth.ts';
import { PAGE_PATHS } from '@config/const.ts';

const { isLoggedIn, user } = storeToRefs(useAuthStore());

const direction = useScrollDirection();
const route = useRoute();

</script>

<template>
  <nav
    class="fixed bottom-0 z-[3] w-full border-t transition-all duration-500  md:hidden"
    :class="{'opacity-50': direction === 'down'}"
  >
    <div class="grid h-[52px] w-full grid-cols-5 gap-4 bg-white">
      <router-link
        v-slot="{ isActive }"
        class="link"
        to="/home"
      >
        <HomeIcon v-if="isActive" />
        <HomeIconOutline v-else />
      </router-link>

      <router-link
        v-slot="{ isActive }"
        class="link"
        to="/explore"
      >
        <MagnifyingGlassIcon :class="( route.name === 'search' || isActive ) && 'active' && 'stroke-[3]'" />
      </router-link>

      <router-link
        v-if="isLoggedIn"
        class="link"
        :to="`${PAGE_PATHS.USER}/${user.username}`"
        active-class="active"
      >
        <UserIcon v-if="route.name === 'profile'" />
        <UserIconOutline v-else />
      </router-link>

      <router-link
        v-if="isLoggedIn"
        class="link pointer-events-none opacity-50"
        to="/"
        active-class="active"
      >
        <BellIconOutline />
      </router-link>

      <router-link
        v-if="isLoggedIn"
        class="link"
        to="/messages"
        active-class="active"
      >
        <EnvelopeIcon v-if="route.name === 'messages'" />
        <EnvelopeIconOutline v-else />
      </router-link>
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
