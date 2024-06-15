<script setup lang="ts">
import { cn } from '@core/helpers/common.js';

interface Props {
  modelValue?: string | number
  size?: keyof typeof SIZE_MAPS
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  disabled: false,
  modelValue: '',
});

const {
  size,
} = props;

const emit = defineEmits<(e: 'update:modelValue', value: string | number) => void>();

const model = defineModel<string>({
  default: '',
  required: true,
});

const onChangeInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};

const SIZE_MAPS = {
  sm: 'h-9',
  md: 'h-[42px]',
};

</script>

<template>
  <input
    v-bind="$attrs"
    v-model="model"
    :disabled="props.disabled"
    class="input"
    :class="cn('input', SIZE_MAPS[size])"
    @input="onChangeInput"
  >
</template>

<style scoped>

</style>
