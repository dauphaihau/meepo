<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';

import Input from '@core/components/forms/Input.vue';
import Button from '@core/components/Button.vue';
import { authService } from '@services/auth.ts';
import FormGroup from '@core/components/forms/FormGroup.vue';

const emit = defineEmits<{
  (e: 'changeStep')
}>();

const isLoading = ref(false);
const refInput = ref(null);
const query = ref('');
const errorQueryMsg = ref('');

const onSubmit = async () => {
  isLoading.value = true;
  const { status } = await authService.forgetPassword(query.value);
  isLoading.value = false;

  if (status === StatusCodes.OK) {
    emit('changeStep');
  }
  if (status === StatusCodes.NOT_FOUND) {
    errorQueryMsg.value = 'Sorry, we could not find your account.';
  }
};

</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="mb-2 text-2xl font-bold text-black">
        Find your Meepo account
      </h1>
      <h2 class="text-sm leading-6 text-zinc-600 md:text-base">
        Enter the email or username associated with your account to change
        your password.
      </h2>
    </div>

    <form @submit.prevent="onSubmit">
      <FormGroup
        class="mb-4"
        label="Email, username"
        :error="errorQueryMsg"
        size="md"
      >
        <Input
          ref="refInput"
          v-model="query"
          :disabled="isLoading"
          size="md"
        />
      </FormGroup>
      <Button
        :disabled="!query"
        :loading="isLoading"
        radius="lg"
        class="w-full"
        size="md"
        @submit.prevent="onSubmit"
      >
        Next
      </Button>
    </form>
  </div>
</template>
