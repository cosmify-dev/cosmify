<template>
  <InputLabel :id :label :required :validation-errors>
    <div class="flex gap-4">
      <Select
        :id="id"
        v-model="data"
        :options="options as T[]"
        :option-label="optionLabel"
        :option-value="optionValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :invalid="hasValidationErrors(validationErrors)"
        class="w-full overflow-auto"
        :filter="filter"
        :virtual-scroller-options="{
          lazy: lazyLoading !== undefined,
          itemSize: 38,
          onLazyLoad(event: VirtualScrollerLazyEvent) {
            lazyLoading.load(event);
          }
        }"
        @change="
          validationErrors = [];
          $emit('change');
        "
      />
      <div>
        <Button
          :icon="isFetching ? 'pi pi-spinner pi-spin' : 'pi pi-sync'"
          severity="secondary"
          :disabled="!!isFetching"
          @click="$emit('refreshData')"
        />
      </div>
    </div>
  </InputLabel>
</template>

<script setup lang="ts" generic="T, R">
import { type Ref, useId } from "vue";
import Select from "primevue/select";
import { hasValidationErrors, type ValidationData } from "@/utils/types/validation.type";
import InputLabel from "@/components/InputLabel.vue";
import type {
  VirtualScrollerLazyEvent,
  VirtualScrollerScrollIndexChangeEvent
} from "primevue/virtualscroller";

withDefaults(
  defineProps<{
    label: string;
    options: T[] | readonly T[] | undefined;
    optionLabel?: string;
    optionValue?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    filter?: boolean;
    isFetching?: Ref<boolean> | boolean;
    lazyLoading?: {
      load: (e: VirtualScrollerScrollIndexChangeEvent) => void;
    };
  }>(),
  {
    optionLabel: "name",
    optionValue: "id",
    required: false,
    placeholder: "",
    filter: true,
    isFetching: undefined,
    lazyLoading: undefined
  }
);

const data = defineModel<R>("data");
const validationErrors = defineModel<ValidationData>("validationErrors");

defineEmits(["refreshData", "change"]);

const id = useId();
</script>
