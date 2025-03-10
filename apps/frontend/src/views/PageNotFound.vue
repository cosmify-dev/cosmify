<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main class="grid h-screen place-items-center sm:py-32 lg:px-8">
    <div class="text-center">
      <p class="font-semibold text-3xl text-gray-400">404</p>
      <h1 class="mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
        Page not found
      </h1>
      <p class="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
        Sorry, we couldn´t find the page you´re looking for.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <Button label="Go back home" @click="router.push('/')" />
      </div>
    </div>
  </main>
</template>
