<script setup lang="ts">
import Room from './Room.vue';
import LastMessageList from '@components/chatbox/LastMessageList.vue';
import { useChatStore } from '@stores/chat.ts';
import { useAuthStore } from '@stores/auth.ts';

const authStore = useAuthStore();
const chatStore = useChatStore();

</script>

<template>
  <div
    class="chatbox-shadow fixed bottom-0
     right-3 z-[4] hidden max-h-0
     w-full max-w-[400px] flex-col overflow-hidden
     rounded-t-2xl border
     border-zinc-50
     bg-white transition-all duration-500 md:flex"
    :class="{
      'min-h-[54px]': authStore.user?.last_message_count < 0,
      'max-h-[500px]': chatStore.showFullChatbox,
      'max-h-[54px]': !chatStore.showFullChatbox,
    }"
  >
    <LastMessageList v-if="!chatStore.showViewChatPrivate" />
    <Room v-else />
  </div>
</template>

<style scoped>
.chatbox-shadow {
  box-shadow: rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px;
}
</style>
