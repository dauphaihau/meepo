<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/vue';
import { CheckIcon, GlobeAsiaAustraliaIcon } from '@heroicons/vue/20/solid';
import { POST_WHO_CAN_REPLY } from '@config/post.ts';

interface IProps {
  defaultValue: number
}

export interface IOptionSelectWhoCanReply {
  title: string
  value: POST_WHO_CAN_REPLY
}

const props = withDefaults(defineProps<IProps>(), {
  defaultValue: POST_WHO_CAN_REPLY.EVERYONE,
});

const emit = defineEmits<(e: 'update:modelValue', value: { title: string }) => void>();

const options: IOptionSelectWhoCanReply[] = [
  { title: 'Everyone', value: POST_WHO_CAN_REPLY.EVERYONE },
  { title: 'People you follow', value: POST_WHO_CAN_REPLY.FOLLOWED },
];

const selectedOption = ref(options[props.defaultValue]);


</script>

<template>
  <div class="relative z-10 w-fit">
    <Listbox
      v-model="selectedOption"
      @update:model-value="value => emit('update:modelValue', value)"
    >
      <div class="relative mt-1">
        <ListboxButton
          class="animate my-2 flex w-fit cursor-pointer items-center gap-2
           rounded-full border-none px-2 py-1 font-semibold text-zinc-500 hover:bg-zinc-200"
        >
          <GlobeAsiaAustraliaIcon class=" size-4" />
          <div class="text-sm">
            {{ selectedOption.title }} can comment
          </div>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute bottom-10 mt-1 max-h-60 w-full overflow-auto rounded-xl
             bg-white text-base shadow-lg ring-1
               ring-black/5 focus:outline-none sm:text-sm md:bottom-auto"
          >
            <ListboxOption
              v-for="opt in options"
              v-slot="{ active, selected }"
              :key="opt.title"
              :value="opt"
              as="template"
            >
              <li
                :class="[
                  active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-900',
                  'relative cursor-pointer select-none py-2 pl-4 pr-10',
                ]"
              >
                <span
                  :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'block truncate',
                  ]"
                >{{ opt.title }}</span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 right-5 flex items-center text-black"
                >
                  <CheckIcon
                    class="size-5"
                    aria-hidden="true"
                  />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>
