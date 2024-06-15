<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/20/solid';
import { PaperAirplaneIcon } from '@heroicons/vue/20/solid';
import { PlusCircleIcon } from '@heroicons/vue/20/solid';
import { useScroll } from '@vueuse/core';
import { StatusCodes } from 'http-status-codes';

import { useGetMessages, useSendMessage } from '@services/chat.ts';
import Loading from '@core/components/Loading.vue';
import { truncateText } from '@core/helpers/common.ts';
import { parseMessageCreatedAt, isLastMessage } from '@lib/dayjs-parse.ts';
import { useChatStore } from '@stores/chat.ts';
import type { ISendMessage } from '@/types/chat.ts';
import useRealtimeMessage from '@composables/useRealtimeMessage.ts';
import { useAuthStore } from '@stores/auth.ts';

const authStore = useAuthStore();
const chatStore = useChatStore();

const roomId = ref(chatStore.currentUserToMessage?.room_id);
const messageValue = ref('');
const refBottom = ref(null);
const refInput = ref(null);
const newMessages = ref([]);

const limit = 8;

const params = computed(() => {
  if (roomId.value) {
    return {
      room_id: roomId.value,
      limit,
      page: 1,
    };
  }
  return null;
});

const {
  data: dataGetMessages,
  fetchNextPage,
  isFetchingNextPage,
  refetch: refetchGetMessages,
  isLoading,
} = useGetMessages(params.value);

const {
  mutateAsync: sendMessage,
} = useSendMessage();

const maxMessagesPage = computed(() => Math.floor(dataGetMessages.value?.pages[0].total_messages / limit));

const messagesEl = ref<HTMLElement | null>(null);
const {
  arrivedState, y,
} = useScroll(messagesEl, {
  onScroll() {
    if (
      arrivedState.top &&
      !isFetchingNextPage.value &&
      dataGetMessages.value?.pageParams?.length <= maxMessagesPage.value
    ) {
      fetchNextPage();
      nextTick(() => {
        y.value += 200;
      });
    }
  },
});

const messages = computed(() => {
  if (dataGetMessages.value?.pages && dataGetMessages.value.pages.length > 0) {
    let messagesTemp = dataGetMessages.value.pages.reduce((acc, next) => {
      if (dataGetMessages.value.pages.length > 1) {
        return [...next.messages, ...acc];
      }
      else {
        return [...acc, ...next.messages];
      }
    }, []);
    if (newMessages.value.length > 0) {
      messagesTemp = [...messagesTemp, ...newMessages.value];
    }
    return messagesTemp;
  }
  return [];
});

useRealtimeMessage((messageRecord) => {
  newMessages.value.push(messageRecord);
  refBottom.value?.scrollIntoView({
    behavior: 'smooth',
  });
});

onMounted(() => {
  refBottom.value?.scrollIntoView();
  refInput.value?.focus();
});

watch(() => dataGetMessages.value, () => {
  if (dataGetMessages.value?.pageParams?.length === 1) {
    nextTick(() => {
      refBottom.value?.scrollIntoView();
    });
  }
  else {
    nextTick(() => {
      y.value += 200;
    });
  }
});

onUnmounted(() => {
  chatStore.currentUserToMessage = null;
});

async function handleSendMessage() {
  if (!messageValue.value) {
    return;
  }
  const payload: ISendMessage = { text: messageValue.value };
  if (roomId.value) {
    payload.room_id = roomId.value;
  }
  else {
    payload.username = chatStore.currentUserToMessage.username;
  }
  const { data, status } = await sendMessage(payload);

  if (status === StatusCodes.CREATED) {
    messageValue.value = '';
    if (!roomId.value && data.message?.room_id) {
      roomId.value = data.message.room_id;
      await refetchGetMessages();
    }
  }
}

const backLastMessageList = () => {
  chatStore.showViewChatPrivate = false;
};

const toggleShoFullChatbox = () => {
  chatStore.showFullChatbox = !chatStore.showFullChatbox;
};

</script>

