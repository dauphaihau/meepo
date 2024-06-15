<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import {
  ArrowPathRoundedSquareIcon,
  BookmarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/vue/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/vue/24/solid';

import type { IResponseGetPost } from '@/types/post.ts';
import useRealtimePost from '@/composables/useRealtimePost.ts';
import { useLikePost } from '@services/post.ts';
import { useDialogStore } from '@stores/dialog.ts';
import { useAuthStore } from '@stores/auth.ts';
import { useQueryClient } from '@tanstack/vue-query';

type Actions = 'repost' | 'like' | 'reply' | 'bookmark' | 'share';

interface IProps {
  dataPost: IResponseGetPost
  disabledActions?: Actions[]
}

const { dataPost, disabledActions } = withDefaults(defineProps<IProps>(), {
  disabledActions: () => [],
});

const dialogStore = useDialogStore();
const authStore = useAuthStore();
const queryClient = useQueryClient();

const post = ref({ ...dataPost });

const { animationLikes, animationComments } = useRealtimePost(post);

const emit = defineEmits<(e: 'onHoverAction', value: boolean) => void>();

const {
  mutateAsync: likePost,
} = useLikePost(post.value.id);

const handleLikePost = async () => {
  if (disabledActions.includes('like')) {
    return;
  }
  if (!authStore.isLoggedIn) {
    dialogStore.showDialog = 'login';
    return;
  }

  post.value.is_current_user_like = !post.value.is_current_user_like;
  const { status } = await likePost();

  if (status !== StatusCodes.OK) {
    post.value.is_current_user_like = !post.value.is_current_user_like;
    return;
  }
  queryClient.removeQueries({
    queryKey: ['get-posts'],
  });
  queryClient.removeQueries({
    queryKey: ['detail-post'],
  });
};

const handleShowReplyPostDialog = () => {
  if (disabledActions.includes('reply')) {
    return;
  }
  if (!authStore.isLoggedIn) {
    dialogStore.showDialog = 'login';
    return;
  }
  dialogStore.showDialog = 'reply-post';
  dialogStore.data = post.value;
};

</script>

<template>
  <div class="ml-[-7px] mr-[-4px] mt-1 flex items-center">
    <!-- Reply -->
    <div class="item-action">
      <div class="flex items-center gap-1 md:gap-0">
        <div
          class="item-action-icon"
          :class="{'opacity-50': disabledActions.includes('reply')}"
          @click="handleShowReplyPostDialog"
          @mouseover="emit('onHoverAction', true)"
          @mouseleave="emit('onHoverAction', false)"
        >
          <ChatBubbleOvalLeftEllipsisIcon
            v-if="post.sub_posts_count > 0"
            v-tooltip="'Reply'"
          />
          <ChatBubbleOvalLeftIcon
            v-else
            v-tooltip="'Reply'"
          />
        </div>
        <span
          v-if="post.sub_posts_count > 0"
          class="item-action-text"
          :class="[animationComments, disabledActions.includes('reply') && 'item-action-text-disabled']"
        >
          {{ post.sub_posts_count }}
        </span>
      </div>
    </div>

    <!-- Repost -->
    <div class="item-action">
      <div
        class="item-action-icon"
        :class="{'opacity-50': disabledActions.includes('repost')}"
        @mouseover="emit('onHoverAction', true)"
        @mouseleave="emit('onHoverAction', false)"
      >
        <ArrowPathRoundedSquareIcon
          v-tooltip="'Not available'"
        />
      </div>
    </div>

    <!-- Like -->
    <div class="item-action">
      <div class="flex items-center gap-1 md:gap-0">
        <div
          class="item-action-icon"
          :class="{'opacity-50': disabledActions.includes('like')}"
          @click=" handleLikePost"
          @mouseover="emit('onHoverAction', true)"
          @mouseleave="emit('onHoverAction', false)"
        >
          <HeartIconSolid
            v-if="post.is_current_user_like"
            v-tooltip="'Unlike'"
          />
          <HeartIcon
            v-else
            v-tooltip="'Like'"
          />
        </div>
        <span
          v-if="post.likes_count > 0"
          class="item-action-text"
          :class="[animationLikes, disabledActions.includes('like') && 'item-action-text-disabled']"
        >
          {{ post.likes_count }}
        </span>
      </div>
    </div>

    <!-- Bookmark -->
    <div class="item-action">
      <div
        class="item-action-icon"
        :class="{'opacity-50': disabledActions.includes('bookmark')}"
        @mouseover="emit('onHoverAction', true)"
        @mouseleave="emit('onHoverAction', false)"
      >
        <BookmarkIcon
          v-tooltip="'Not available'"
        />
      </div>
    </div>

    <!-- Share -->
    <div class="">
      <div
        class="item-action-icon"
        :class="{'opacity-50': disabledActions.includes('share')}"
        @mouseover="emit('onHoverAction', true)"
        @mouseleave="emit('onHoverAction', false)"
      >
        <ShareIcon
          v-tooltip="'Not available'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

.item-action {
  @apply flex flex-1 items-stretch justify-start;
}

.item-action-icon {
  @apply text-zinc-500 h-5 w-5 md:h-8 md:w-8 md:p-1.5 hover:bg-zinc-200 animate rounded-full;
}

.item-action-text {
  @apply text-zinc-500
}

.item-action-text-disabled {
  @apply text-zinc-500/50
}

</style>
