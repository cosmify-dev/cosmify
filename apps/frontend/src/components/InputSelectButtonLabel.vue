<template>
  <InputLabel :id :label :required :validation-errors>
    <SelectButton
      :id="id"
      v-model="data"
      :options="options"
      :required="required"
      :disabled="disabled"
      class="w-full"
      :allow-empty="allowEmpty"
      @change="validationErrors = []"
    />
  </InputLabel>
</template>

<script setup lang="ts" generic="T, R">
import { useId } from "vue";
import InputLabel from "@/components/InputLabel.vue";
import type { ValidationData } from "@/utils/types/validation.type";

withDefaults(
  defineProps<{
    label?: string;
    options: T[];
    required?: boolean;
    disabled?: boolean;
    allowEmpty?: boolean;
  }>(),
  {
    label: "",
    required: false,
    allowEmpty: true
  }
);

const data = defineModel<R>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");

defineEmits(["refreshData"]);

const id = useId();
</script>
