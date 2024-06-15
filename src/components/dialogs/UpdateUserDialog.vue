<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import { XMarkIcon, PhotoIcon } from '@heroicons/vue/24/outline';

import Dialog from '@core/components/Dialog.vue';
import Input from '@core/components/forms/Input.vue';
import Button from '@core/components/Button.vue';
import { useUpdateProfile } from '@services/user.ts';
import { useUploadImage } from '@services/common.ts';
import DateBirthInput from '@components/DateBirthInput.vue';
import type { IRequestDataUpdateProfile, IUser } from '@/types/user.ts';
import { useDialogStore } from '@stores/dialog.ts';
import { useAuthStore } from '@stores/auth.ts';
import { useNotificationStore } from '@stores/notification.ts';
import { logger } from '@core/helpers/logger.ts';
import FormGroup from '@core/components/forms/FormGroup.vue';
import Textarea from '@core/components/forms/Textarea.vue';
import { useQueryClient } from '@tanstack/vue-query';

const { user: currentUser } = useAuthStore();
const dialogStore = useDialogStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const queryClient = useQueryClient();

const user = dialogStore.data as IUser;

const {
  mutateAsync: updateProfile,
} = useUpdateProfile(currentUser.id);

const {
  mutateAsync: uploadImage,
} = useUploadImage();

let isLoadingSubmit = $ref(false);
const name = $ref(user?.name ?? '');
const bio = $ref(user?.bio ?? '');
const location = $ref(user?.location ?? '');
const website = $ref(user?.website ?? '');
const dob = $ref(user?.dob);
let fileImage = $ref<File | null>(null);
let urlImage = $ref(user?.avatar_url);

const onChangeImage = ({ target }: Event) => {
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  fileImage = target.files[0];
  urlImage = URL.createObjectURL(target.files[0]);
};

const onSubmit = async () => {
  const payload: IRequestDataUpdateProfile = {
    name,
    bio,
    location,
    website,
  };

  if (typeof dob === 'string') {
    payload.dob = dob;
  }

  isLoadingSubmit = true;

  if (fileImage) {
    const url = await handleUploadImage();
    if (url) payload.avatar_url = url;
  }

  const { status, data } = await updateProfile(payload);
  isLoadingSubmit = false;

  switch (status) {
    case StatusCodes.OK:
      closeDialog();
      authStore.user = data.user;
      notificationStore.notify({
        text: 'Your profile was updated',
      });
      if (payload?.name || payload?.avatar_url) {
        await queryClient.invalidateQueries({
          queryKey: ['get-posts'],
        });
      }
      break;
    default:
      notificationStore.notify({
        text: 'Something wrong',
      });
  }
};

const handleUploadImage = async (): Promise<string | undefined> => {
  const { data } = await uploadImage(fileImage);
  logger.debug('execute handleUploadImage', data, 'src/components/dialogs/UpdateUserDialog.vue');
  if (data?.url) {
    return data.url;
  }
  logger.error('error upload image', 'src/components/dialogs/UpdateUserDialog.vue');
};

function closeDialog() {
  dialogStore.close();
}

</script>

<template>
  <Dialog
    :show="dialogStore.showDialog === 'update-profile'"
    :close="closeDialog"
    class-panel="
        md:min-w-[600px] md:max-w-[600px]
        md:min-h-[930px] md:max-h-[930px]
        relative overflow-hidden
        p-0 mt-0 md:mt-5
      "
  >
    <template #panel>
      <!--              Header ( Actions )-->
      <div class="absolute left-0 top-0 z-20 flex h-[53px] w-full items-center bg-white px-4">
        <div class="w-20 flex-initial">
          <XMarkIcon
            class="size-9 cursor-pointer rounded-full p-2 text-black hover:bg-zinc-100"
            @click="closeDialog"
          />
        </div>
        <h1 class="w-[29rem] flex-initial text-[15px]  font-semibold text-black md:text-[20px]">
          Edit Profile
        </h1>
        <Button
          classes="h-[32px]"
          :loading="isLoadingSubmit"
          :disabled="!name"
          @click="onSubmit"
        >
          Save
        </Button>
      </div>

      <div class="mx-auto mt-12 flex flex-col pb-8">
        <!--                Background-->
        <div class="mx-0.5 mt-1 h-32 bg-zinc-300 md:h-[198px]">
          <input
            id="file"
            type="file"
            name="file"
            accept="image/*"
            class="invisible md:h-[198px]"
          >
        </div>
        <div class="-mt-12 flex flex-col gap-5 px-6">
          <div class="flex flex-col gap-5">
            <!-- Avatar-->
            <div class="relative mb-2 max-h-[81.5px] max-w-[81.5px] rounded-full ring-[5px] ring-white md:max-h-[112px] md:max-w-[112px]">
              <img
                v-if="urlImage"
                alt="preview-img"
                :src="urlImage"
                class="avatar"
              >
              <img
                v-else
                alt="preview-img"
                src="@/assets/default-avatar.png"
                class="avatar"
              >
              <input
                id="file"
                ref="imageInput"
                type="file"
                name="file"
                :disabled="isLoadingSubmit"
                accept="image/*"
                class="hidden"
                @change="onChangeImage"
              >

              <!-- @vue-ignore -->
              <div
                class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black p-2 opacity-60"
                @click="$refs.imageInput.click()"
              >
                <PhotoIcon class="size-5 text-white" />
              </div>
            </div>

            <!-- Info profile -->
            <form
              class="space-y-5"
              @keyup.enter.prevent="onSubmit"
            >
              <FormGroup label="Name">
                <Input
                  v-model="name"
                  :disabled="isLoadingSubmit"
                  size="md"
                />
              </FormGroup>

              <FormGroup
                label="Bio"
                :help="`${bio.length}/160`"
              >
                <Textarea
                  v-model="bio"
                  maxlength="160"
                  :disabled="isLoadingSubmit"
                />
              </FormGroup>

              <FormGroup
                class="mb-6"
                label="Date of birth"
                description="Month, Day and Year"
              >
                <DateBirthInput
                  v-model="dob"
                  :disabled="isLoadingSubmit"
                />
              </FormGroup>
              <FormGroup
                label="Location"
              >
                <Input
                  v-model="location"
                  :disabled="isLoadingSubmit"
                  size="md"
                />
              </FormGroup>
              <FormGroup
                label="Website"
              >
                <Input
                  v-model="website"
                  :disabled="isLoadingSubmit"
                  size="md"
                />
              </FormGroup>
            </form>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>

.avatar {
  @apply rounded-full h-[81.5px] w-[81.5px] md:h-[112px] md:w-[112px];
}

</style>
