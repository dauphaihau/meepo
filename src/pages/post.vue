<script setup lang="ts">
import { useGetDetailPost } from '@services/post.ts';
import Loading from '@core/components/Loading.vue';

import HeaderMainContent from '@components/layout/HeaderMainContent.vue';
import Button from '@core/components/Button.vue';
import DetailPost from '@components/pages/post/DetailPost.vue';
import CreateSubPostForm from '@components/pages/post/CreateSubPostForm.vue';
import SubPostsList from '@components/pages/post/SubPostsList.vue';
import ParentPost from '@components/pages/post/ParentPost.vue';

const router = useRouter();
const route = useRoute();

const keyPostsComp = ref(0);
const postId = Number(route.params.id);

const {
  data,
  isPending: isPendingGetDetailPost,
} = useGetDetailPost(postId);

</script>

<template>
  <div class="pb-20 md:pb-0">
    <HeaderMainContent title="Post" />
    <div class="h-4" />

    <div
      v-if="isPendingGetDetailPost"
      class="flex-center min-h-[35vh]"
    >
      <Loading
        variant="secondary"
        classes="h-7 w-7"
      />
    </div>
    <div v-else>
      <!--    Response error 404 -->
      <div
        v-if="!data?.post"
        class="mx-auto mt-20 max-w-80"
      >
        <div class="space-y-2">
          <div class="text-3xl font-bold">
            This post doesn’t exist
          </div>
          <div class="font-semibold text-zinc-500">
            Try searching for another.
          </div>
          <Button @click="router.push({name: 'explore'})">
            Search
          </Button>
        </div>
      </div>

      <div v-else>
        <ParentPost
          v-if="data?.post?.parent_post"
          :data-post="data.post.parent_post"
          class="mb-2"
        />

        <DetailPost />

        <div>
          <CreateSubPostForm v-if="data.post.is_current_user_can_comment" />

          <!-- Replies -->
          <SubPostsList :key="keyPostsComp" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
