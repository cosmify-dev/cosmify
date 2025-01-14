<template>
  <InputLabel :id :label :required :validation-errors>
    <InputNumber
      v-model="data"
      :invalid="required && edited && data === undefined"
      fluid
      :min="min"
      :max="max"
      :suffix="suffix"
      :use-grouping="false"
      @mousedown="edited = true"
      @input="validationErrors = []"
    />
  </InputLabel>
</template>

<script setup lang="ts">
import { ref, useId } from "vue";
import InputLabel from "@/components/InputLabel.vue";
import { type ValidationData } from "@/utils/types/validation.type";

const edited = ref(false);

withDefaults(
  defineProps<{
    label?: string;
    required?: boolean;
    min?: number;
    max?: number;
    suffix?: string;
  }>(),
  {
    label: "",
    required: false,
    min: undefined,
    max: undefined,
    suffix: ""
  }
);

const id = useId();

const data = defineModel<number>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");
</script>
