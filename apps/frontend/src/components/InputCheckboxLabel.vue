<template>
  <InputLabel :id :label :required :validation-errors>
    <Checkbox :id="id" v-model="data" :binary :invalid="hasValidationErrors(validationErrors)" />
  </InputLabel>
</template>

<script setup lang="ts">
import { useId } from "vue";
import InputLabel from "@/components/InputLabel.vue";
import { hasValidationErrors, type ValidationData } from "@/utils/types/validation.type";

defineProps<{
  title?: string;
  required?: boolean;
  binary?: boolean;
}>();

const id = useId();

const data = defineModel<boolean>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");
</script>
