<template>
  <Button
    label="Next"
    icon-pos="right"
    icon="pi pi-arrow-right"
    class="ml-auto"
    :disabled="disabled"
    @click="emit('click')"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>
