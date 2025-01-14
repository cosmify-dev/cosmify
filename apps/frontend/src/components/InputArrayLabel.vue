<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2 items-center">
      <label :for="id" class="font-bold text-lg">{{ title }}</label>
      <Tag v-if="required" value="Required" severity="danger" />
      <Button label="Add" size="small" outlined severity="secondary" @click="$emit('addItem')" />
    </div>
    <div class="flex gap-4" :class="column ? 'flex-col' : 'overflow-x-auto'">
      <div v-for="(item, index) in items" :key="index">
        <slot
          v-if="validationErrors && Array.isArray(validationErrors)"
          :index="index"
          :items="items"
          :item="item"
          :remove="removeItem"
        />
        <slot
          v-else
          :index="index"
          :items="items"
          :item="item"
          :remove="removeItem"
          :validation-errors="
            ((validationErrors && validationErrors[index]) || {}) as ValidationErrors
          "
        />
      </div>
    </div>
    <InputValidationErrors :id v-model:validation-errors="validationErrors" />
  </div>
</template>

<script setup lang="ts" generic="T">
import { useId } from "vue";
import { type ValidationData, type ValidationErrors } from "@/utils/types/validation.type";
import InputValidationErrors from "@/components/InputValidationErrors.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    items: T[];
    column?: boolean;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    column: false,
    required: false,
    disabled: false
  }
);

const validationErrors = defineModel<ValidationData>("validationErrors", {
  required: false,
  default: () => {}
});

const emit = defineEmits(["update:items", "addItem"]);

const removeItem = (index: number) => {
  if (validationErrors.value) {
    if (Array.isArray(validationErrors.value)) validationErrors.value = [];
    else delete validationErrors.value[index];
  }
  const updatedItems = props.items.filter((_, i) => i !== index);
  emit("update:items", updatedItems);
};

const id = useId();
</script>
