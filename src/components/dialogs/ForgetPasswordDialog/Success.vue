<script setup lang="ts">

import Button from '@core/components/Button.vue';

const emit = defineEmits<{
  (e: 'closeDialog')
}>();

</script>

<template>
  <div>
    <div class="mb-2">
      <h1 class="mb-2 text-2xl font-bold text-black">
        You're all set
      </h1>
      <h2 class="mb-3 text-[15px] leading-6 text-zinc-600">
        You've successfully changed your password.
      </h2>
      <h2 class="text-[15px] leading-6 text-zinc-600">
        Add an extra layer of security to your account with
        <span class="animate cursor-pointer text-zinc-600 underline underline-offset-2 hover:text-black">
          two-factor authentication</span>. Enable it in your settings to help make sure that you, and
        only you, can access your account.
      </h2>

      <Button
        radius="lg"
        class="mt-4 w-full"
        size="md"
        @click="() => emit('closeDialog')"
      >
        Continue to Meepo
      </Button>
    </div>
  </div>
</template>
