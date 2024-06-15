<script setup lang="ts">
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import type { TOptionDefault } from '@core/components/forms/Select.vue';
import Select from '@core/components/forms/Select.vue';
import { USER_CONFIG } from '@config/user.ts';
import type { IUser } from '@/types/user.ts';

// strict isValid()
dayjs.extend(customParseFormat);

interface IProps {
  disabled?: boolean
  defaultValue?: null | number
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false,
  defaultValue: 0,
});

const model = defineModel<IUser['dob']>({
  required: true,
});

const emit = defineEmits<(e: 'update:modelValue', value: string) => void>();

let dob = $ref({ month: '', day: '', year: '' });

const months = [
  { id: 1, name: 'January' },
  { id: 2, name: 'February' },
  { id: 3, name: 'March' },
  { id: 4, name: 'April' },
  { id: 5, name: 'May' },
  { id: 6, name: 'June' },
  { id: 7, name: 'July' },
  { id: 8, name: 'August' },
  { id: 9, name: 'September' },
  { id: 10, name: 'October' },
  { id: 11, name: 'November' },
  { id: 12, name: 'December' },
];

const years = new Array(new Date().getFullYear() - USER_CONFIG.MIN_YEAR_BIRTH)
  .fill('')
  .map((_, i) => ({
    id: i,
    name: (USER_CONFIG.MIN_YEAR_BIRTH + i + 1).toString(),
  }))
  .reverse();

let keyDaySelectComponent = $ref(0);
let numsDay = $ref(31);

const days = computed(() => {
  return new Array(numsDay).fill('').map((_, i) => ({
    id: i,
    name: (i + 1).toString(),
  }));
});

onBeforeMount(() => {
  if (
    model.value &&
      typeof model.value === 'string' &&
      dayjs(model.value).isValid()
  ) {
    const formatModelValue = dayjs(model.value).format('YYYY-MMMM-D');
    if (!formatModelValue.includes('-')) {
      logger.error(`Invalid format date: with modelValue is ${model.value} `, 'src/components/DateBirthInput.vue');
      return;
    }
    const dobSplit = formatModelValue.split('-');
    dob = {
      year: dobSplit[0],
      month: dobSplit[1],
      day: dobSplit[2],
    };
  }
});

const onChangeSelect = (nameSelect: string, option: TOptionDefault) => {
  dob[nameSelect] = option.name;

  let dayTemp = dob.day ? dob.day : 1;
  const monthTemp = dob.month ? dob.month : 1;
  const yearTemp = dob.year ? dob.year : USER_CONFIG.MIN_YEAR_BIRTH;

  const isValid = dayjs(`${yearTemp}-${monthTemp}-${dayTemp}`, 'YYYY-MMMM-D', true).isValid();

  if (!isValid) {
    dob.day = '';
    dayTemp = 1;
    keyDaySelectComponent++;
  }

  const newNumsDay = dayjs(`${yearTemp}-${monthTemp}-${dayTemp}`).daysInMonth();
  if (newNumsDay !== numsDay) {
    numsDay = newNumsDay;
  }

  if (!Object.values(toRaw(dob)).includes('')) {
    const output = `${dob.year}-${dob.month}-${dob.day}`;
    emit('update:modelValue', output);
  }
};

</script>

<template>
  <div class="mb-1 flex w-full flex-wrap space-x-1.5 md:space-x-2">
    <Select
      v-model="dob.month"
      class-wrapper="w-[40%]"
      :options="months"
      :disabled="props.disabled"
      :default-value="props.defaultValue"
      name="month"
      @update:model-value="(opt) => onChangeSelect('month', opt)"
    />
    <Select
      :key="keyDaySelectComponent"
      v-model="dob.day"
      class-wrapper="w-[26%]"
      :options="days"
      :disabled="props.disabled"
      :default-value="props.defaultValue"
      name="day"
      @update:model-value="(opt) => onChangeSelect('day', opt)"
    />
    <Select
      v-model="dob.year"
      :options="years"
      class-wrapper="w-[30%]"
      :disabled="props.disabled"
      :default-value="props.defaultValue"
      name="year"
      @update:model-value="(opt) => onChangeSelect('year', opt)"
    />
  </div>
</template>

<style scoped>

</style>
