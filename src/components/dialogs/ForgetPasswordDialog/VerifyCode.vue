<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';

import Input from '@core/components/forms/Input.vue';
import Button from '@core/components/Button.vue';
import { authService } from '@services/auth.ts';
import FormGroup from '@core/components/forms/FormGroup.vue';

const emit = defineEmits<{
  (e: 'changeStep', value: string)
}>();

const token = $ref('');
let errorTokenMsg = $ref('');
let isLoading = $ref(false);

const onSubmit = async () => {
  isLoading = true;
  const { status } = await authService.verifyCodeFromEmail(token);
  isLoading = false;

  if (status === StatusCodes.UNAUTHORIZED) {
    errorTokenMsg = 'Invalid or expired code';
  }
  if (status === StatusCodes.OK) {
    emit('changeStep', token);
  }
};

</script>

<template>
  <div class="mb-4">
    <div class="mb-4">
      <h1 class="mb-2 text-2xl font-bold text-black">
        We send you a code
      </h1>
      <h2 class="text-base leading-6 text-zinc-500">
        Check your email to get your confirmation code. If you need
        to request a new code, go back and reselect a confirmation.
      </h2>
    </div>
    <form @submit.prevent="onSubmit">
      <FormGroup
        class="mb-4"
        label="Code"
        :error="errorTokenMsg"
        size="md"
      >
        <Input
          v-model="token"
          :disabled="isLoading"
          size="md"
        />
      </FormGroup>
      <Button
        :disabled="!token"
        :loading="isLoading"
        radius="lg"
        class="w-full"
        size="md"
        @submit.prevent="onSubmit"
      >
        Next
      </Button>
      <div>
        Here is a
        <a>link</a>
      </div>
    </form>
  </div>
</template>
