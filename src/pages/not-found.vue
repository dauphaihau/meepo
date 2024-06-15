<script setup>
import Button from '@core/components/Button.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
  <div>
    <div class="mx-auto mt-20 max-w-80">
      <div class="space-y-3">
        <div class="text-3xl font-bold">
          Hmm...this page doesn’t exist.
        </div>
        <div class="font-semibold text-zinc-500">
          Try searching for something else.
        </div>
        <Button @click="router.push({name: 'explore'})">
          Search
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
