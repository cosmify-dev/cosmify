<template>
  <IconField class="w-full mt-4">
    <InputIcon class="pi pi-search" />
    <InputText v-model="filter" placeholder="Search" class="w-full" />
  </IconField>

  <Toolbar v-if="selectedItems?.length > 0" class="mt-4">
    <template #start>
      <span> {{ selectedItems.length }} selected </span>
    </template>
    <template #end>
      <ConfirmButton
        label="Delete"
        severity="danger"
        action-button-severity="danger"
        action-button-label="Delete"
        :action-message="() => generateDeletionMessage(selectedItems, itemName)"
        @action="emits('deleteItems', selectedItems)"
      />
    </template>
  </Toolbar>

  <DataTable
    v-model:selection="selectedItems"
    v-model:filters="filters"
    :value="items"
    :global-filter-fields="filterFields"
    data-key="id"
    sort-mode="multiple"
    removable-sort
    :total-records="totalItems"
    :loading="isLoading"
    lazy
    paginator
    :rows="10"
    :rows-per-page-options="[10, 25, 50, 100]"
    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
    current-page-report-template="{first} to {last} of {totalRecords}"
    size="large"
    class="mt-4"
    @page="emits('pagination', $event.page + 1, $event.rows)"
  >
    <Column selection-mode="multiple" header-style="width: 3rem" />
    <slot />
  </DataTable>
</template>

<script setup lang="ts" generic="T extends DeleteEntity">
import { computed, ref, type Ref, watch } from "vue";
import { type DeleteEntity, generateDeletionMessage } from "@/utils";
import ConfirmButton from "@/components/ConfirmButton.vue";

const props = defineProps<{
  items: T[] | undefined;
  totalItems?: number;
  isLoading?: boolean;
  itemName: string;
  filterFields: string[];
}>();

const filter: Ref<string> = ref("");
const selectedItems: Ref<T[]> = ref([]);

watch(
  () => props.items,
  (newItems) =>
    (selectedItems.value = selectedItems.value.filter((item) => newItems?.includes(item)))
);

const emits = defineEmits<{
  (e: "pagination", page: number, pageSize: number): void;
  (e: "deleteItems", items: T[]): void;
}>();

const filters = computed(() => ({
  global: { value: filter.value, matchMode: "contains" }
}));
</script>
