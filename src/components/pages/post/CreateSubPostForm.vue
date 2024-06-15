<script setup lang="ts">
import {
  CalendarIcon, FaceSmileIcon, GifIcon, PhotoIcon, XMarkIcon
} from '@heroicons/vue/24/outline';

import { useCreatePost } from '@/services/post';
import Button from '@/core/components/Button.vue';
import type { ICreateSubPost } from '@/types/post';
import { useUploadImage } from '@/services/common';
import { useQueryClient } from '@tanstack/vue-query';
import { StatusCodes } from 'http-status-codes';
import { useAuthStore } from '@stores/auth.ts';
import { useDialogStore } from '@stores/dialog.ts';
import { useNotificationStore } from '@stores/notification.ts';
import { logger } from '@core/helpers/logger.ts';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const content = ref('');
const fileInput = ref(null);
const isFocus = ref(false);
const whoCanComment = ref(null);
const textareaRef = ref(null);
const fileImage = ref(null);
const urlImage = ref(null);

const postId = route.params.id;

const {
  isPending: isPendingCreatePost,
  mutateAsync: createPost,
} = useCreatePost();

const {
  isPending: isPendingUploadImage,
  mutateAsync: uploadImage,
} = useUploadImage();

const dialogStore = useDialogStore();
const queryClient = useQueryClient();

const onChangeImage = ({ target }: Event) => {
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  fileImage.value = target.files[0];
  urlImage.value = URL.createObjectURL(target.files[0]);
};

const handleCreatePost = async () => {
  if (!authStore.isLoggedIn) {
    dialogStore.showDialog = 'login';
    return;
  }

  const payload: ICreateSubPost = {
    parent_id: Number(postId),
    content: content.value,
  };

  if (whoCanComment.value !== null) {
    payload.who_can_comment = whoCanComment.value;
  }

  if (fileImage.value) {
    const { data } = await uploadImage(fileImage.value);
    logger.debug('execute postAPI.uploadImage', data, 'src/components/CreatePostForm.vue');
    if (data?.url) {
      payload.image_url = data.url;
    }
    else {
      logger.error('error upload image');
      return;
    }
  }

  logger.debug('execute postAPI.create', payload, 'src/components/CreatePostForm.vue');
  const { status, data } = await createPost(payload);

  if (status === StatusCodes.CREATED) {
    if (!data.post || !data.post.id) {
      logger.error('response from postAPI.create, post id is null', 'src/components/CreatePostForm.vue');
    }

    notificationStore.notify({
      text: 'Your post was sent.',
      btnRight: {
        title: 'View',
        onClick: () => router.push({ name: 'post', params: { id: data.post.id } }),
      },
    });

    content.value = '';
    fileImage.value = null;
    urlImage.value = null;

    await nextTick(() => {
      textareaRef.value.style.height = 'auto';
    });

    await queryClient.invalidateQueries({
      queryKey: ['get-posts'],
    });
  }
};

const onFocus = () => {
  isFocus.value = true;
};

// const onFocusOut = () => {
//   isFocus.value = false;
// };

const deleteImage = () => {
  urlImage.value = null;
  fileImage.value = null;
};

watch(content, () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';

    let rangeVp = 53;
    const innerHeightViewPort = window.innerHeight * rangeVp / 100;
    if (textareaRef.value.scrollHeight > innerHeightViewPort) {
      textareaRef.value.style.height = innerHeightViewPort + 'px';
      return;
    }
    nextTick(() => {
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
    });
  }
});

</script>

<template>
  <div class="hidden md:block">
    <div
      class="flex flex-row border-t px-4 py-3"
      :class="{
        'border-b': !isFocus,
      }"
    >
      <!--         Avatar-->
      <div class="mr-4 mt-2 h-full basis-11">
        <div
          class="h-full "
        >
          <img
            v-if="authStore.user?.avatar_url"
            :src="authStore.user?.avatar_url"
            class="size-10 cursor-pointer rounded-full bg-black"
            alt="avatar"
            @click="router.push('/user/' + authStore.user?.username)"
          >
          <img
            v-else
            src="@/assets/default-avatar.png"
            class="size-10 cursor-pointer rounded-full bg-black"
            alt="avatar"
            @click="router.push('/user/' + authStore.user?.username)"
          >
        </div>
      </div>

      <!--        Input -->
      <div class="w-full">
        <div class="h-fit max-h-[81vh] w-full overflow-y-scroll">
          <div class="col-span-10 flex h-full flex-col gap-1 bg-white">
            <div class="mt-2 flex ">
              <textarea
                id="content"
                ref="textareaRef"
                v-model="content"
                name="content"
                :rows="isFocus ? 2 : 0"
                class="textarea-input "
                placeholder="Post your reply"
                maxlength="1400"
                @focus="onFocus"
              />
              <!--                    @focusout="onFocusOut"-->
              <!--                    :class="isFocus ? 'h-auto': 'h-[28px] overscroll-y-none'"-->

              <div v-if="!isFocus">
                <Button
                  classes="px-6"
                  disabled
                  @click.prevent="handleCreatePost"
                >
                  Post
                </Button>
              </div>
            </div>

            <div
              v-if="urlImage"
              class="relative mt-3"
            >
              <img
                alt="preview-img"
                :src="urlImage"
                class="h-auto w-full rounded-xl"
              >
              <div
                class="absolute right-2 top-2 w-fit rounded-full
                 bg-black p-1 opacity-70 transition duration-300 ease-out hover:opacity-50"
              >
                <XMarkIcon
                  class="size-5 cursor-pointer text-white"
                  @click="deleteImage"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--     Toolbar + submit btn     -->
    <div
      v-if="isFocus"
      class="border-b pl-[70px] pr-4"
    >
      <div
        class="mb-2 flex w-full items-center justify-between gap-x-6 pt-2"
      >
        <div class="flex-center">
          <div class="flex items-center gap-1.5">
            <!-- @vue-ignore -->
            <PhotoIcon
              class="icon-btn"
              @click="$refs.fileInput.click()"
            />
            <input
              id="file"
              ref="fileInput"
              type="file"
              name="file"
              accept="image/*"
              class="hidden"
              @change="onChangeImage"
            >

            <GifIcon
              v-tooltip="'Not available'"
              class="icon-btn"
            />
            <FaceSmileIcon
              v-tooltip="'Not available'"
              class="icon-btn"
            />
            <CalendarIcon
              v-tooltip="'Not available'"
              class="icon-btn"
            />
          </div>
        </div>

        <Button
          classes="px-6"
          :loading="isPendingUploadImage || isPendingCreatePost"
          :disabled="!content && !fileImage"
          @click.prevent="handleCreatePost"
        >
          Post
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.textarea-input {
  @apply resize-none block flex-1  bg-transparent py-1.5 pl-1 text-zinc-900 placeholder:text-zinc-500
  focus:ring-0 focus:outline-none sm:text-sm lg:text-xl sm:leading-6;
  max-height: 100%;
}

.icon-btn {
  @apply flex items-center justify-center hover:bg-zinc-100 p-2 rounded-full mx-auto h-9 w-9 text-zinc-500
  cursor-pointer transition transform duration-200 ease-in-out;
}
</style>