<template>
  <div class="relative h-[500px]">
    <!--    Header - Info user-->
    <div class="absolute left-0 top-0 z-10 flex  h-[56px] w-full cursor-pointer items-center gap-4 bg-white/80 px-4">
      <!--        v-if="showFull && !noLastMessages"-->
      <ArrowLeftIcon
        v-if="chatStore.showFullChatbox"
        class="animate size-9 cursor-pointer rounded-full p-2 hover:bg-zinc-300/50"
        aria-hidden="true"
        @click="backLastMessageList"
      />
      <div
        class="w-full"
        @click="toggleShoFullChatbox"
      >
        <p class="text-lg font-bold leading-5">
          {{ truncateText(chatStore.currentUserToMessage?.name, 20, '...') }}
        </p>
        <p class="text-sm text-zinc-500">
          @{{ truncateText(chatStore.currentUserToMessage?.username, 20, '...') }}
        </p>
      </div>
    </div>

    <!--    Body - Messages-->
    <div
      id="messagesId"
      ref="messagesEl"
      class="scrollable-div max-h-80 min-h-[436px] overflow-scroll px-4"
    >
      <div class="h-[56px]" />

      <div
        v-if="isLoading || isFetchingNextPage"
        class="flex-center min-h-[35vh]"
      >
        <Loading
          variant="secondary"
          classes="h-6 w-6"
        />
      </div>
      <div v-else>
        <div
          v-for="(message, index) of messages"
          :key="index"
        >
          <div
            class="max-w-80 whitespace-pre-wrap"
            :class="[( message.user_id === authStore.user?.id ? 'me' : 'you' ),
                     message.user_id !== messages[index + 1]?.user_id && message.user_id !== messages[index - 1]?.user_id ? 'rounded-md' :
                     message.user_id === authStore.user?.id ? {
                       '!rounded-br-md': message.user_id !== messages[index - 1]?.user_id,
                       '!rounded-tr-md': message.user_id !== messages[index + 1]?.user_id,
                       '!rounded-r-md': message.user_id === messages[index + 1]?.user_id && message.user_id === messages[index - 1]?.user_id,
                     } : {
                       '!rounded-bl-md': message.user_id !== messages[index - 1]?.user_id,
                       '!rounded-tl-md': message.user_id !== messages[index + 1]?.user_id,
                       '!rounded-l-md': message.user_id === messages[index + 1]?.user_id && message.user_id === messages[index - 1]?.user_id,
                     }
            ]"
          >
            {{ message.text }}
          </div>
          <div
            v-if="message.user_id !== messages[index + 1]?.user_id ||
              isLastMessage(
                message?.created_at,
                messages[index + 1]?.created_at,
              )
            "
            class="mb-4 mt-1 text-sm text-zinc-500"
            :class="message.user_id === authStore.user?.id ? 'text-right' : 'text-left' "
          >
            {{ parseMessageCreatedAt(message).time }}
          </div>
        </div>
      </div>

      <div
        ref="refBottom"
        class="mt-5 h-12"
      />
    </div>

    <!--    Footer - Input-->
    <div class="bottom-10 mt-3 flex w-full gap-2 px-1.5">
      <div class="flex-center">
        <PlusCircleIcon
          v-tooltip="'Not available'"
          class="size-7 cursor-pointer text-[#606060]"
          aria-hidden="true"
        />
      </div>
      <div class="flex h-[38px] w-full  flex-row items-center rounded-3xl bg-[#f1f2f5] pl-2">
        <input
          ref="refInput"
          v-model="messageValue"
          class="flex h-[36px] w-full items-center rounded-2xl border border-none
                  border-transparent bg-[#f1f2f5] px-2 text-sm outline-none  ring-0"
          placeholder="start a new message"
          @keyup.enter.stop="handleSendMessage"
        >
      </div>
      <div
        v-if="messageValue"
        class="flex-center rounded-full px-1.5 hover:bg-[#f2f2f2]"
      >
        <PaperAirplaneIcon
          class="size-6 cursor-pointer text-[#606060]"
          aria-hidden="true"
          @click="handleSendMessage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

.theme {
  @apply rounded-[18px] px-[12px] py-[6px] mb-1 break-all
}

.me {
  @apply theme w-fit ml-auto bg-[#606060] text-white;
}

.you {
  @apply theme w-max float-none bg-[#e9ecef];
}

</style>
