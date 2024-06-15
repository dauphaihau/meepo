<script
    setup
    lang="ts"
    generic="TOption extends TOptionDefault, TValue = TOption"
>
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/vue';

import { cn } from '@core/helpers/common.js';
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/20/solid';

export interface TOptionDefault {
  id: number
  name: string
  disabled?: boolean
}

interface IProps {
  modelValue: string
  size?: 'sm'
  helperText?: string
  name: string
  options: TOption[]
  disabled?: boolean
  defaultValue?: number | null
  classWrapper?: string
  classOptions?: string
  classBtn?: string
}

const props = withDefaults(defineProps<IProps>(), {
  name: '',
  size: 'sm',
  classWrapper: '',
  classBtn: '',
  classOptions: '',
  helperText: '',
  modelValue: '',
  disabled: false,
  defaultValue: 0,
});

let {
  name,
  classOptions,
  classBtn,
} = props;

const emit = defineEmits<(e: 'update:modelValue', value: TValue) => void>();

const indexOption = computed(() => {
  const idx = props.options.findIndex(d => d.name === props.modelValue);
  if (idx !== -1) {
    return idx;
  }
  return props.defaultValue;
});

const onChangeSelect = (option: TValue) => {
  emit('update:modelValue', option);
};

</script>

<template>
  <div :class="classWrapper">
    <Listbox
      v-slot="{ open }"
      :default-value="options[indexOption]"
      :name="name"
      v-bind="$attrs"
      @update:model-value="onChangeSelect"
    >
      <div class="relative mt-1">
        <ListboxButton
          v-slot="{ value }"
          class="list-button"
          :class="cn(
            disabled ? 'bg-[#f7f8f9] text-[#c2c3c4] ring-1 ring-inset ring-zinc-300' : 'bg-white',
            classBtn
          )"
        >
          <span class="block truncate">{{ value?.name }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              class="size-5 text-zinc-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>

        <div
          v-if="open"
          class="fixed inset-0"
        />

        <transition
          v-if="!disabled"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="list-options"
            :class="classOptions"
          >
            <ListboxOption
              v-for="option in props.options"
              v-slot="{ active, selected }"
              :key="option.id"
              :value="option"
              :disabled="option?.disabled && option.disabled"
              as="ul"
            >
              <li
                :class="[
                  'relative flex cursor-pointer select-none items-center gap-2 truncate py-2 pl-3 pr-4',
                  selected ? 'font-medium' : 'font-normal',
                  active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-900',
                ]"
              >
                <div v-if="$slots.option">
                  <slot
                    name="option"
                    :option="option"
                  />
                </div>
                <div v-else>
                  {{ option.name }}
                </div>

                <CheckIcon
                  v-show="selected"
                  class="size-4 stroke-[2px]"
                />
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>

<style scoped>

.list-button {
  @apply
  relative cursor-default rounded-md text-left sm:text-sm shadow-sm
  pl-3 pr-10
  w-full h-[42px]
  ring-1 ring-inset ring-zinc-300
  focus-within:ring-2 focus-within:ring-inset focus-within:ring-black focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2
  focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-black
  ;
}

.list-options {
  @apply w-full absolute mt-1 max-h-52 overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm;
}

</style>
