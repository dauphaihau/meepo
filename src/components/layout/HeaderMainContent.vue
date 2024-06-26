<script setup lang="ts">
import { ArrowLeftIcon, EllipsisHorizontalIcon } from '@heroicons/vue/20/solid';
import { useMediaQuery, useWindowScroll } from '@vueuse/core';
import {
  Cog8ToothIcon as SettingIconOutline
} from '@heroicons/vue/24/outline';

import SearchUserBar from '@components/layout/SearchUserBar.vue';
import { useScrollDirection } from '@/core/hooks/useScrollDirection';
import { useAuthStore } from '@stores/auth.ts';
import { useDrawerStore } from '@stores/drawer.ts';

interface IProps {
  title?: string
  subTitle?: string
  backTo?: string
}

let { title, subTitle, backTo } = defineProps<IProps>();

const { isLoggedIn, user } = storeToRefs(useAuthStore());

const minMobileScreen = useMediaQuery('(max-width: 375px)');
const minTabletScreen = useMediaQuery('(min-width: 768px)');
const { y: scrollY } = useWindowScroll();
const direction = useScrollDirection();
const router = useRouter();
const route = useRoute();
const slots = useSlots();
const drawerStore = useDrawerStore();

const routerIsReady = ref(false);
const keySearchAllComp = ref(0);
const query = ref('');

const currentRouteName = route.name as string;
const showSearchBar = currentRouteName === 'search' || currentRouteName === 'explore';

onMounted(async () => {
  await router.isReady();
  routerIsReady.value = true;

  if (route.query?.q) {
    query.value = route.query.q as string;
    keySearchAllComp.value++;
  }
});

const changeRoute = () => {
  keySearchAllComp.value++;
};

watch(router.currentRoute, () => {
  if (route.query?.q) {
    query.value = route.query.q as string;
    keySearchAllComp.value++;
  }
});

const showSidebarMobile = () => {
  drawerStore.showDrawer = 'sidebar-mobile';
};

</script>

<template>
  <div>
    <div
      class="wrapper"
      :class="[
        (minMobileScreen && direction === 'down' ? '-top-28' : 'top-0'),
        (slots.tabs ? 'border-b' : scrollY > 0 ? 'border-b' : 'border-b-white')
      ]"
    >
      <!--      Header mobile ( logo + user ) -->
      <div
        v-if="currentRouteName === 'home'"
        class="md:hidden flex gap-4 items-center justify-between h-[53px] px-4"
      >
        <div
          class="cursor-pointer"
          @click="showSidebarMobile"
        >
          <img
            v-if="user?.avatar_url"
            alt="avatar"
            :src="user?.avatar_url"
            class="h-8 w-8 lg:h-8 lg:w-8 rounded-full "
          >
          <img
            v-else
            alt="avatar"
            src="@/assets/default-avatar.png"
            class="h-8 w-8 lg:h-8 lg:w-8 rounded-full "
          >
        </div>

        <router-link
          :to="isLoggedIn ? '/home' : '/explore' "
          class="font-black font-[Alphabets4] text-2xl"
        >
          m
        </router-link>
        <div class="w-8" />
      </div>

      <!--      Search Bar, title , arrow back -->
      <div
        v-if="title || subTitle"
        class="flex gap-4 items-center justify-between h-[53px] px-4 md:px-4"
      >
        <div
          v-if="currentRouteName === 'explore'"
          class="h-9 w-9 p-2"
        />

        <ArrowLeftIcon
          v-if="!['explore', 'messages'].includes(currentRouteName)"
          class="h-9 w-9 cursor-pointer hover:bg-zinc-300 animate rounded-full p-2"
          aria-hidden="true"
          @click="backTo ? router.push(backTo) : router.back()"
        />

        <div
          v-if="
            minTabletScreen ? (!['search', 'messages', 'profile'].includes(currentRouteName)) :
            (['messages'].includes(currentRouteName))"
          class="cursor-pointer md:hidden"
          @click="showSidebarMobile"
        >
          <img
            v-if="user?.avatar_url"
            alt="avatar"
            :src="user?.avatar_url"
            class="h-8 w-8 lg:h-8 lg:w-8 rounded-full "
          >
          <img
            v-else
            alt="avatar"
            src="@/assets/default-avatar.png"
            class="h-8 w-8 lg:h-8 lg:w-8 rounded-full "
          >
        </div>

        <div
          :class="title && subTitle && ''"
          class="grow"
        >
          <div v-if="!showSearchBar">
            <h3 class="text-[17px] md:text-[20px] font-bold leading-6">
              {{ title }}
            </h3>
            <p
              v-if="subTitle"
              class="text-zinc-500 text-xs md:text-sm"
            >
              {{ subTitle }}
            </p>
          </div>

          <SearchUserBar
            v-if="showSearchBar && routerIsReady"
            :key="keySearchAllComp"
            class="md:max-w-full"
            :query="query"
            @change-route="changeRoute"
          />
        </div>

        <SettingIconOutline
          v-if="['explore', 'messages'].includes(currentRouteName)"
          v-tooltip="'Not available'"
          class="h-7 md:h-9 w-7 md:w-9 cursor-pointer
           hover:bg-zinc-300 animate rounded-full p-1 md:p-2 opacity-50"
        />
        <EllipsisHorizontalIcon
          v-if="currentRouteName === 'search'"
          v-tooltip="'Not available'"
          class="h-9 w-9 cursor-pointer hover:bg-zinc-300 animate rounded-full p-2 opacity-30"
        />
      </div>

      <slot
        name="tabs"
        class="relative max-w-[100vw] md:max-w-full"
      />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  @apply fixed z-[4] ml-[0.2px] mr-4
  w-full max-w-[100vw] md:w-[596px] md:max-w-[596px]
  backdrop-blur-xl bg-white/70
  transition-all duration-500;
}
</style>
