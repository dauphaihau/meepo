<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';

import Loading from '@core/components/Loading.vue';
import { useGetLastMessages } from '@services/chat.ts';
import { parseTimeFromNow } from '@lib/dayjs-parse.ts';
import { truncateText } from '@core/helpers/common.ts';
import type { ILastMessage, IMessage, IResponseGetLastMessages } from '@/types/chat.ts';

import HeaderMainContent from '@components/layout/HeaderMainContent.vue';
import router from '@/router';
import { useChatStore } from '@stores/chat.ts';
import useRealtimeMessage from '@composables/useRealtimeMessage.ts';
import { PAGE_PATHS } from '@config/const.ts';
import { useAuthStore } from '@stores/auth.ts';

const minTabletScreen = useMediaQuery('(min-width: 768px)');
const authStore = useAuthStore();
const chatStore = useChatStore();

const limit = 20;

const {
  data: dataGetLastMessages,
  fetchNextPage,
  isFetchingNextPage,
  refetch: refetchGetLastMessages, isPending: isPendingGetLastMessages,
} = useGetLastMessages({
  limit,
  page: 1,
});

const maxRoomsPage = computed(() => Math.floor(dataGetLastMessages.value?.pages[0]?.total_messages / limit));

const lastMessages = computed<IResponseGetLastMessages['messages']>(() => {
  if (dataGetLastMessages.value?.pages && dataGetLastMessages.value.pages.length > 0) {
    return dataGetLastMessages.value.pages.reduce((acc, next) => {
      return [...acc, ...next.messages];
    }, []);
  }
  return [];
});

useRealtimeMessage((messageRecord) => {
  const idx = lastMessages.value.findIndex(
    (item: ILastMessage) => item.participant_username === messageRecord.username
  );
  if (idx !== -1) {
    refetchGetLastMessages();
  }
});

onBeforeMount(() => {
  if (minTabletScreen.value) {
    router.push(PAGE_PATHS.HOME);
  }
});

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'explore' });
  }
  window.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});

function onScroll() {
  let { scrollTop, offsetHeight } = document.documentElement;
  const offset = 300;

  const isBottomOfWindow = scrollTop + window.innerHeight >= offsetHeight - offset;

  if (
    isBottomOfWindow &&
    !isFetchingNextPage.value &&
    dataGetLastMessages.value?.pageParams?.length <= maxRoomsPage.value
  ) {
    fetchNextPage();
  }
}

const onClickMessage = (message: ILastMessage & Pick<IMessage, 'room_id'>) => {
  router.push(PAGE_PATHS.ROOMS);
  chatStore.messageToUser({
    room_id: message.room_id,
    name: message.participant_name,
    username: message.participant_username,
    avatar_url: message.participant_avatar_url,
  });
};

</script>

<template>
  <div>
    <HeaderMainContent title="Messages" />
    <div class="h-[53px]" />

    <!-- Last messages -->
    <div>
      <div
        v-if="lastMessages && lastMessages.length > 0"
        class="pb-16"
      >
        <div
          v-for="message of lastMessages"
          :key="message.id"
        >
          <div
            class="flex h-[73px] cursor-pointer  items-center gap-2 px-4 hover:bg-zinc-50 "
            @click="onClickMessage(message)"
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
              src="../assets/default-avatar.png"
              class="size-10 rounded-full bg-black "
            >

            <div class="flex flex-col justify-center">
              <div class="flex max-w-[80vw] gap-2 text-[15px]">
                <p class="font-semibold">
                  {{ truncateText(message.participant_name, 10, '...') }}
                </p>
                <p class="text-zinc-500">
                  @{{ truncateText(message.participant_username, 10, '...') }}
                </p>
                <span class="text-zinc-500">·</span>
                <p class="text-zinc-500">
                  {{ truncateText(parseTimeFromNow(message.created_at), 7, '...') }}
                </p>
              </div>
              <div class="h-5 text-zinc-500">
                {{ truncateText(message.text, 33, '...') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="!isPendingGetLastMessages"
        class="mt-12 px-10"
      >
        <h3 class="mb-2 pr-2 text-3xl font-extrabold">
          Welcome to your inbox!
        </h3>
        <p class="text-sm text-zinc-500">
          Drop a line, share posts and more with private conversations between you and others on Meepo.
        </p>
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

<style scoped></style>
