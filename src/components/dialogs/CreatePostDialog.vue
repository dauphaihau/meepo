<script setup lang="ts">
import {
  CalendarIcon, FaceSmileIcon, GifIcon, PhotoIcon, XMarkIcon
} from '@heroicons/vue/24/outline';
import { useMediaQuery } from '@vueuse/core';
import { StatusCodes } from 'http-status-codes';
import { useQueryClient } from '@tanstack/vue-query';

import Dialog from '@core/components/Dialog.vue';
import Button from '@core/components/Button.vue';
import { useCreatePost } from '@services/post.ts';
import type { ICreatePost } from '@/types/post.ts';
import { useUploadImage } from '@services/common.ts';
import { useAuthStore } from '@stores/auth.ts';
import { useDialogStore } from '@stores/dialog.ts';
import { useNotificationStore } from '@stores/notification.ts';
import type { IOptionSelectWhoCanReply } from '@components/SelectWhoCanReply.vue';
import SelectWhoCanReply from '@components/SelectWhoCanReply.vue';
import { POST_WHO_CAN_REPLY } from '@config/post.ts';
import { logger } from '@core/helpers/logger.ts';

const queryClient = useQueryClient();
const dialogStore = useDialogStore();
const { user } = storeToRefs(useAuthStore());
const isTabletScreen = useMediaQuery('(min-width: 768px)');
const router = useRouter();
const notificationStore = useNotificationStore();

const {
  isPending: isPendingCreatePost,
  mutateAsync: createPost,
} = useCreatePost();

const {
  isPending: isPendingUploadImage,
  mutateAsync: uploadImage,
} = useUploadImage();

const textareaRef = ref(null);
const fileImage = ref(null);
const urlImage = ref(null);
const content = ref();
const whoCanReply = ref(POST_WHO_CAN_REPLY.EVERYONE);

const onSubmit = async () => {
  const payload: ICreatePost = {
    content: content.value,
    image_url: urlImage.value,
    who_can_comment: whoCanReply.value,
  };

  if (fileImage.value) {
    const url = await handleUploadImage();
    if (url) payload.image_url = url;
  }

  logger.debug('execute postAPI.update', payload, 'src/components/dialog/CreatePostDialog.vue');

  const { status, data } = await createPost(payload);

  if (status === StatusCodes.CREATED) {
    notificationStore.notify({
      text: 'Your post was sent.',
      btnRight: {
        title: 'View',
        onClick: () => router.push({ name: 'post', params: { id: data.post.id } }),
      },
    });
    await queryClient.invalidateQueries({
      queryKey: ['get-posts'],
    });
    queryClient.removeQueries({
      queryKey: ['get-posts'],
    });
    queryClient.removeQueries({
      queryKey: ['detail-post'],
    });
    closeDialog();
  }
  else {
    notificationStore.notify({
      text: 'Something wrong',
    });
  }
};

const handleUploadImage = async (): Promise<string | undefined> => {
  const { data } = await uploadImage(fileImage.value);
  logger.debug('execute postAPI.uploadImage', data, 'src/components/ReplyPostDialog.vue');
  if (data?.url) {
    return data.url;
  }
  logger.error('error upload image');
};

const deleteImage = () => {
  if (isPendingCreatePost.value) {
    return;
  }
  urlImage.value = null;
  fileImage.value = null;
};

const onChangeImage = ({ target }: Event) => {
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  fileImage.value = target.files[0];
  urlImage.value = URL.createObjectURL(target.files[0]);
};

const onChangeSelectWhoCanReply = (val: IOptionSelectWhoCanReply) => {
  whoCanReply.value = val.value;
};

function closeDialog() {
  if (isPendingCreatePost.value) {
    return;
  }
  dialogStore.close();
  fileImage.value = null;
  content.value = '';
  urlImage.value = null;
}

