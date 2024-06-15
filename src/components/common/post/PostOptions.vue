<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
import { useMutationState, useQueryClient } from '@tanstack/vue-query';
import {
  Menu, MenuButton, MenuItem, MenuItems
} from '@headlessui/vue';
import {
  CheckIcon, EllipsisHorizontalIcon, PencilIcon, StarIcon, TrashIcon
} from '@heroicons/vue/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/vue/20/solid';

import { useDeletePost, useUpdatePost } from '@services/post.ts';
import type { IPost, IResponseGetPost, IUpdatePost } from '@/types/post.ts';
import { POST_CONFIG, POST_PIN_STATUS } from '@config/post.ts';
import { useNotificationStore } from '@stores/notification.ts';
import { useDialogStore } from '@stores/dialog.ts';
import type { AxiosResponse } from 'axios';

interface Props {
  dataPost: IResponseGetPost
  classDotIcon?: string
}

const dialogStore = useDialogStore();
const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const currentRouteName = route.name;
const postId = route.params.id;

const { dataPost, classDotIcon } = defineProps<Props>();

const menuItemsRef = ref(null);
const confirmDelete = ref(false);
const pinStatus = ref(dataPost.pin_status_int);
const editedPostCount = ref(dataPost?.edited_posts_count);

const showEditBtn = computed(() => {
  if (dayjs(dataPost?.created_at).isValid() && Number.isInteger(editedPostCount.value)) {
    const isExpiresEdit = dayjs()
      .isAfter(dayjs(dataPost.created_at)
        .add(POST_CONFIG.HOUR_EXPIRES_EDIT, 'h'));
    return !isExpiresEdit && editedPostCount.value < POST_CONFIG.MAX_EDIT_POST;
  }
  return false;
});

const queryClient = useQueryClient();

const dataUpdatedPost = useMutationState({
  filters: {
    mutationKey: ['update-post'],
  },
  select: (mutation) => {
    return (mutation.state.data as AxiosResponse<{ post: IPost }>)?.data?.post;
  },
});

watch(dataUpdatedPost, () => {
  const lastPostUpdate = dataUpdatedPost.value[dataUpdatedPost.value.length - 1];
  if (Number.isInteger(lastPostUpdate?.edited_posts_count)) {
    editedPostCount.value = lastPostUpdate.edited_posts_count + 1;
  }
});

const {
  mutateAsync: deletePost,
} = useDeletePost(dataPost.id);

const {
  mutateAsync: updatePost,
} = useUpdatePost();

watch(menuItemsRef, () => {
  confirmDelete.value = false;
});

const handleDeletePost = async () => {
  const { status } = await deletePost();
  if (status === StatusCodes.OK) {
    notificationStore.notify({
      text: 'Your post was deleted',
    });

    if (
      (currentRouteName === 'post' && dataPost.id === Number(postId)) ||
      currentRouteName === 'history'
    ) {
      await router.push('/');
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ['get-posts'],
    });

    if (currentRouteName === 'post') {
      await queryClient.invalidateQueries({
        queryKey: ['detail-post', Number(postId)],
      });
    }
  }
};

const handlePinPost = async () => {
  const payload: IUpdatePost = {
    id: dataPost.id,
    pin_status: pinStatus.value === POST_PIN_STATUS.PIN ? POST_PIN_STATUS.UNPIN : POST_PIN_STATUS.PIN,
  };
  const { status } = await updatePost(payload);
  if (status === StatusCodes.OK) {
    notificationStore.notify({
      text: `Your post was ${payload.pin_status === POST_PIN_STATUS.PIN ? 'pinned' : 'unpinned'} to your profile.`,
    });
    pinStatus.value = payload.pin_status;
    if (currentRouteName === 'profile') {
      await queryClient.invalidateQueries({
        queryKey: ['get-posts'],
      });
    }
  }
};

const handleShowUpdatePost = () => {
  dialogStore.showDialog = 'update-post';
  dialogStore.data = dataPost;
};

</script>

<template>
  <Menu
    v-slot="{open}"
    as="div"
    class="relative inline-block h-5 text-left"
  >
    <MenuButton>
      <EllipsisHorizontalIcon
        :class="classDotIcon"
        class="flex size-5 cursor-pointer items-center justify-center rounded-full
         text-zinc-500 hover:bg-zinc-200"
      />
    </MenuButton>

    <div
      v-if="open"
      class="fixed inset-0"
    />

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems class="menu-items">
        <div ref="menuItemsRef">
          <span
            v-if="!confirmDelete"
            class="menu-item rounded-t-xl text-zinc-900 hover:bg-zinc-100"
            @click="confirmDelete = true"
          >
            <TrashIcon class="icon" />
            Delete
          </span>

          <MenuItem
            v-else
            v-slot="{ active }"
          >
            <span
              :class="['menu-item', active ? 'active rounded-t-xl text-red-400' : 'text-red-400']"
              @click="handleDeletePost"
            >
              <CheckIcon class="icon" />
              Confirm
            </span>
          </MenuItem>

          <MenuItem
            v-if="showEditBtn"
            v-slot="{ active }"
            as="div"
          >
            <span
              :class="['menu-item', active ? 'active' : 'inactive']"
              @click="handleShowUpdatePost"
            >
              <PencilIcon class="icon" />
              Edit
            </span>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <span
              :class="['menu-item', active ? 'active rounded-b-xl' : 'inactive']"
              @click="handlePinPost"
            >
              <SolidStarIcon
                v-if="pinStatus === POST_PIN_STATUS.PIN"
                class="icon"
              />
              <StarIcon
                v-else
                class="icon"
              />
              {{ pinStatus === POST_PIN_STATUS.PIN ? 'Unpin from profile' : 'Pin to your profile' }}
            </span>
          </MenuItem>

          <!--          <MenuItem v-slot="{ active }">-->
          <!--            <span-->
          <!--                :class="['menu-item', active ? 'active rounded-bl-md rounded-br-md' : 'inactive']"-->
          <!--            >Change who can reply</span>-->
          <!--          </MenuItem>-->
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<style scoped>

.menu-items {
  @apply absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl
  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none;
}

.menu-item {
  @apply px-4 py-2 text-sm cursor-pointer flex items-center gap-2;
}

.icon {
  @apply w-4 stroke-[2];
}

.active {
  @apply bg-zinc-100 ;
}

.inactive {
  @apply text-zinc-700;
}

</style>
