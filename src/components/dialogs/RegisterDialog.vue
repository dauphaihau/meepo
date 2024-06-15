<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { StatusCodes } from 'http-status-codes';

import Dialog from '@core/components/Dialog.vue';
import Input from '@core/components/forms/Input.vue';
import Button from '@core/components/Button.vue';
import DateBirthInput from '@components/DateBirthInput.vue';
import { registerSchema } from '@/schemas/user.ts';
import { PAGE_PATHS } from '@config/const.ts';
import { toTypedSchema } from '@vee-validate/zod';
import { useAuthStore } from '@stores/auth.ts';
import { useDialogStore } from '@stores/dialog.ts';
import { useNotificationStore } from '@stores/notification.ts';
import { logger } from '@core/helpers/logger.ts';
import FormGroup from '@core/components/forms/FormGroup.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const dialogStore = useDialogStore();
const router = useRouter();

const {
  handleSubmit, errors, resetForm, setFieldError,
} = useForm({
  validationSchema: toTypedSchema(registerSchema),
  validateOnMount: false,
});

const isSubmitted = ref(false);
const isLoading = ref(false);

const { value: name } = useField<string>('name');
const { value: username } = useField<string>('username');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: dob } = useField<string>('dob');

const validate = (e: Event) => {
  isSubmitted.value = true;
  logger.debug('execute validate: errors', errors.value, 'src/components/dialog/RegisterDialog.vue');
  if (Object.keys(errors.value).length === 0) {
    onSubmit(e);
  }
};

const onSubmit = handleSubmit(async (dataRegister) => {
  isLoading.value = true;
  const { data, status } = await authStore.register(dataRegister);
  isLoading.value = false;

  switch (status) {
    case StatusCodes.OK:
      router.push(PAGE_PATHS.HOME);
      closeDialog();
      break;
    case StatusCodes.CONFLICT:
      if (data?.message) {
        if (data.message.includes('username')) {
          setFieldError('username', 'Duplicate username');
        }
        if (data.message.includes('email')) {
          setFieldError('email', 'Duplicate email');
        }
        return;
      }
      break;
    default:
      notificationStore.notify({
        text: 'Something wrong',
      });
  }
});

const openLoginDialog = () => {
  if (isLoading.value) return;
  closeDialog();
  dialogStore.showDialog = 'login';
};

function closeDialog() {
  if (isLoading.value) return;
  dialogStore.close();
  resetForm();
  isSubmitted.value = false;
}

</script>

<template>
  <Dialog
    :show="dialogStore.showDialog === 'register'"
    :close="closeDialog"
    class-panel="md:min-w-[465px] md:max-w-[465px] md:mt-20"
  >
    <template #panel>
      <div class="mx-auto flex flex-col gap-8">
        <div class="flex flex-col">
          <h1 class="mb-4 text-center text-2xl text-black">
            Create account
          </h1>
          <div class="flex flex-col gap-5">
            <form
              class=""
              @submit.prevent="validate"
            >
              <FormGroup
                class="mb-4"
                label="Name"
                :error="isSubmitted ? errors.name : '' "
              >
                <Input
                  v-model="name"
                  :disabled="isLoading"
                  size="md"
                />
              </FormGroup>
              <FormGroup
                class="mb-4"
                label="Username"
                :error="isSubmitted ? errors.username : '' "
              >
                <Input
                  v-model="username"
                  :disabled="isLoading"
                  size="md"
                />
              </FormGroup>
              <FormGroup
                class="mb-4"
                label="Email"
                :error="isSubmitted ? errors.email : '' "
              >
                <Input
                  v-model="email"
                  :disabled="isLoading"
                  size="md"
                />
              </FormGroup>
              <FormGroup
                class="mb-4"
                label="Password"
                :error="isSubmitted ? errors.password : '' "
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
                :error="isSubmitted ? errors.dob : '' "
                label="Date of birth"
                description="Month, Day and Year"
              >
                <DateBirthInput
                  v-model="dob"
                  :default-value="null"
                  :disabled="isLoading"
                />
              </FormGroup>
              <Button
                :loading="isLoading"
                radius="lg"
                class="w-full"
                size="md"
                @submit.prevent="validate"
              >
                Sign Up
              </Button>
            </form>

            <div class="text-center">
              <span class="mr-1 text-zinc-500">Already have an account?</span>
              <span
                class="text-link"
                @click="openLoginDialog"
              >
                Login
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>
