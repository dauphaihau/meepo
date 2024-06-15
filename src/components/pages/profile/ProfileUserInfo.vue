<script setup lang="ts">
import dayjs from 'dayjs';
import {
  CakeIcon, CalendarDaysIcon, EnvelopeIcon, LinkIcon, MapPinIcon
} from '@heroicons/vue/24/outline';
import { useMediaQuery } from '@vueuse/core';
import { useQueryClient } from '@tanstack/vue-query';

import {
  useGetProfileUser, useGetStateUnOrFollowUser, useGetStateUpdateProfile
} from '@services/user';
import type { IResponseGetProfile } from '@/types/user';
import Link from '@/core/components/Link.vue';
import { formatTextWithHashTags, truncateText } from '@core/helpers/common.ts';
import { useChatStore } from '@stores/chat.ts';
import { PAGE_PATHS } from '@config/const.ts';
import { useAuthStore } from '@stores/auth.ts';
import Button from '@core/components/Button.vue';
import { useDialogStore } from '@stores/dialog.ts';
import ToggleFollowBtn from '@components/ToggleFollowBtn.vue';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const minTabletScreen = useMediaQuery('(min-width: 768px)');

const authStore = useAuthStore();
const chatStore = useChatStore();
const dialogStore = useDialogStore();

const currentRouteUsername = route.params.username as string;

const {
  data: dataGetProfileUser,
} = useGetProfileUser(currentRouteUsername);

const dataUpdatedProfile = useGetStateUpdateProfile(authStore.user.id);

const dataUpdatedFollow = useGetStateUnOrFollowUser();

const userProfile = ref<IResponseGetProfile['user']>({ ...dataGetProfileUser.value?.user });

const userProfileWebsite = computed(() => {
  return userProfile.value.website &&
    userProfile.value.website.includes('http') ?
    new URL(userProfile.value.website).host :
    userProfile.value.website;
});

const userProfileDateJoin = computed(() => {
  return dayjs(userProfile.value.created_at).format('MMMM YYYY');
});

watch(dataUpdatedProfile, () => {
  const lastUserUpdate = dataUpdatedProfile.value[dataUpdatedProfile.value.length - 1];
  if (lastUserUpdate) {
    userProfile.value = { ...userProfile.value, ...lastUserUpdate };
  }
});

watch(dataUpdatedFollow, () => {
  const lastUserUpdate = dataUpdatedFollow.value[dataUpdatedFollow.value.length - 1];
  if (lastUserUpdate && authStore.user.username === currentRouteUsername) {
    if (lastUserUpdate.includes('unfollow')) {
      userProfile.value.followed_count--;
    }
    else if (lastUserUpdate.includes('follow')) {
      userProfile.value.followed_count++;
    }
  }
});

function onUnOrFollowSuccess() {
  if (userProfile.value.is_current_user_following) {
    userProfile.value.followers_count++;
  }
  else userProfile.value.followers_count--;

  queryClient.removeQueries({
    queryKey: ['get-profile-user', currentRouteUsername],
  });
}

function redirectFollowPage(path: PAGE_PATHS.FOLLOWING | PAGE_PATHS.FOLLOWERS) {
  router.push(`${PAGE_PATHS.USER}/${currentRouteUsername}${path}`);
}

function onClickMessage() {
  if (!authStore.isLoggedIn) {
    dialogStore.showDialog = 'login';
    return;
  }

  if (!minTabletScreen.value) {
    chatStore.messageToUser({
      username: userProfile.value.username,
      name: userProfile.value.name,
      avatar_url: userProfile.value.avatar_url,
    });
    router.push(PAGE_PATHS.ROOMS);
    return;
  }

  chatStore.messageToUser({
    username: userProfile.value.username,
    name: userProfile.value.name,
  });
}

const showUpdateProfileDialog = () => {
  dialogStore.showDialog = 'update-profile';
  dialogStore.data = userProfile.value;
};

</script>

