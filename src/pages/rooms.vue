<script setup lang="ts">
import { PlusCircleIcon, PaperAirplaneIcon, ArrowLeftIcon } from '@heroicons/vue/20/solid';

import HeaderMainContent from '@components/layout/HeaderMainContent.vue';
import { useGetMessages, useSendMessage } from '@services/chat.ts';
import Loading from '@core/components/Loading.vue';
import { truncateText } from '@core/helpers/common.ts';
import { parseMessageCreatedAt, isLastMessage } from '@lib/dayjs-parse.ts';
import type { ISendMessage } from '@/types/chat.ts';
import { useMediaQuery } from '@vueuse/core';
import { PAGE_PATHS } from '@config/const.ts';
import { useChatStore } from '@stores/chat.ts';
import useRealtimeMessage from '@composables/useRealtimeMessage.ts';
import { StatusCodes } from 'http-status-codes';
import { useAuthStore } from '@stores/auth.ts';

const authStore = useAuthStore();
const chatStore = useChatStore();
const isTabletScreen = useMediaQuery('(min-width: 768px)');
const router = useRouter();

const newMessages = ref([]);
const messageValue = ref('');
const refBottom = ref<HTMLDivElement | null>(null);
const refInput = ref<HTMLInputElement | null>(null);

const roomId = ref(chatStore.currentUserToMessage?.room_id);

const limit = 20;

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
  mutateAsync: sendMessage,
} = useSendMessage();

const {
  data: dataGetMessages,
  fetchNextPage,
  isFetchingNextPage,
  refetch: refetchGetMessages,
  isLoading,
} = useGetMessages(params.value);

const maxMessagesPage = computed(() => Math.floor(dataGetMessages.value?.pages[0].total_messages / limit));

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
  scrollToBottomWindow();
});

onBeforeMount(() => {
  if (isTabletScreen.value) {
    router.push(PAGE_PATHS.HOME);
  }
});

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await router.push(PAGE_PATHS.EXPLORE);
    return;
  }
  window.addEventListener('scroll', onScroll);
  scrollToBottomWindow();
  refInput.value?.focus();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(() => dataGetMessages.value, () => {
  if (dataGetMessages.value?.pageParams?.length === 1) {
    nextTick(() => {
      scrollToBottomWindow();
    });
  }
});

function onScroll() {
  const isReachTop = document.documentElement.scrollTop === 0;
  if (
    isReachTop &&
    !isFetchingNextPage.value &&
    dataGetMessages.value?.pageParams?.length <= maxMessagesPage.value
  ) {
    fetchNextPage();
    nextTick(() => {
      document.documentElement.scrollTop += 300;
    });
  }
}

function scrollToBottomWindow() {
  window.scrollTo(0, document.body.scrollHeight);
}

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

const backMessagesPage = () => {
  router.push(PAGE_PATHS.MESSAGES);
  chatStore.currentUserToMessage = null;
};
const redirectProfile = () => {
  router.push(`${PAGE_PATHS.USER}/${chatStore.currentUserToMessage.username}`);
};

</script>

<template>
  <div>
    <!--    Header-->
    <HeaderMainContent>
      <template #tabs>
        <div class="absolute left-0 top-0 z-10 flex  h-[56px] w-full cursor-pointer items-center gap-4 bg-white/80 px-4">
          <ArrowLeftIcon
            class="animate size-9 cursor-pointer rounded-full p-2 hover:bg-zinc-300/50"
            aria-hidden="true"
            @click="backMessagesPage"
          />

          <div
            class="flex items-center gap-2"
            @click="redirectProfile"
          >
            <div>
              <img
                v-if="chatStore.currentUserToMessage?.avatar_url"
                alt="avatar"
                :src="chatStore.currentUserToMessage?.avatar_url"
                class="size-8 rounded-full bg-black "
              >
              <img
                v-else
                alt="avatar"
                src="../assets/default-avatar.png"
                class="size-8 rounded-full bg-black "
              >
            </div>
            <div>
              <div class="text-[17px] font-bold leading-5">
                {{ truncateText(chatStore.currentUserToMessage?.name, 18, '...') }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </HeaderMainContent>

    <!-- Messages-->
    <div
      id="messagesId"
      class="px-3"
    >
      <div class="h-[56px]" />
      <div
        v-if="isLoading"
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
          :key="message.id"
        >
          <div
            class="max-w-80 whitespace-pre-wrap"
            :class="[( message.user_id === authStore.user?.id ? 'me' : 'you' ),

                     message.user_id !== messages[index + 1]?.user_id && message.user_id !== messages[index - 1]?.user_id ? '' :

                     message.user_id === authStore.user?.id ? {
                       '!rounded-tr-md': message.user_id !== messages[index + 1]?.user_id ,
                       '!rounded-br-md': message.user_id !== messages[index - 1]?.user_id ,
                       '!rounded-r-md': message.user_id === messages[index + 1]?.user_id && message.user_id === messages[index - 1]?.user_id ,
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
            v-if="
              message.user_id !== messages[index + 1]?.user_id ||
                isLastMessage(
                  message?.created_at,
                  messages[index + 1]?.created_at,
                )
            "
            class="mb-5 mt-1 text-sm text-zinc-500"
            :class="message.user_id === authStore.user?.id ? 'text-right' : 'text-left' "
          >
            {{ parseMessageCreatedAt(message).time }}
          </div>
        </div>
      </div>

      <div
        ref="refBottom"
        class="mt-5 h-16"
      />
    </div>

    <!--    Footer - Input-->
    <div class="fixed bottom-0 z-10 h-16 w-full bg-white">
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
            autofocus
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