function calcHeightTextarea() {
  if (textareaRef.value && textareaRef?.value) {
    textareaRef.value.style.height = 'auto';

    let rangeVp: number;
    if (!isTabletScreen) {
      rangeVp = 70;
    }
    else {
      rangeVp = 30;
    }
    const innerHeightViewPort = window.innerHeight * rangeVp / 100;

    nextTick(() => {
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
      if (textareaRef.value.scrollHeight > innerHeightViewPort) {
        textareaRef.value.style.height = innerHeightViewPort + 'px';
        return;
      }
    });
  }
}

watch(content, () => {
  calcHeightTextarea();
});

</script>

<template>
  <div>
    <textarea
      ref="textareaRef"
      v-model="content"
      :disabled="isPendingCreatePost"
      class="hidden"
    />

    <Dialog
      :show="dialogStore.showDialog === 'create-post'"
      :close="closeDialog"
      title="Create Post"
      class-panel="
      min-h-screen md:min-h-0 max-h-[90vh]
      md:min-w-[600px] md:max-w-[600px]
      md:mt-12 align-middle px-4 py-2"
    >
      <template #panel>
        <div class="mt-12">
          <div class="flex h-full flex-row">
            <!--         Avatar-->
            <div class="mr-4 mt-2 h-full min-w-[40px] basis-11">
              <div class="mt-[5px] h-full">
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  class="size-10 cursor-pointer rounded-full bg-black"
                  alt="avatar"
                  @click="router.push('/user/' + user.username)"
                >
                <img
                  v-else
                  src="@/assets/default-avatar.png"
                  class="size-10 cursor-pointer rounded-full bg-black"
                  alt="avatar"
                  @click="router.push('/user/' + user.username)"
                >
              </div>
            </div>

            <!--        Input -->
            <div class="w-full overflow-y-scroll md:max-h-[71vh] md:min-h-[10vh]">
              <textarea
                id="content"
                ref="textareaRef"
                v-model="content"
                name="content"
                class="textarea-input"
                placeholder="Write your content"
                maxlength="1400"
              />

              <div
                v-if="urlImage"
                class="relative mb-1 mt-3"
              >
                <img
                  alt="preview-img"
                  :src="urlImage"
                  class="h-auto w-full rounded-xl"
                >
                <div
                  class="absolute right-2 top-2 z-[1] w-fit
                 rounded-full bg-black p-1 opacity-70 transition duration-300 ease-out hover:opacity-60"
                >
                  <XMarkIcon
                    class="size-5 cursor-pointer text-white"
                    @click="deleteImage"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="hidden h-[100px] md:block" />

          <div class="absolute bottom-2 left-0 z-[1] w-full rounded-2xl bg-white px-4 pt-1">
            <SelectWhoCanReply
              :default-value="whoCanReply"
              @update:model-value="onChangeSelectWhoCanReply"
            />
            <div class="mb-2 mt-4 border-b" />
            <!--     Toolbar input     -->
            <div class="flex w-full items-center justify-between gap-x-6">
              <div class="flex items-center gap-1.5">
                <!-- @vue-ignore -->
                <PhotoIcon
                  class="icon-btn"
                  @click="$refs.file.click()"
                />
                <input
                  id="file"
                  ref="file"
                  :disabled="isPendingCreatePost"
                  type="file"
                  name="file"
                  accept="image/*"
                  class="hidden"
                  @change="onChangeImage"
                >

                <GifIcon class="icon-btn" />
                <FaceSmileIcon class="icon-btn" />
                <CalendarIcon class="icon-btn" />
              </div>
              <Button
                :loading="isPendingUploadImage || isPendingCreatePost"
                :disabled="!content"
                class="button"
                @click="onSubmit"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>

.textarea-input {
  @apply w-full resize-none block flex-1 bg-transparent
  py-1.5 pl-1
  text-zinc-900 placeholder:text-zinc-500 sm:text-sm lg:text-xl
  focus:ring-0 focus:outline-none sm:leading-6;
  max-height: 100%;
}

.icon-btn {
  @apply flex items-center justify-center hover:bg-zinc-100 p-2 rounded-full mx-auto h-9 w-9 text-zinc-500 cursor-pointer
}

</style>
