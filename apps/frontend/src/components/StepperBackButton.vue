<template>
  <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="emit('click')" />
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>
