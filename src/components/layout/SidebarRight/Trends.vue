<script setup lang="ts">
import { useGetHashtags } from '@/services/post';
import Loading from '@/core/components/Loading.vue';
import { FILTER_SEARCH_ALL } from '@config/const.ts';

const route = useRoute();
const router = useRouter();

const isExplorePage = route.name === 'explore';

const {
  data,
  isPending,
} = useGetHashtags();

const search = (value: string) => {
  router.push({
    name: 'search',
    query: {
      q: value,
      f: FILTER_SEARCH_ALL.TOP,
    },
  });
};

</script>

<template>
  <div
    class="h-fit rounded-2xl"
    :class="!isExplorePage && 'bg-zinc-100'"
  >
    <div
      class="h-fit rounded-2xl py-3"
      :class="!isExplorePage && 'w-[348px] bg-zinc-100'"
    >
      <h2 class="title">
        What’s happening
      </h2>
      <!--      <h2 class="text-2xl font-black px-3">Trend for you</h2>-->

      <div
        v-if="isPending"
        class="flex-center min-h-[35vh]"
      >
        <Loading
          variant="secondary"
          classes="h-7 w-7"
        />
      </div>

      <!-- List Hashtags -->
      <div
        v-else-if="data?.hashtags && data.hashtags.length > 0"
        class="mt-4 flex w-full flex-col"
      >
        <div
          v-for="(hashtag, index) in data.hashtags"
          :key="index"
        >
          <div
            class="block cursor-pointer text-zinc-500"
            :class="isExplorePage ? 'hover:bg-zinc-100/50 p-3' : 'hover:bg-zinc-200/50 px-3 py-2'"
            @click="search(hashtag.name)"
          >
            <p class="text-[13px]">
              Trending in Vietnam
            </p>
            <h5 class="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">
              #{{ hashtag.name }}
            </h5>
            <p class="text-[13px] font-normal text-zinc-600">
              {{ hashtag.count }} posts
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title {
  @apply text-[20px] font-bold px-4;
}
</style>
