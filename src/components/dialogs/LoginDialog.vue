<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { StatusCodes } from 'http-status-codes';

import Input from '@core/components/forms/Input.vue';
import Button from '@core/components/Button.vue';
import { loginSchema } from '@schemas/user.ts';
import Dialog from '@core/components/Dialog.vue';
import { useAuthStore } from '@stores/auth.ts';
import { PAGE_PATHS } from '@config/const.ts';
import { useDialogStore } from '@stores/dialog.ts';
import { useNotificationStore } from '@stores/notification.ts';
import FormGroup from '@core/components/forms/FormGroup.vue';

const dialogStore = useDialogStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const router = useRouter();

const isSubmitted = ref(false);
const isLoading = ref(false);

const {
  handleSubmit, errors, resetForm,
} = useForm({
  validationSchema: toTypedSchema(loginSchema),
  validateOnMount: false,
});

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const validate = (e: Event) => {
  isSubmitted.value = true;
  if (Object.keys(errors.value).length === 0) {
    onSubmit(e);
  }
};

const onSubmit = handleSubmit(async (dataLogin) => {
  isLoading.value = true;
  logger.debug('LoginDialog execute onSubmit', dataLogin, 'src/components/dialog/LoginDialog.vue');
  const { status } = await authStore.login(dataLogin);
  isLoading.value = false;

  switch (status) {
    case StatusCodes.OK:
      router.push(PAGE_PATHS.HOME);
      closeDialog();
      resetForm();
      break;
    case StatusCodes.UNAUTHORIZED:
      notificationStore.notify({
        text: 'Incorrect email or password',
      });
      break;
    default:
      notificationStore.notify({
        text: 'Something wrong',
      });
  }
});

function closeDialog() {
  if (isLoading.value) return;
  dialogStore.close();
  isSubmitted.value = false;
  resetForm();
}

const openRegisterDialog = () => {
  if (isLoading.value) return;
  closeDialog();
  dialogStore.showDialog = 'register';
};

const openForgotPasswordDialog = () => {
  if (isLoading.value) return;
  closeDialog();
  dialogStore.showDialog = 'forgot-password';
};

</script>

<template>
  <Dialog
    :show="dialogStore.showDialog === 'login'"
    :close="closeDialog"
    class-panel="min-w-[100vw] md:min-w-[400px] md:max-w-sm md:mt-20 flex flex-col justify-center"
  >
    <template #panel>
      <div class="flex flex-col gap-5">
        <div class="text-center">
          <h1
            class="mb-1 text-2xl text-black"
          >
            Welcome Back
          </h1>
          <p class="text-sm font-light text-zinc-700">
            We're so excited to see you again!
          </p>
        </div>
        <div class="flex flex-col gap-5 ">
          <form
            data-test="form"
            class="login-form flex flex-col gap-2"
            @submit.prevent="validate"
          >
            <FormGroup
              label="Email"
              :error="isSubmitted ? errors.email : '' "
            >
              <Input
                v-model="email"
                :disabled="isLoading"
                size="md"
                data-test="email"
              />
            </FormGroup>
            <FormGroup
              label="Password"
              :error="isSubmitted ? errors.password : '' "
            >
              <Input
                v-model="password"
                type="password"
                :disabled="isLoading"
                size="md"
                data-test="password"
              />
            </FormGroup>
            <div class=" flex justify-end">
              <p
                class="text-link mb-4 text-sm"
                @click="openForgotPasswordDialog"
              >
                Forgot password?
              </p>
            </div>
            <Button
              :loading="isLoading"
              radius="lg"
              class="w-full"
              size="md"
              @submit.prevent="onSubmit"
            >
              Log in
            </Button>
          </form>
          <div class="flex justify-center text-sm">
            <p class="mr-1 text-zinc-500">
              New to Meepo?
            </p>
            <p
              class="text-link"
              @click="openRegisterDialog"
            >
              Sign up
            </p>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>
