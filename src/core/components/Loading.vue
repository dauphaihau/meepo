<script setup lang="ts">
import { cn } from '@core/helpers/common.js';

const VARIANT_MAPS = {
  primary: 'fill-black text-white',
  outline: 'fill-black text-white',
  secondary: 'fill-white text-black',
};

interface IProps {
  classes?: string
  variant?: keyof typeof VARIANT_MAPS
}

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
  classes: '',
});

</script>

<template>
  <div>
    <svg
      :class="cn('animate-spin w-3.5 h-3.5',
                 VARIANT_MAPS[props.variant],
                 props.classes
      )"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="stroke-[4]
          opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
</template>

<style scoped>

</style>
