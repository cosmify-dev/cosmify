<template>
  <div class="flex flex-col gap-2">
    <div v-if="label" class="flex gap-2 items-center">
      <label :for="id" class="font-bold">{{ label }}</label>
      <Tag v-if="required" value="Required" severity="danger" />
    </div>
    <slot />
    <InputValidationErrors :id="id" v-model:validation-errors="validationErrors" />
  </div>
</template>

<script setup lang="ts">
import InputValidationErrors from "@/components/InputValidationErrors.vue";
import type { ValidationData } from "@/utils/types/validation.type";
import { watch } from "vue";

export type Props = {
  id: string;
  label?: string;
  required?: boolean;
};

defineProps<Props>();

const validationErrors = defineModel<ValidationData>("validationErrors");
</script>
