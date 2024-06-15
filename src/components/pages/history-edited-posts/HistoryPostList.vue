<script setup lang="ts">
import Loading from '@/core/components/Loading.vue';
import { useGetDetailPost, useGetPosts } from '@/services/post';
import { POST_FILTER_BY } from '@/config/const';
import type { IParamsGetPosts } from '@/types/post';
import HistoryPost from '@components/pages/history-edited-posts/HistoryPost.vue';

const route = useRoute();

const keyPosts = ref(0);

const limit = 5;
const postId = route.params.id;

onMounted(() => {
  window.scrollTo(0, 0);
});

const {
  data: detailPost,
} = useGetDetailPost(Number(postId));

const paramsGetPost = computed(() => {
  const base: IParamsGetPosts = {
    page: 1,
    by: POST_FILTER_BY.DEFAULT,
    limit,
    user_id: detailPost.value.post.author.id,
    edited_parent_id: Number(postId),
  };
  return base;
});

const {
  data,
  isPending,
} = useGetPosts(paramsGetPost.value);

const posts = computed(() => {
  if (data.value?.pages && data.value.pages.length > 0) {
    return data.value.pages.reduce((acc, next) => {
      return [...acc, ...next.posts];
    }, []);
  }
  return [];
});

</script>

<template>
  <div class="flex flex-col">
    <div
      v-if="isPending"
      class="flex-center min-h-[35vh]"
    >
      <Loading
        variant="secondary"
        classes="h-7 w-7"
      />
    </div>

    <div
      v-if="posts && posts.length > 0"
      :key="keyPosts"
      class="relative z-[1] flex flex-col"
    >
      <div
        v-for="post in posts"
        :key="post.id"
      >
        <HistoryPost
          class="border-b"
          :data-post="post"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
