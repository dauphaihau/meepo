<script setup lang="ts">
import { StarIcon } from '@heroicons/vue/24/solid';
import { POST_FILTER_BY } from '@config/const';
import OptionsPost from '@components/common/post/PostOptions.vue';
import type { IResponseGetPost } from '@/types/post';
import InfoAuthorPost from '@components/common/post/InfoAuthorPost.vue';
import ContentPost from '@components/common/post/ContentPost.vue';
import PostActions from '@components/common/post/PostActions.vue';
import AvatarAuthorPost from '@components/common/post/AvatarAuthorPost.vue';
import { POST_PIN_STATUS } from '@config/post.ts';
import { useAuthStore } from '@stores/auth.ts';

interface Props {
  dataPost: IResponseGetPost
  isSubPost?: boolean
  by?: POST_FILTER_BY
}

let {
  dataPost, by,
} = defineProps<Props>();

const router = useRouter();

const authStore = useAuthStore();

const isHover = ref(false);
const isHoverAction = ref(false);
const isOpenPopover = ref(false);

const onOpenPopover = (val: boolean) => {
  isOpenPopover.value = val;
};

const onHoverAction = (val: boolean) => {
  isHoverAction.value = val;
};

const redirectDetailPost = () => {
  router.push('/posts/' + dataPost.id);
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
        class="animate flex flex-col bg-white px-4 hover:bg-zinc-100"
        :class="{'cursor-pointer': !isOpenPopover, }"
        @click="!isOpenPopover && !isHoverAction && redirectDetailPost()"
      >
        <!--         Pin Post-->
        <div
          v-if="dataPost.pin_status_int === POST_PIN_STATUS.PIN"
          class="mb-[-10px] ml-[30px] mt-2 flex items-center gap-3 text-zinc-500"
        >
          <StarIcon class="size-4" />
          <p class="text-[13px] font-semibold">
            Pinned Post
          </p>
        </div>

        <div class="flex flex-row">
          <AvatarAuthorPost
            :show-line-connect-sub-post="by === POST_FILTER_BY.COMMENTS && !isSubPost"
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

      <div
        v-if="authStore.user?.id === dataPost.user_id"
        class="absolute right-5 h-5"
        :class="dataPost.pin_status_int === POST_PIN_STATUS.PIN ? 'top-8' : 'top-3.5'"
      >
        <OptionsPost
          :data-post="dataPost"
        />
      </div>
    </div>

    <div
      v-if="by === POST_FILTER_BY.COMMENTS &&
        dataPost.sub_post &&
        authStore.user?.username === dataPost?.sub_post?.author_username"
    >
      <ProfilePost
        is-sub-post
        :by="by"
        :data-post="dataPost.sub_post"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
