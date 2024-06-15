<script setup lang="ts">
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  TransitionRoot
} from '@headlessui/vue';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/vue/24/outline';

import { useSearchUser } from '@services/common';
import type { IUser } from '@/types/user';
import { debounce, truncateText } from '@core/helpers/common.ts';
import { useMediaQuery } from '@vueuse/core';
import { FILTER_SEARCH_ALL } from '@config/const.ts';

const props = defineProps<{ query: string }>();

const emit = defineEmits<{
  (e: 'changeRoute') // re-render SearchUserBar component
}>();

const isTabletScreen = useMediaQuery('(min-width: 768px)');
const router = useRouter();
const route = useRoute();

const query = ref(props.query);
const isFocus = ref(false);
const isEntered = ref(false);
const storedSearches = ref([]);

onMounted(async () => {
  await router.isReady();
  if (localStorage.storedSearches) {
    storedSearches.value = JSON.parse(localStorage.storedSearches);
  }
});

watch(router.currentRoute, () => {
  if (route.name !== 'search') {
    query.value = '';
  }
});

const {
  data,
  mutate: searchUser,
} = useSearchUser();

const debouncedSearch = debounce((search: string) => {
  if (isEntered.value || !search) return;
  searchUser({
    f: FILTER_SEARCH_ALL.PEOPLE,
    q: search,
  });
}, 500);

const users = computed(() => {
  return data.value?.users || [];
});

const handleFocus = () => {
  isFocus.value = true;
};

const handleEnter = () => {
  if (!query.value) {
    isFocus.value = false;
    return;
  }
  isEntered.value = true;

  if (!storedSearches.value.includes(query.value)) {
    storedSearches.value.unshift(query.value);
    localStorage.storedSearches = JSON.stringify(storedSearches.value);
  }

  redirectSearchPageWithQuery();
};

const redirectSearchPageWithQuery = () => {
  router.push({
    name: 'search',
    query: {
      q: query.value,
      f: FILTER_SEARCH_ALL.TOP,
    },
  });
};

const redirectProfilePage = (username: IUser['username']) => {
  router.push('/user/' + username);
  emit('changeRoute');
};

const onClickHistorySearch = (historySearch: string) => {
  query.value = historySearch;
  handleEnter();
};

const removeSearch = (search: string) => {
  const storedSearchesArr = JSON.parse(localStorage.storedSearches);
  storedSearches.value = storedSearchesArr.filter(s => s !== search);
  localStorage.storedSearches = JSON.stringify(storedSearches.value);
  isFocus.value = true;
};

const onChangeInput = (e: Event) => {
  const search = (e.target as HTMLInputElement).value;
  query.value = search;
  debouncedSearch(search);
};

</script>

<template>
  <div>
    <Combobox :default-value="query">
      <div class="relative">
        <div
          class="wrapper-input group"
          :class="{
            '!bg-white': isFocus,
            'rounded-full': !isFocus || (storedSearches.length === 0 && users.length === 0 && !query),
            'rounded-t-3xl': isFocus && (users.length > 0 || storedSearches.length > 0 || query),
          }"
        >
          <MagnifyingGlassIcon class="h-5 min-w-5 text-zinc-500" />
          <ComboboxInput
            placeholder="Search Meepo"
            class="combobox-input animate group-hover:bg-white"
            :class="{'!bg-white': isFocus, 'pr-8': query }"
            @focus="handleFocus"
            @focusout="isFocus = false"
            @input="onChangeInput"
            @keyup.enter="handleEnter"
          />

          <ComboboxButton
            class="absolute inset-y-0 right-0 z-[1] flex items-center pr-2"
            :class="{'w-full': !isFocus}"
          />
          <XCircleIcon
            v-if="query"
            class="animate absolute right-3 z-[2] size-6 cursor-pointer text-zinc-500 hover:text-black md:top-2"
            @click.stop="query = ''"
          />
        </div>

        <TransitionRoot
          leave="transition ease-in duration-100"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <ComboboxOptions
            class="options z-10"
            :class="{'ring-1': isFocus && (users.length > 0 || storedSearches.length > 0 || query)}"
          >
            <!-- History searched -->
            <ComboboxOption
              v-for="(searchValue, index) of storedSearches"
              :key="searchValue + index"
              :value="searchValue"
              as="div"
            >
              <div
                v-if="storedSearches.length > 0 && !query"
                class="animate flex cursor-pointer items-center gap-2 px-4 py-3 hover:bg-zinc-100"
                @click="onClickHistorySearch(searchValue)"
              >
                <MagnifyingGlassIcon class="size-5 min-w-5" />
                <p class="grow truncate text-sm">
                  {{ searchValue }}
                </p>
                <div @click.stop="removeSearch(searchValue)">
                  <XCircleIcon
                    v-tooltip="'remove'"
                    class="size-5"
                  />
                </div>
              </div>
            </ComboboxOption>

            <!-- Suggest  -->
            <ComboboxOption>
              <div
                v-if="query"
                class="animate flex cursor-pointer items-center gap-2 px-4 py-2.5 hover:bg-zinc-100"
                @click="redirectSearchPageWithQuery"
              >
                <MagnifyingGlassIcon class="size-5 min-w-5" />
                <p class="grow truncate text-sm">
                  Search for "{{ query }}"
                </p>
              </div>
            </ComboboxOption>

            <!-- People-->
            <div
              v-if="users && users.length > 0"
              class="border-t"
            >
              <ComboboxOption
                v-for="person in users"
                :key="person.id"
                v-slot="{ selected, active }"
                as="div"
                :value="person"
              >
                <li
                  class="relative block cursor-pointer select-none p-4"
                  :class="{
                    'bg-[#f3f4f5] text-black': active,
                    'text-zinc-900': !active,
                  }"
                  @click="redirectProfilePage(person.username)"
                >
                  <div class="flex gap-2">
                    <img
                      v-if="person.avatar_url"
                      alt="avatar"
                      :src="person.avatar_url"
                      class="size-10 rounded-full bg-black"
                    >
                    <img
                      v-else
                      alt="avatar"
                      src="@/assets/default-avatar.png"
                      class="size-10 rounded-full bg-black"
                    >
                    <div>
                      <div
                        class="max-h-[18px] text-[15px]"
                        :class="{ 'font-medium': selected, 'font-semibold': !selected }"
                      >
                        {{ truncateText(person.name, isTabletScreen ? 20 : 10, '...') }}
                      </div>
                      <div class="text-zinc-500">
                        @{{ truncateText(person.username, isTabletScreen ? 20 : 10, '...') }}
                      </div>
                    </div>
                  </div>
                </li>
              </ComboboxOption>
            </div>
          </ComboboxOptions>
        </TransitionRoot>
      </div>
    </Combobox>
  </div>
</template>

<style scoped>

.wrapper-input {
  @apply relative cursor-pointer overflow-hidden bg-zinc-100 hover:bg-white animate
  text-left border border-zinc-200  sm:text-sm flex items-center pl-4;
}

.combobox-input {
  @apply
  h-9 lg:h-10
  w-[88%] md:w-[92%]
  border-0 border-none
  py-2.5 pl-3 focus:pr-8
  text-sm placeholder:text-[#818182] text-black leading-5
  bg-zinc-100 hover:bg-white focus:bg-white
  focus:outline-none
  ;
}

.options {
  @apply absolute max-h-96 ml-[1px] w-[99.6%] overflow-auto rounded-b-md bg-white text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm
}

</style>
