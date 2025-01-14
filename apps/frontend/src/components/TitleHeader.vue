<template>
  <div class="flex items-center">
    <div class="flex gap-4 items-center">
      <h2 class="select-none">{{ title }}</h2>
      <slot v-if="$slots.left" name="left" />
    </div>
    <div class="flex ml-auto gap-2 items-center">
      <slot v-if="$slots.right" name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
