<script setup lang="ts">
import { useGetUsers } from '@services/user';
import type { IParamsGetUsers, UserInGetList } from '@/types/user';
import UserSuggest from '@components/layout/SidebarRight/UserSuggest.vue';
import Loading from '@core/components/Loading.vue';
import { useAuthStore } from '@stores/auth.ts';
import { USER_FILTER_BY } from '@config/const.ts';

const authStore = useAuthStore();

const params = computed(() => {
  const base: IParamsGetUsers = {
    page: 1,
    by: USER_FILTER_BY.DEFAULT,
    limit: 10,
  };
  if (authStore.isLoggedIn) {
    base.by = USER_FILTER_BY.UNFOLLOW_CURRENT_USER;
  }
  return base;
});

const {
  data: dataGetUsers,
  isPending: isPendingGetUsers,
} = useGetUsers(params.value);

const users = computed<UserInGetList[]>(() => {
  if (dataGetUsers.value?.pages && dataGetUsers.value.pages?.length > 0) {
    if (params.value.by === USER_FILTER_BY.DEFAULT) {
      return dataGetUsers.value.pages[0].users.map(user => ({ ...user, is_current_user_following: false }));
    }
    return dataGetUsers.value.pages[0].users;
  }
  return [];
});

</script>

<template>
  <div class="wrapper">
    <h2 class="title">
      You might like
    </h2>

    <div
      v-if="isPendingGetUsers"
      class="flex-center min-h-[35vh]"
    >
      <Loading
        variant="secondary"
        classes="h-7 w-7"
      />
    </div>
    <div v-else>
      <div
        v-if="users && users?.length > 0"
        class="mt-4 flex flex-col"
      >
        <div
          v-for="(user) in users"
          :key="user.id"
        >
          <UserSuggest :user="user" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.wrapper {
  @apply bg-zinc-100 rounded-2xl py-3 w-[348px];
}

.title {
  @apply text-[20px] font-bold px-4;
}

</style>
