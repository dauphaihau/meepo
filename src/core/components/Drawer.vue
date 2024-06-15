<script lang="ts" setup>

interface IProps {
  show?: boolean
  close: () => void
}

const { show, close } = defineProps<IProps>();

</script>

<template>
  <Teleport to="body">
    <div class="md:hidden">
      <!-- Overlay -->
      <div
        v-if="show"
        class="fixed inset-0 z-10 h-screen bg-black opacity-30"
        @click="close"
      />

      <div
        class="fixed top-0 z-10 h-screen min-h-0 w-3/4 bg-white py-3 transition-all duration-500"
        :class="show ? 'left-0' : '-left-80'"
      >
        <slot name="panel" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>

</style>
