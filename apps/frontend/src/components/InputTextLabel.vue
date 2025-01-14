<template>
  <InputLabel :id :label :required :validation-errors>
    <InputText
      :id="id"
      v-model="data"
      class="w-full"
      :invalid="(required && edited && data?.length === 0) || hasValidationErrors(validationErrors)"
      :disabled="disabled"
      @input="validationErrors = []"
      @focusout="edited = true"
    />
  </InputLabel>
</template>

<script setup lang="ts">
import { ref, useId } from "vue";
import InputLabel from "@/components/InputLabel.vue";
import { hasValidationErrors, type ValidationData } from "@/utils/types/validation.type";

const edited = ref(false);

defineProps<{
  label?: string;
  required?: boolean;
  disabled?: boolean;
}>();

const id = useId();

const data = defineModel<string>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");
</script>
