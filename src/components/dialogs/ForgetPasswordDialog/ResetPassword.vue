<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { StatusCodes } from 'http-status-codes';

import Input from '@core/components/forms/Input.vue';
import Button from '@core/components/Button.vue';
import { authService } from '@services/auth.ts';
import { resetPasswordSchema } from '@schemas/user.ts';
import { useNotificationStore } from '@stores/notification.ts';
import { useAuthStore } from '@stores/auth.ts';
import { PAGE_PATHS } from '@config/const.ts';
import FormGroup from '@core/components/forms/FormGroup.vue';

const emit = defineEmits<{
  (e: 'changeStep')
}>();

const { token } = defineProps<{ token: string }>();

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();

const isSubmitted = ref(false);
const isLoading = ref(false);

const {
  handleSubmit, errors,
} = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
  validateOnMount: false,
});

const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');

const validate = (e: Event) => {
  isSubmitted.value = true;
  if (Object.keys(errors.value).length === 0) {
    onSubmit(e);
  }
};

const onSubmit = handleSubmit(async () => {
  isLoading.value = true;
  const { status, data } = await authService.resetPassword({
    token,
    password: password.value,
  });
  if (status === StatusCodes.UNAUTHORIZED) {
    notificationStore.notify({
      text: 'Invalid or expired code',
    });
    isLoading.value = false;
    return;
  }
  if (status === StatusCodes.OK && data?.user) {
    const responseLogin = await authStore.login({
      email: data?.user.email,
      password: password.value,
    });
    if (responseLogin.status === StatusCodes.OK) {
      emit('changeStep');
      await router.push(PAGE_PATHS.HOME);
    }
  }
  isLoading.value = false;
});

</script>

<template>
  <div class="mb-4">
    <div class="mb-4">
      <h1 class="mb-2 text-2xl font-bold text-black">
        Choose a new password
      </h1>
      <h2 class="text-[15px] leading-6 text-zinc-500">
        Make sure your password must has at least 8 characters that
        include at least 1 lowercase character,
        1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)
      </h2>
    </div>
    <form @submit.prevent="validate">
      <FormGroup
        class="mb-4"
        label="Password"
        :error="isSubmitted && errors.password ? 'Invalid Password' : ''"
        size="md"
      >
        <Input
          v-model="password"
          :disabled="isLoading"
          type="password"
          size="md"
        />
      </FormGroup>
      <FormGroup
        class="mb-6"
        label="Confirm Password"
        :error="isSubmitted ? errors.confirmPassword : ''"
        size="md"
      >
        <Input
          v-model="confirmPassword"
          :disabled="isLoading"
          type="password"
          size="md"
        />
      </FormGroup>
      <Button
        :loading="isLoading"
        :disabled="!password || !confirmPassword"
        radius="lg"
        class="w-full"
        size="md"
        @submit.prevent="validate"
      >
        Change Password
      </Button>
    </form>
  </div>
</template>
