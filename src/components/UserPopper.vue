<script setup lang="ts">
import type { Fn } from '@vueuse/core';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';

import Loading from '@core/components/Loading.vue';
import type { IResponseGetProfile, IUser } from '@/types/user';
import { useMutationGetProfileUser } from '@services/user';
import ToggleFollowBtn from '@components/ToggleFollowBtn.vue';
import { PAGE_PATHS } from '@config/const.ts';
import AvatarUser from '@components/AvatarUser.vue';
import { useAuthStore } from '@stores/auth.ts';

const router = useRouter();
const popoverHover = ref(false);
const popoverTimeout = ref();

interface IProps {
  username: IUser['username']
  classPopover?: string
}

let { username, classPopover } = defineProps<IProps>();

const emit = defineEmits<{
  (e: 'onOpenPopover', value: boolean)
}>();

const authStore = useAuthStore();

const user = ref<IResponseGetProfile['user'] | null>(null);

const {
  isPending: isPendingGetProfileUser,
  mutateAsync: getProfileUser,
} = useMutationGetProfileUser(username);

const hoverPopover = (e: Event, open: boolean): void => {
  const target = e.target as Element;
  popoverHover.value = true;

  if (popoverTimeout.value) {
    clearTimeout(popoverTimeout.value);
  }
  popoverTimeout.value = setTimeout(async () => {
    if (!open && !isPendingGetProfileUser.value) {
      const parentNode = target.parentNode as HTMLElement;
      parentNode.click(); // click show popper
      const data = await getProfileUser();
      if (data.user) {
        user.value = data.user;
      }
    }
  }, 500);
};

const closePopover = (close: Fn): void => {
  popoverHover.value = false;

  if (popoverTimeout.value) {
    clearTimeout(popoverTimeout.value);
  }
  popoverTimeout.value = setTimeout(() => {
    if (!popoverHover.value) {
      close();
    }
  }, 300);
};

function onUnOrFollowSuccess() {
  if (user.value.is_current_user_following) {
    user.value.followers_count++;
  }
  else user.value.followers_count--;
}

function redirectFollowPage(name: string) {
  router.push({
    name,
    params: { username: user.value.username },
  });
}

function redirectProfilePage() {
  router.push(`${PAGE_PATHS.USER}/${user.value?.username}`);
}

watch(popoverHover, (value: boolean) => {
  emit('onOpenPopover', value);
});

</script>

<template>
  <div>
    <div class="md:hidden">
      <slot />
    </div>

    <div class="hidden md:block">
      <Popover
        v-slot="{ open, close }"
        class="relative"
        :class="classPopover"
      >
        <PopoverButton
          :class="open ? '' : 'text-opacity-90'"
          class="inline-flex items-center focus:outline-none"
          @mouseover="(e: Event) => hoverPopover(e, open)"
          @mouseleave="closePopover(close)"
        >
          <slot />
        </PopoverButton>

        <transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-350 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-1 opacity-0"
        >
          <PopoverPanel
            class="absolute z-[3] mt-0.5 w-10 -translate-x-28
             rounded-xl bg-white px-4 sm:px-0 lg:max-w-3xl"
            @mouseover.prevent="popoverHover = true"
            @mouseleave.prevent="closePopover(close)"
          >
            <div
              class="popper-shadow w-[300px] max-w-[300px] overflow-hidden
                     rounded-xl bg-white p-4 ring-1 ring-black/5"
            >
              <div
                v-if="isPendingGetProfileUser"
                class="flex-center h-32"
              >
                <Loading
                  variant="secondary"
                  classes="h-5 w-5"
                />
              </div>
              <div v-else>
                <div v-if="user">
                  <div class="mb-2 flex justify-between">
                    <AvatarUser
                      class="!h-16 !w-16"
                      :avatar-url="user?.avatar_url"
                      @click="redirectProfilePage"
                    />
                    <ToggleFollowBtn
                      v-if="authStore.user?.id !== user?.id"
                      v-model="user.is_current_user_following"
                      :user-id="user?.id"
                      @on-un-or-follow-success="onUnOrFollowSuccess"
                    />
                  </div>

                  <div
                    class="animate cursor-pointer text-[15px] font-bold text-black hover:underline hover:underline-offset-2"
                    @click="redirectProfilePage"
                  >
                    {{ user?.name }}
                  </div>
                  <div
                    class="mb-2 w-fit cursor-pointer text-[15px] text-zinc-500"
                    @click="redirectProfilePage"
                  >
                    @{{
                      user?.username
                    }}
                  </div>
                  <p class="mb-2 text-[15px] font-normal text-zinc-700 dark:text-zinc-400">
                    {{ user?.bio }}
                  </p>
                  <div>
                    <div class="flex gap-4">
                      <div
                        class="flex cursor-pointer items-center gap-1 hover:underline hover:underline-offset-2"
                        @click="redirectFollowPage('followers')"
                      >
                        <span class="text-[14px] font-bold text-black">{{ user?.followers_count ?? 0 }}</span>
                        <span class="text-[14px] text-zinc-500">Follower</span>
                      </div>

                      <div
                        class="flex cursor-pointer items-center gap-1 hover:underline hover:underline-offset-2"
                        @click="redirectFollowPage('following')"
                      >
                        <span class="text-[14px] font-bold text-black">{{ user?.followed_count ?? 0 }}</span>
                        <span class="text-[14px] text-zinc-500">Following</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PopoverPanel>
        </transition>
      </Popover>
    </div>
  </div>
</template>

<style scoped>

.popper-shadow {
  box-shadow: rgba(101, 119, 134, 0.3) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px;
}
</style>
