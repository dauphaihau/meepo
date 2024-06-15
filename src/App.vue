<script setup lang="ts">
import SidebarLeft from '@components/layout/SidebarLeft/index.vue';
import SidebarRight from '@components/layout/SidebarRight/index.vue';
import ChatBox from '@components/chatbox/Chatbox.vue';
import AuthBar from '@components/AuthBar.vue';
import { useChatStore } from '@stores/chat.ts';
import NavigatePageMobile from '@components/layout/SidebarLeft/NavigateMenuMobile.vue';
import { useAuthStore } from '@stores/auth.ts';
import Dialogs from '@components/dialogs/Dialogs.vue';
import Notifications from '@components/Notifications.vue';
import LoadingFullPage from '@components/LoadingFullPage.vue';
import Drawers from '@components/drawers/Drawers.vue';
import CreatePostBtnMobile from '@components/layout/CreatePostBtnMobile.vue';

const route = useRoute();
const chatStore = useChatStore();
const authStore = useAuthStore();

const { isLoggedIn, loadingAuth, user } = storeToRefs(authStore);

</script>

<template>
  <div
    id="app"
    class="w-full"
  >
    <Dialogs />
    <Notifications />
    <Drawers />

    <LoadingFullPage v-if="loadingAuth" />

    <div v-else>
      <div class="mx-auto flex max-w-[100vw] lg:max-w-4xl xl:max-w-[76rem]">
        <SidebarLeft />
        <main class="flex min-h-screen w-full gap-6 md:min-h-[200vh]">
          <div
            class="flex min-h-screen w-full flex-col border-x md:min-w-[598px] md:max-w-[598px]"
            :class="{'pt-12': !['messages', 'room'].includes(route.name as string)}"
          >
            <router-view :key="route.path" />
          </div>
          <SidebarRight class="hidden lg:block" />
        </main>
      </div>

      <ChatBox v-if="isLoggedIn && ( user.last_message_count > 0 || chatStore.showChatbox)" />

      <AuthBar v-if="!isLoggedIn" />

      <CreatePostBtnMobile />

      <NavigatePageMobile v-if="isLoggedIn" />
    </div>
  </div>
</template>
