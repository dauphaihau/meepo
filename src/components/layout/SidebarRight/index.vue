<script setup lang="ts">
import About from '@components/layout/SidebarRight/About.vue';
import PhotosProfile from '@components/layout/SidebarRight/PhotosProfile.vue';
import UsersSuggestList from '@components/layout/SidebarRight/UserSuggestList.vue';
import Trends from '@components/layout/SidebarRight/Trends.vue';
import SearchUserBar from '@components/layout/SearchUserBar.vue';
import Auth from '@components/layout/SidebarRight/Auth.vue';
import { useAuthStore } from '@stores/auth.ts';

const router = useRouter();
const route = useRoute();

const {
  isLoggedIn,
} = storeToRefs(useAuthStore());

const showPhotoProfileComp = ref(false);
const showSearchUserBar = ref(false);
const keySearchUserComp = ref(0);
const keyPhotoProfileComp = ref(0);
const query = ref('');
const sidebar = ref<HTMLDivElement | null>(null);
const content = ref<HTMLDivElement | null>(null);

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});

onMounted(async () => {
  window.addEventListener('scroll', onScroll);
});

const onScroll = () => {
  const scrollTop = window.scrollY; // current scroll position
  const viewportHeight = window.innerHeight; // viewport height
  const sidebarTop = sidebar.value?.getBoundingClientRect()?.top + window.pageYOffset; // current content height
  const contentHeight = content.value?.getBoundingClientRect().height; // distance from top to sidebar

  if (scrollTop >= contentHeight - viewportHeight + sidebarTop) {
    content.value.style.transform = `translateY(-${(contentHeight - viewportHeight + sidebarTop)}px)`;
    content.value.style.position = 'fixed';
  }
  else {
    content.value.style.transform = '';
    content.value.style.position = '';
  }
};

watch(router.currentRoute, (value) => {
  showSearchUserBar.value = value.name !== 'search' && value.name !== 'explore';

  showPhotoProfileComp.value = value.name === 'profile';
  if (value.name === 'profile') {
    keyPhotoProfileComp.value++;
  }

  if (route.query?.q) {
    query.value = route.query.q as string;
    keySearchUserComp.value++;
  }
  else {
    query.value = '';
  }
});

const changeRoute = () => {
  keySearchUserComp.value++;
};

</script>

<template>
  <div
    ref="sidebar"
    class="w-sidebar z-[4] pb-14"
  >
    <div class="w-sidebar fixed top-0 z-[3]">
      <div class="h-2 bg-white" />
      <SearchUserBar
        v-if="showSearchUserBar"
        :key="keySearchUserComp"
        class="bg-white"
        :query="query"
        @change-route="changeRoute"
      />
      <div class="h-5 bg-gradient-to-b from-white" />
    </div>

    <div :class="!showSearchUserBar ? 'pb-8' : 'pb-[4.5rem]'" />

    <div
      ref="content"
      class="w-sidebar flex flex-col gap-5 pb-40"
    >
      <Auth :class="isLoggedIn ? 'absolute z-[-1] invisible' : ''" />
      <PhotosProfile
        v-if="showPhotoProfileComp"
        :key="keyPhotoProfileComp"
      />
      <UsersSuggestList />
      <Trends v-if="route.name !== 'explore'" />
      <div class="flex-center -mt-2 gap-2 text-zinc-500">
        <About />
        ·
        <div class="text-sm text-zinc-500">
          © {{ new Date().getFullYear() }} Hau Tran
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.w-sidebar {
  @apply w-[350px] max-w-[350px]
}
</style>
