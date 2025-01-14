<template>
  <InputLabel :id :label :required :validation-errors>
    <Textarea
      :id="id"
      v-model="data"
      :placeholder="placeholder"
      rows="8"
      class="w-full"
      :invalid="(required && edited && data?.length === 0) || hasValidationErrors(validationErrors)"
      :disabled="disabled"
      @mousedown="edited = true"
      @input="validationErrors = []"
    />
  </InputLabel>
</template>

<script setup lang="ts">
import { ref, useId } from "vue";
import { hasValidationErrors, type ValidationData } from "@/utils/types/validation.type";
import InputLabel from "@/components/InputLabel.vue";

const id = useId();
const edited = ref(false);

defineProps<{
  title: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}>();

const data = defineModel<string>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");
</script>
