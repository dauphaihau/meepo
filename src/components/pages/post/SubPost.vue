<script setup lang="ts">
import type { IResponseGetPost } from '@/types/post';
import PostOptions from '@components/common/post/PostOptions.vue';
import PostActions from '@components/common/post/PostActions.vue';
import InfoAuthorPost from '@components/common/post/InfoAuthorPost.vue';
import AvatarAuthorPost from '@components/common/post/AvatarAuthorPost.vue';
import ContentPost from '@components/common/post/ContentPost.vue';
import { useGetDetailPost } from '@services/post.ts';
import { PAGE_PATHS } from '@config/const.ts';
import { useAuthStore } from '@stores/auth.ts';

interface Props {
  dataPost: IResponseGetPost
  isSubPost?: boolean
}

let {
  dataPost,
} = defineProps<Props>();

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();

const isHover = ref(false);
const isHoverAction = ref(false);
const isOpenPopover = ref(false);

const postId = route.params.id;

const {
  data: detailPost,
} = useGetDetailPost(Number(postId));

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
      class="relative mx-[0.3px] my-[0.2px] flex flex-col"
      :class="{'z-[1]': isHover}"
      @mouseover="isHover = true"
      @mouseleave="isHover = false"
    >
      <div
        class="animate flex flex-col bg-white px-4 hover:bg-zinc-100"
        :class="{'cursor-pointer': !isOpenPopover, }"
        @click="!isOpenPopover && !isHoverAction && redirectDetailPost()"
      >
        <div class="flex flex-row">
          <AvatarAuthorPost
            :show-line-connect-sub-post="
              detailPost.post.author.username === dataPost?.sub_post?.author_username
            "
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
              :disabled-actions="!detailPost.post.is_current_user_can_comment ? ['reply'] : []"
              :data-post="dataPost"
              @on-hover-action="onHoverAction"
            />
          </div>
        </div>
      </div>

      <div class="absolute right-5 top-3.5 h-5">
        <PostOptions
          v-if="authStore.user?.id === dataPost.user_id"
          :data-post="dataPost"
        />
      </div>
    </div>

    <div
      v-if="dataPost.sub_post &&
        detailPost?.post?.author?.username === dataPost?.sub_post?.author_username"
    >
      <SubPost
        is-sub-post
        :data-post="dataPost.sub_post"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
