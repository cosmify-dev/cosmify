<template>
  <InputLabel :id :label :required :validation-errors>
    <ToggleButton
      :id="id"
      v-model="data"
      :on-label="onLabel"
      :off-label="offLabel"
      :required="required"
      :disabled="disabled"
      class="w-full"
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
    onLabel: string;
    offLabel: string;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    label: "",
    required: false,
    placeholder: ""
  }
);

const data = defineModel<boolean>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");

const id = useId();
</script>
