<script setup lang="ts">
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/vue/20/solid';
import { useScroll } from '@vueuse/core';

import Loading from '@core/components/Loading.vue';
import { useGetLastMessages } from '@services/chat';
import { parseTimeFromNow } from '@/lib/dayjs-parse';
import { truncateText } from '@core/helpers/common.ts';
import {
  ILastMessage, IMessage, IResponseGetLastMessages
} from '@/types/chat.ts';
import { useChatStore } from '@stores/chat.ts';
import useRealtimeMessage from '@composables/useRealtimeMessage.ts';

const chatStore = useChatStore();

const limit = 10;

const {
  data: dataGetLastMessages,
  fetchNextPage,
  isFetchingNextPage,
  refetch: refetchGetLastMessages, isPending: isPendingGetLastMessages,
} = useGetLastMessages({
  limit,
  page: 1,
});

const maxRoomsPage = computed(() => Math.floor(dataGetLastMessages.value.pages[0].total_messages / limit));

const lastMessages = computed<IResponseGetLastMessages['messages']>(() => {
  if (dataGetLastMessages.value?.pages && dataGetLastMessages.value.pages.length > 0) {
    return dataGetLastMessages.value.pages.reduce((acc, next) => {
      return [...acc, ...next.messages];
    }, []);
  }
  return [];
});

const clickMessage = (message: ILastMessage & Pick<IMessage, 'room_id'>) => {
  chatStore.messageToUser({
    room_id: message.room_id,
    name: message.participant_name,
    username: message.participant_username,
  });
};

useRealtimeMessage((messageRecord) => {
  const idx = lastMessages.value.findIndex(
    (item: ILastMessage) => item.participant_username === messageRecord.username
  );
  if (idx !== -1) {
    refetchGetLastMessages();
  }
});

const messagesEl = ref<HTMLElement | null>(null);
const {
  arrivedState, y,
} = useScroll(messagesEl, {
  onScroll() {
    if (
      arrivedState.bottom &&
      !isFetchingNextPage.value &&
      dataGetLastMessages.value.pageParams.length <= maxRoomsPage.value
    ) {
      fetchNextPage();
    }
  },
  offset: { bottom: 500 },
});

const toggleShoFullChatbox = () => {
  y.value = 0;
  chatStore.showFullChatbox = !chatStore.showFullChatbox;
};

</script>

<template>
  <div>
    <!--      Header-->
    <div
      class="absolute top-0 left-0 z-10 bg-white/80 w-full flex items-center justify-between px-4 cursor-pointer h-[56px]"
      @click="toggleShoFullChatbox"
    >
      <h3 class="text-xl font-bold">
        Messages
      </h3>
      <ChevronDoubleUpIcon
        v-if="!chatStore.showFullChatbox"
        class="icon"
        aria-hidden="true"
      />
      <ChevronDoubleDownIcon
        v-else
        class="icon"
        aria-hidden="true"
      />
    </div>

    <!-- Body - messages -->
    <div
      ref="messagesEl"
      class="overflow-scroll transition duration-300 h-[500px] pb-[50px]"
    >
      <div class="h-[56px]" />

      <div v-if="lastMessages && lastMessages.length > 0">
        <div
          v-for="message of lastMessages"
          :key="message.id"
        >
          <div
            class="flex gap-2 items-center  px-4 h-[73px] hover:bg-zinc-50 cursor-pointer "
            @click="clickMessage(message)"
          >
            <img
              v-if="message.participant_avatar_url"
              alt="avatar"
              :src="message.participant_avatar_url"
              class="rounded-full h-10 w-10 bg-black "
            >
            <img
              v-else
              alt="avatar"
              src="@/assets/default-avatar.png"
              class="rounded-full h-10 w-10 bg-black "
            >

            <div class="flex flex-col justify-center">
              <div class="flex gap-2 text-[15px] max-w-[80vw]">
                <p class="font-semibold">
                  {{ truncateText(message.participant_name, 12, '...') }}
                </p>
                <p class="text-zinc-500">
                  @{{ truncateText(message.participant_username, 12, '...') }}
                </p>
                <span class="text-zinc-500">·</span>
                <p class="text-zinc-500">
                  {{ truncateText(parseTimeFromNow(message.created_at), 7, '...') }}
                </p>
              </div>
              <div class="text-zinc-500 h-5">
                {{ truncateText(message.text, 37, '...') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isPendingGetLastMessages || isFetchingNextPage"
        class="flex-center min-h-[35vh]"
      >
        <Loading
          variant="secondary"
          classes="h-6 w-6"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

.icon {
  @apply h-9 w-9 cursor-pointer  hover:bg-zinc-300/50 rounded-full p-2 animate
}
</style>
