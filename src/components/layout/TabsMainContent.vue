<script setup lang="ts">

interface Tab { id: number | string, name: string }

interface IProps {
  tabs?: Tab[]
  defaultTab?: Tab['id']
}

const {
  tabs,
  defaultTab,
} = defineProps<IProps>();

const emit = defineEmits<(e: 'on-change-tab', value: Tab['id']) => void>();

const defaultTabComputed = computed(() => {
  if (defaultTab) {
    return tabs.find(tab => tab.id === defaultTab).id;
  }
  return tabs[0].id;
});

const currentTab = ref(defaultTabComputed.value);

const changeTab = (id: Tab['id']) => {
  if (id === currentTab.value) return;
  emit('on-change-tab', id);
  currentTab.value = id;
};

</script>

<template>
  <div
    v-if="tabs && tabs.length > 0"
    class="tabs"
  >
    <div
      v-for="(tab , idx) of tabs"
      :key="idx"
    >
      <div
        class="tab"
        @click="changeTab(tab.id)"
      >
        <div
          class="tab-name"
          :class="tab.id === currentTab ? 'text-black' : 'text-zinc-500' "
        >
          {{ tab.name }}
        </div>
        <div
          v-if="tab.id === currentTab"
          class="tab-active-underline"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

.tabs {
  @apply grid;
}

.tab {
  @apply flex-center py-4 hover:bg-[#e7e7e8] animate relative cursor-pointer text-[15px];
}

.tab .tab-name {
  @apply font-semibold text-sm lg:text-base;
}

.tab .tab-active-underline {
  @apply bg-black w-[60px] absolute bottom-0 h-1 rounded-full;
}

</style>