<template>
  <div v-if="userProfile">
    <!--    Background-->
    <div class="h-32 bg-zinc-300 md:h-[198px]">
      <input
        id="file"
        type="file"
        name="file"
        class="invisible h-32 md:h-[198px]"
      >
    </div>

    <div class="-mt-10 px-4 md:-mt-20">
      <div class="flex items-center justify-between">
        <!-- Avatar -->
        <div class="mb-4 rounded-full bg-white ring-4 ring-white">
          <img
            v-if="userProfile?.avatar_url"
            alt="avatar"
            :src="userProfile?.avatar_url"
            class="avatar"
          >
          <img
            v-else
            alt="avatar"
            src="@/assets/default-avatar.png"
            class="avatar"
          >
        </div>

        <div class="pt-10 md:pt-16">
          <!-- Message, Un/Follow user -->
          <div>
            <div
              v-if="userProfile?.username !== authStore.user?.username"
              class="flex items-center gap-2"
            >
              <div class="flex-center rounded-full border border-zinc-300 p-1.5">
                <EnvelopeIcon
                  v-tooltip="'Message'"
                  class="size-[21px] cursor-pointer"
                  aria-hidden="true"
                  @click="onClickMessage"
                />
              </div>

              <ToggleFollowBtn
                v-model="userProfile.is_current_user_following"
                :user-id="userProfile.id"
                @on-un-or-follow-success="onUnOrFollowSuccess"
              />
            </div>
          </div>

          <Button
            v-if="authStore.user?.username === userProfile?.username"
            variant="secondary"
            @click="showUpdateProfileDialog"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div class="mb-4 flex items-center justify-between sm:px-0">
        <div class="w-full space-y-3">
          <!-- name, username -->
          <div class="flex justify-between">
            <div>
              <h3 class="text-[20px] font-bold  text-zinc-900">
                {{ truncateText(userProfile?.name, 20, '...') }}
              </h3>
              <p class="max-w-2xl text-sm text-zinc-500">
                @{{ truncateText(userProfile?.username, 20, '...') }}
              </p>
            </div>
          </div>

          <p
            v-if="userProfile?.bio"
            v-html="formatTextWithHashTags(userProfile.bio)"
          />

          <!-- location, dob, website, date join -->
          <div class="flex flex-wrap items-center gap-4">
            <div
              v-if="userProfile?.location"
              class="flex items-center gap-1"
            >
              <MapPinIcon
                class="size-5 text-[15px] text-zinc-500"
                aria-hidden="true"
              />
              <div class="text-[15px] text-zinc-500">
                {{ userProfile.location }}
              </div>
            </div>

            <div
              v-if="userProfile?.dob"
              class="flex items-center gap-1"
            >
              <CakeIcon
                class="size-5 text-[15px] text-zinc-500"
                aria-hidden="true"
              />
              <div class="text-[15px] text-zinc-500">
                Born {{ dayjs(userProfile.dob).format('MMMM DD, YYYY') }}
              </div>
            </div>

            <div
              v-if="userProfile?.website"
              class="flex items-center gap-1"
            >
              <LinkIcon
                class="size-5 text-[15px] text-zinc-500"
                aria-hidden="true"
              />
              <Link
                :to="userProfile?.website.includes('http') ? userProfile?.website : `https://${userProfileWebsite}`"
                class=" text-[15px] font-normal text-[#4a99e9] hover:underline hover:underline-offset-2"
              >
                {{ userProfileWebsite }}
              </Link>
            </div>

            <div
              v-if="userProfile?.created_at"
              class="flex items-center gap-1"
            >
              <CalendarDaysIcon
                class="size-5 text-[15px] text-zinc-500"
                aria-hidden="true"
              />
              <div class="text-[15px] text-zinc-500">
                Joined {{ userProfileDateJoin }}
              </div>
            </div>
          </div>

          <!--  following, follow -->
          <div class="flex gap-4 ">
            <div
              class="flex cursor-pointer items-center gap-1 hover:underline hover:underline-offset-2"
              @click="redirectFollowPage(PAGE_PATHS.FOLLOWERS)"
            >
              <span class="text-sm font-bold">{{ userProfile?.followers_count }}</span>
              <span class="text-sm text-zinc-500">Follower</span>
            </div>

            <div
              class="flex cursor-pointer items-center gap-1 hover:underline hover:underline-offset-2"
              @click="redirectFollowPage(PAGE_PATHS.FOLLOWING)"
            >
              <span class="text-sm font-bold">{{ userProfile?.followed_count }}</span>
              <span class="text-sm text-zinc-500">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.avatar {
  @apply rounded-full h-[81.5px] w-[81.5px] md:h-[133.5px] md:w-[133.5px];
}

</style>
