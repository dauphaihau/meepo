<script setup lang="ts">
import Loading from '@core/components/Loading.vue';
import { useGetProfileUser } from '@services/user.ts';
import HeaderMainContent from '@components/layout/HeaderMainContent.vue';
import UserInfo from '@components/pages/profile/ProfileUserInfo.vue';
import TabsMainContent from '@components/layout/TabsMainContent.vue';
import ProfilePostList from '@components/pages/profile/ProfilePostList.vue';

const route = useRoute();

const tabs = ['Posts', 'Replies', 'Likes', 'Media'].map((name, index) => ({ id: index, name }));
let currentTab = $ref(0);

const {
  data,
  isPending: isPendingGetProfileUser,
} = useGetProfileUser(route.params.username as string);

const onChangeTab = (value: number) => {
  currentTab = value;
};

</script>

<template>
  <div>
    <div
      v-if="isPendingGetProfileUser"
      class="flex-center min-h-[40vh]"
    >
      <Loading
        variant="secondary"
        classes="h-7 w-7"
      />
    </div>

    <div v-else>
      <!--    Response error 404 -->
      <div
        v-if="!data.user"
        class="mx-auto mt-20 max-w-80"
      >
        <div class="space-y-2">
          <div class="text-3xl font-bold">
            This account doesn’t exist
          </div>
          <div class="font-semibold text-zinc-500">
            Try searching for another.
          </div>
        </div>
      </div>

      <div v-else>
        <HeaderMainContent
          :title="data.user?.name ?? 'Profile' "
          :sub-title="`${data.user?.posts_count ?? 0 } posts`"
        />
        <UserInfo />

        <TabsMainContent
          :tabs="tabs"
          class="grid-cols-4 border-b"
          @on-change-tab="onChangeTab"
        />
        <ProfilePostList
          v-if="data.user"
          :key="currentTab"
          :author="data.user"
          :by="currentTab"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
