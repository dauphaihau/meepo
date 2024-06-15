<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import { useMutationState } from '@tanstack/vue-query';
import type { AxiosResponse } from 'axios';

import Button from '@/core/components/Button.vue';
import { useUnOrFollowUser } from '@services/user.ts';
import type { IUser } from '@/types/user.ts';
import { useAuthStore } from '@stores/auth.ts';
import { useDialogStore } from '@stores/dialog.ts';
import { logger } from '@core/helpers/logger.ts';

interface Props {
  userId: IUser['id']
}

const { userId } = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onUnOrFollowSuccess')
}>();

const model = defineModel<boolean>({
  default: false,
  required: true,
});

const authStore = useAuthStore();
const dialogStore = useDialogStore();

const {
  mutateAsync: unOrFollowUser,
} = useUnOrFollowUser(userId);

const unOrFollow = async () => {
  if (!authStore.isLoggedIn) {
    dialogStore.showDialog = 'login';
    return;
  }

  if (!userId) {
    logger.error('execute unOrFollow: user is undefined', 'src/components/ToggleFollowBtnTest.vue');
    return;
  }

  const { status } = model.value ?
    await unOrFollowUser('unfollow') :
    await unOrFollowUser('follow');

  if (status === StatusCodes.OK) {
    emit('onUnOrFollowSuccess');
  }
};

const dataUpdatedFollow = useMutationState({
  filters: {
    mutationKey: ['un-or-follow-user', userId],
  },
  select: (mutation) => {
    return (mutation.state.data as AxiosResponse<{ message: string }>)?.data?.message;
  },
});

watch(dataUpdatedFollow, () => {
  const lastFollowUpdated = dataUpdatedFollow.value[dataUpdatedFollow.value.length - 1];
  if (lastFollowUpdated) {
    if (lastFollowUpdated.includes('unfollow')) {
      model.value = false;
    }
    else if (lastFollowUpdated.includes('follow')) {
      model.value = true;
    }
  }
});

</script>

<template>
  <Button
    v-if="model"
    variant="secondary"
    class="h-[32px]"
    :class="model ? 'btn-following' : `after:content-['Follow']`"
    @click="unOrFollow"
  />
  <Button
    v-else
    class="h-[32px]"
    @click="unOrFollow"
  >
    {{ model ? 'Following' : 'Follow' }}
  </Button>
</template>

<style scoped>

.btn-following {
  @apply hover:after:content-['Unfollow'] hover:bg-red-200 hover:text-red-500  hover:ring-red-300 after:content-['Following'];
}
</style>
