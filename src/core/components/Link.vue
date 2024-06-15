<script setup lang="ts">
import type { RouterLinkProps } from 'vue-router';
import { RouterLink } from 'vue-router';

type Props = {
  inactiveClass?: string
  to: string
} & RouterLinkProps;

const { to, activeClass, inactiveClass } = defineProps<Props>();

const isExternalLink = computed(() => typeof to === 'string' && to.startsWith('http'));

</script>

<template>
  <a
    v-if="isExternalLink"
    v-bind="$attrs"
    :href="to"
    target="_blank"
  >
    <slot />
  </a>

  <router-link
    v-else
    v-slot="{ isActive, href, navigate }"
    v-bind="$props"
    custom
  >
    <a
      v-bind="$attrs"
      :href="href"
      :class="isActive ? activeClass : inactiveClass"
      @click="navigate"
    >
      <slot />
    </a>
  </router-link>
</template>
