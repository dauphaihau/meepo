<script setup lang="ts">

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

const emit = defineEmits<(e: 'update:modelValue', value: string | number) => void>();

const model = defineModel({
  default: '',
  required: true,
  type: String,
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
  <textarea
    v-bind="$attrs"
    v-model="model"
    type="text"
    class="input resize-none py-2"
    rows="4"
    :disabled="props.disabled"
    @input="onChangeInput"
  />
</template>

<style scoped>

</style>
