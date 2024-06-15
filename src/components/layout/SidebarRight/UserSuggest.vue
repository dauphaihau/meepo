<script setup lang="ts">
import type { UserInGetList } from '@/types/user';
import UserPopper from '@components/UserPopper.vue';
import { truncateText } from '@core/helpers/common.ts';
import AvatarUser from '@components/AvatarUser.vue';
import ToggleFollowBtn from '@components/ToggleFollowBtn.vue';
import { PAGE_PATHS } from '@config/const.ts';

const props = defineProps<{ user: UserInGetList }>();

const router = useRouter();

const isHover = ref(false);
const isOpenPopover = ref(false);
const keyUserPopper = ref(0);
const isHoverFollowBtn = ref(false);

const user = ref({ ...props.user });

const redirectProfile = () => {
  router.push(`${PAGE_PATHS.USER}/${user.value.username}`);
};

const onOpenPopover = (val: boolean) => {
  isOpenPopover.value = val;
};

</script>

<template>
  <div
    class="relative"
    :class="{'z-[1]': isHover}"
    @mouseover="isHover = true"
    @mouseleave="isHover = false"
  >
    <div
      class="animate flex max-w-sm items-center justify-between px-4 py-3 hover:bg-zinc-200/50"
      :class="!isOpenPopover && 'cursor-pointer'"
      @click="!isOpenPopover && !isHoverFollowBtn && redirectProfile()"
    >
      <div class="flex items-center gap-2">
        <UserPopper
          :key="keyUserPopper"
          :username="user.username"
          class="max-h-10 min-h-10 min-w-[40px]"
          @on-open-popover="onOpenPopover"
        >
          <div class="before:absolute">
            <AvatarUser
              :avatar-url="user.avatar_url"
              :username="user.username"
            />
          </div>
        </UserPopper>

        <div>
          <UserPopper
            :key="keyUserPopper"
            :username="user.username"
            class-popover="h-5"
            @on-open-popover="onOpenPopover"
          >
            <div
              class="text-[15px] font-bold text-zinc-900 hover:underline hover:underline-offset-2"
              @click="redirectProfile"
            >
              {{ truncateText(user?.name, 17, '...') }}
            </div>
          </UserPopper>
          <UserPopper
            :key="keyUserPopper"
            :username="user.username"
            @on-open-popover="onOpenPopover"
          >
            <div
              class="-mt-3 text-[15px] font-normal text-zinc-500"
              @click="redirectProfile"
            >
              @{{ truncateText(user?.username, 17, '...') }}
            </div>
          </UserPopper>
        </div>
      </div>

      <ToggleFollowBtn
        v-model="user.is_current_user_following"
        :user-id="user.id"
        @mouseover="isHoverFollowBtn = true"
        @mouseleave="isHoverFollowBtn = false"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
