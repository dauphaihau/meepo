<script setup lang="ts">
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/vue/20/solid';
import { useScroll } from '@vueuse/core';

import Loading from '@core/components/Loading.vue';
import { useGetLastMessages } from '@services/chat';
import { parseTimeFromNow } from '@/lib/dayjs-parse';
import { truncateText } from '@core/helpers/common.ts';
import type {
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
      class="absolute left-0 top-0 z-10 flex h-[56px] w-full cursor-pointer items-center justify-between bg-white/80 px-4"
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
      class="h-[500px] overflow-scroll pb-[50px] transition duration-300"
    >
      <div class="h-[56px]" />

      <div v-if="lastMessages && lastMessages.length > 0">
        <div
          v-for="message of lastMessages"
          :key="message.id"
        >
          <div
            class="flex h-[73px] cursor-pointer  items-center gap-2 px-4 hover:bg-zinc-50 "
            @click="clickMessage(message)"
          >
            <img
              v-if="message.participant_avatar_url"
              alt="avatar"
              :src="message.participant_avatar_url"
              class="size-10 rounded-full bg-black "
            >
            <img
              v-else
              alt="avatar"
              src="@/assets/default-avatar.png"
              class="size-10 rounded-full bg-black "
            >

            <div class="flex flex-col justify-center">
              <div class="flex max-w-[80vw] gap-2 text-[15px]">
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
              <div class="h-5 text-zinc-500">
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
