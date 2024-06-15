<script setup lang="ts">
import type { IResponseGetPost } from '@/types/post.ts';
import { formatTextWithHashTags } from '@core/helpers/common.ts';

interface IProps {
  dataPost: IResponseGetPost
}

const { dataPost } = defineProps<IProps>();

</script>

<template>
  <p
    class="content-post"
    data-test="content"
    v-html="formatTextWithHashTags(dataPost.content)"
  />
  <img
    v-if="dataPost.image_url"
    :src="dataPost.image_url"
    alt=""
    class="my-4 h-auto w-full rounded-xl"
  >
</template>

<style scoped>

.content-post {
  @apply font-normal text-zinc-700 dark:text-zinc-400 text-[15px]
  whitespace-pre-line mt-1.5 break-words;
}

</style>
