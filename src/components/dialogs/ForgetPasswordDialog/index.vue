<script setup lang="ts">
import Dialog from '@core/components/Dialog.vue';
import RequestInfoUser from '@components/dialogs/ForgetPasswordDialog/RequestInfoUser.vue';
import VerifyCode from '@components/dialogs/ForgetPasswordDialog/VerifyCode.vue';
import ResetPassword from '@components/dialogs/ForgetPasswordDialog/ResetPassword.vue';
import Success from '@components/dialogs/ForgetPasswordDialog/Success.vue';
import { useDialogStore } from '@stores/dialog.ts';

const dialogStore = useDialogStore();

const token = ref('');
const currentStep = ref(0);

const openLoginDialog = () => {
  dialogStore.showDialog = 'login';
};

function closeDialog() {
  dialogStore.close();
}

function changeStep(value: string) {
  if (value) {
    token.value = value;
  }
  currentStep.value++;
}

watch(() => dialogStore.showDialog, (value) => {
  if (!value) {
    currentStep.value = 0;
  }
});

</script>

<template>
  <Dialog
    :show="dialogStore.showDialog === 'forgot-password'"
    :close="closeDialog"
    class-panel="md:max-w-[480px] md:mt-20 transform bg-white py-6 px-10 flex flex-col justify-center"
  >
    <template #panel>
      <div class="flex flex-col bg-white">
        <RequestInfoUser
          v-if="currentStep === 0"
          @change-step="changeStep"
        />
        <VerifyCode
          v-if="currentStep === 1"
          @change-step="changeStep"
        />
        <ResetPassword
          v-if="currentStep === 2"
          :token="token"
          @change-step="changeStep"
        />
        <Success
          v-if="currentStep === 3"
          @close-dialog="closeDialog"
        />

        <div
          v-if="currentStep === 0"
          class="mt-4 text-center"
        >
          <span class="mr-1 text-zinc-500">Already have an account?</span>
          <span
            class="text-link"
            @click="openLoginDialog"
          >
            Login
          </span>
        </div>
      </div>
    </template>
  </Dialog>
</template>
