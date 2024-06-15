<script setup lang="ts">
import { UserGroupIcon } from '@heroicons/vue/20/solid';

import Loading from '@core/components/Loading.vue';
import { useGetDetailPost, useGetPosts } from '@services/post';
import { POST_FILTER_BY } from '@config/const';
import type { IParamsGetPosts } from '@/types/post';
import SubPost from '@components/pages/post/SubPost.vue';
import type { IUser } from '@/types/user.ts';

const route = useRoute();

const limit = 10;
const postId = route.params.id;

const {
  data: detailPost,
} = useGetDetailPost(Number(postId));

const author = computed<IUser>(() => detailPost.value.post.author);

const params = computed(() => {
  const base: IParamsGetPosts = {
    page: 1,
    by: POST_FILTER_BY.DEFAULT,
    limit,
    parent_id: Number(postId),
  };
  return base;
});

const {
  data: dataGetPosts,
  isFetching,
  fetchNextPage,
  isFetchingNextPage,
} = useGetPosts(params.value);

const maxPostsPage = computed(() => Math.floor(dataGetPosts.value.pages[0].total_posts / limit));

const posts = computed(() => {
  if (dataGetPosts.value?.pages && dataGetPosts.value.pages.length > 0) {
    return dataGetPosts.value.pages.reduce((acc, next) => {
      return [...acc, ...next.posts];
    }, []);
  }
  return [];
});

onMounted(() => {
  window.scrollTo(0, 0);
  window.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});

function onScroll() {
  if (
    window.scrollY + window.innerHeight >= (document.body.scrollHeight * 85 / 100) &&
    !isFetchingNextPage.value &&
    dataGetPosts.value?.pageParams?.length <= maxPostsPage.value
  ) {
    fetchNextPage();
  }
}

</script>

<template>
  <div class="flex flex-col">
    <div
      v-if="detailPost?.post && !detailPost.post.is_current_user_can_comment"
      class="border-b md:border-t"
    >
      <div class="m-5 flex gap-4 rounded-lg bg-zinc-100 p-3">
        <UserGroupIcon class="size-9 rounded-full bg-zinc-200 p-2 text-black" />
        <div>
          <div class="font-bold">
            Who can reply?
          </div>
          <div
            v-if="author"
            class="text-sm font-normal"
          >
            Accounts @{{ author.username }} or mentioned can reply
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="posts && posts.length > 0"
      class="relative z-[1] flex flex-col"
    >
      <div
        v-for="post in posts"
        :key="post.id"
      >
        <SubPost
          class="border-b"
          :data-post="post"
        />
      </div>
    </div>

    <div
      v-if="isFetching || isFetchingNextPage"
      class="flex-center min-h-[35vh]"
    >
      <Loading
        variant="secondary"
        classes="h-7 w-7"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
