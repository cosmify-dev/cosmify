<template>
  <InputLabel :id :label :required :validation-errors>
    <div class="flex gap-4">
      <MultiSelect
        :id="id"
        v-model="data"
        :options="options"
        :option-label="optionLabel"
        :option-value="optionValue"
        :placeholder="placeholder"
        :max-selected-labels="3"
        :required="required"
        :disabled="disabled"
        class="w-full"
        filter
        :virtual-scroller-options="{
          lazy: lazyLoading !== undefined,
          itemSize: 38,
          onLazyLoad(event: VirtualScrollerScrollIndexChangeEvent) {
            lazyLoading.load(event);
          }
        }"
        @change="validationErrors = []"
      />
      <Button
        :icon="isFetching ? 'pi pi-spinner pi-spin' : 'pi pi-sync'"
        severity="secondary"
        :disabled="!!isFetching"
        @click="$emit('refreshData')"
      />
    </div>
  </InputLabel>
</template>

<script setup lang="ts" generic="T, R">
import { computed, type Ref, useId } from "vue";
import MultiSelect from "primevue/multiselect";
import InputLabel from "@/components/InputLabel.vue";
import type { ValidationData } from "@/utils/types/validation.type";
import type {
  VirtualScrollerLazyEvent,
  VirtualScrollerScrollIndexChangeEvent
} from "primevue/virtualscroller";
import Select from "primevue/select";

withDefaults(
  defineProps<{
    label: string;
    options: T[];
    optionLabel: string;
    optionValue: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    isFetching?: Ref<boolean> | boolean;
    lazyLoading?: {
      load: (e: VirtualScrollerScrollIndexChangeEvent) => void;
    };
  }>(),
  {
    required: false,
    placeholder: "",
    lazyLoading: undefined,
    isFetching: undefined
  }
);

const data = defineModel<R[]>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");

defineEmits(["refreshData"]);

const id = useId();
</script>
