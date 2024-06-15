<script setup lang="ts">
import type { IParamsGetUsers } from '@/types/user.ts';
import HeaderMainContent from '@components/layout/HeaderMainContent.vue';
import Loading from '@core/components/Loading.vue';
import TabsMainContent from '@components/layout/TabsMainContent.vue';
import { PAGE_PATHS, USER_FILTER_BY } from '@config/const.ts';
import { useGetUsers } from '@services/user.ts';
import FollowUser from '@components/pages/follow/FollowUser.vue';

const router = useRouter();
const route = useRoute();

const currentRouteUsername = route.params.username as string;
const currentRouteName = route.name as string;

const tabs = [
  { name: 'Followers', id: 'followers' },
  { name: 'Following', id: 'following' },
];

const limit = 20;

const params = computed(() => {
  const base: IParamsGetUsers = {
    page: 1,
    by: currentRouteName === 'following' ? USER_FILTER_BY.FOLLOWING_BY_USERNAME : USER_FILTER_BY.FOLLOWERS_BY_USERNAME,
    limit,
    username: currentRouteUsername,
    include: 'user',
  };
  return base;
});

const {
  data: dataGetUsers,
  isFetching,
  fetchNextPage,
  isFetchingNextPage,
} = useGetUsers(params.value);

const maxUsersPage = computed(() => Math.floor(dataGetUsers.value?.pages[0]?.total_users / limit));

const byUser = computed(() => dataGetUsers.value?.pages[0]?.by_user);

const users = computed(() => {
  if (dataGetUsers.value?.pages && dataGetUsers.value.pages.length > 0) {
    return dataGetUsers.value.pages.reduce((acc, next) => {
      return [...acc, ...next.users];
    }, []);
  }
  return [];
});

onMounted(() => {
  window.scrollTo(0, 0);
  window.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});

function onScroll() {
  if (
    window.scrollY + window.innerHeight >= (document.body.scrollHeight * 85 / 100) &&
    !isFetchingNextPage.value &&
    dataGetUsers.value?.pageParams?.length < maxUsersPage.value
  ) {
    fetchNextPage();
  }
}

const onChangeTab = (value: string) => {
  router.push({
    name: value,
    params: { username: currentRouteUsername },
  });
};

</script>

<template>
  <HeaderMainContent
    :title="byUser?.name"
    :sub-title="byUser?.username"
    :back-to="`${PAGE_PATHS.USER}/${currentRouteUsername}`"
  >
    <template #tabs>
      <TabsMainContent
        class="grid-cols-2"
        :tabs="tabs"
        :default-tab="currentRouteName"
        @on-change-tab="onChangeTab"
      />
    </template>
  </HeaderMainContent>

  <div class="h-[60px]" />

  <!--  Users-->
  <div>
    <div v-if="users && users?.length > 0">
      <div
        v-for="user of users"
        :key="user.id"
      >
        <FollowUser :user="user" />
      </div>
    </div>

    <div
      v-if="isFetching || isFetchingNextPage"
      class="flex-center min-h-[40vh]"
    >
      <Loading
        variant="secondary"
        classes="h-7 w-7"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
