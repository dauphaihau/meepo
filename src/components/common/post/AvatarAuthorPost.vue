<script setup lang="ts">
import { useRouter } from 'vue-router';

import UserPopper from '@components/UserPopper.vue';
import type { IResponseGetPost } from '@/types/post.ts';
import { PAGE_PATHS } from '@config/const.ts';

interface IProps {
  dataPost: IResponseGetPost
  showLineConnectSubPost?: boolean
}

const { dataPost, showLineConnectSubPost } = defineProps<IProps>();

const emit = defineEmits<(e: 'onOpenPopover', value: boolean) => void>();

const router = useRouter();

const onOpenPopover = (val: boolean) => {
  emit('onOpenPopover', val);
};

const redirectProfile = () => {
  if (dataPost?.author?.username) {
    router.push(`${PAGE_PATHS.USER}/${dataPost.author.username}`);
  }
};

</script>

<template>
  <!--          Avatar-->
  <div class="relative mr-3 flex min-w-[40px] max-w-[40px] basis-11 flex-col pt-3">
    <UserPopper
      :username="dataPost?.author_username"
      class="w-fit"
      @on-open-popover="onOpenPopover"
    >
      <div class="before:absolute">
        <img
          v-if="dataPost.author_avatar_url"
          :src="dataPost.author_avatar_url"
          alt="avatar"
          class="size-10 rounded-full bg-black "
          @click="redirectProfile"
        >
        <img
          v-else
          src="@assets/default-avatar.png"
          alt="avatar"
          class="size-10 rounded-full bg-black "
          @click="redirectProfile"
        >
      </div>
    </UserPopper>

    <!-- line connect avatar parent and child post &&-->
    <div
      v-if="dataPost.sub_posts_count > 0 && showLineConnectSubPost"
      class="mx-auto mt-1 min-h-0 min-w-0 shrink-0 grow basis-auto items-stretch border md:mt-0"
    />
  </div>
</template>

<style scoped>

</style>
