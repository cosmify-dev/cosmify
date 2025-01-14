<template>
  <div class="flex flex-row h-screen max-w-screen-2xl mx-auto">
    <NavigationMenu />
    <div class="p-5 w-full bg-primary-900 overflow-y-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavigationMenu from "@/components/NavigationMenu.vue";
</script>
