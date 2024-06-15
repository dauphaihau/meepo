<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import dayjs from 'dayjs';

import { truncateText } from '@core/helpers/common.ts';
import { PencilIcon } from '@heroicons/vue/24/outline';
import UserPopper from '@components/UserPopper.vue';
import type { IResponseGetPost } from '@/types/post.ts';

import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface IProps {
  dataPost: IResponseGetPost
}

const { dataPost } = defineProps<IProps>();

const emit = defineEmits<(e: 'onOpenPopover', value: boolean) => void>();

const router = useRouter();
const isTabletScreen = useMediaQuery('(min-width: 768px)');

const parseCreatedAt = computed(() => {
  if (dayjs(dataPost?.created_at).isValid()) {
    return dayjs(dataPost.created_at).fromNow();
  }
  return '';
});

const onOpenPopover = (val: boolean) => {
  emit('onOpenPopover', val);
};

const redirectProfile = () => {
  router.push('/user/' + dataPost.author_username);
};

</script>

<template>
  <div class="flex justify-between">
    <div class="flex w-full max-w-[100vw] gap-2 text-[15px]">
      <!--  Name -->
      <UserPopper
        :username="dataPost.author_username"
        @on-open-popover="onOpenPopover"
      >
        <div
          class="font-bold text-black before:absolute hover:underline hover:underline-offset-2"
          @click="redirectProfile"
        >
          {{ truncateText(dataPost.author_name ?? dataPost.author.name, isTabletScreen ? 20 : 7, '...') }}
        </div>
      </UserPopper>

      <!--  username & createdAt post -->
      <div class="inline-flex gap-1 text-zinc-500">
        <UserPopper
          :username="dataPost.author_username"
          @on-open-popover="onOpenPopover"
        >
          <div
            class="max-w-28 truncate before:absolute md:max-w-44"
            @click="redirectProfile"
          >
            @{{ truncateText(
              dataPost.author_username ?? dataPost.author.username,
              isTabletScreen ? 20 : (dataPost.edited_posts_count > 0 ? 4 : 8),
              '...')
            }}
          </div>
        </UserPopper>

        · {{ truncateText(parseCreatedAt, 8) }}
        <div
          v-if="dataPost.edited_posts_count > 0"
          class="flex gap-1"
        >
          ·
          <PencilIcon class="h-auto w-4" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
