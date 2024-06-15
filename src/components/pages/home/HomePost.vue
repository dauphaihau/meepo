<script setup lang="ts">
import PostOptions from '@components/common/post/PostOptions.vue';
import type { IResponseGetPost } from '@/types/post';
import AvatarAuthorPost from '@components/common/post/AvatarAuthorPost.vue';
import InfoAuthorPost from '@components/common/post/InfoAuthorPost.vue';
import ContentPost from '@components/common/post/ContentPost.vue';
import PostActions from '@components/common/post/PostActions.vue';
import { useAuthStore } from '@stores/auth.ts';
import { PAGE_PATHS } from '@config/const.ts';

interface IProps {
  dataPost: IResponseGetPost
}

const {
  dataPost,
} = defineProps<IProps>();

const router = useRouter();
const authStore = useAuthStore();

const isHover = ref(false);
const isOpenPopover = ref(false);
const keyOptionsPost = ref(0);
const isHoverAction = ref(false);

const onOpenPopover = (val: boolean) => {
  isOpenPopover.value = val;
};

const onHoverAction = (val: boolean) => {
  isHoverAction.value = val;
};

const redirectDetailPost = () => {
  router.push(`${PAGE_PATHS.POSTS}/${dataPost.id}`);
};

</script>

<template>
  <div>
    <div
      class="relative mx-[0.3px] flex flex-col"
      :class="{'z-[1]': isHover}"
      @mouseover="isHover = true"
      @mouseleave="isHover = false"
    >
      <div
        id="post"
        class="animate flex flex-col bg-white px-4 hover:bg-zinc-100"
        :class="{'cursor-pointer': !isOpenPopover }"
        @click="!isOpenPopover && !isHoverAction && redirectDetailPost()"
      >
        <div class="flex flex-row">
          <AvatarAuthorPost
            :data-post="dataPost"
            @on-open-popover="onOpenPopover"
          />

          <div class="w-full max-w-[83%] py-3 md:max-w-[90%]">
            <InfoAuthorPost
              :data-post="dataPost"
              @on-open-popover="onOpenPopover"
            />
            <ContentPost :data-post="dataPost" />

            <PostActions
              :data-post="dataPost"
              @on-hover-action="onHoverAction"
            />
          </div>
        </div>
      </div>

      <div class="absolute right-5 top-3.5 h-5">
        <PostOptions
          v-if="authStore.user?.id === dataPost?.user_id"
          :key="keyOptionsPost"
          :data-post="dataPost"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
