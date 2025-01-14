<template>
  <div
    v-if="hasValidationErrors(validationErrors) && Array.isArray(validationErrors)"
    class="flex flex-col gap-1"
  >
    <small
      v-for="validationError in validationErrors"
      :id="id"
      :key="validationError"
      class="text-red-400"
    >
      {{ validationError }}
    </small>
  </div>
</template>

<script lang="ts" setup>
import { hasValidationErrors, type ValidationData } from "@/utils/types/validation.type";

defineProps<{
  id: string;
}>();
const validationErrors = defineModel<ValidationData>("validationErrors");
</script>
