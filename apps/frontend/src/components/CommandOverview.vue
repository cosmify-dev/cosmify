<template>
  <div class="flex flex-col gap-4">
    <ActionPanel v-for="action in data?.data" :key="action.id" :action="action" />
  </div>

  <div class="flex">
    <Paginator
      :rows="10"
      :total-records="data?.total"
      :rows-per-page-options="[10, 25, 50, 100]"
      class="flex-grow"
      @page="pagination.update($event.page + 1, $event.rows)"
    ></Paginator>
  </div>
</template>

<script setup lang="ts">
import ActionPanel from "@/components/ActionPanel.vue";
import { useActionsQuery } from "@/api/useActions";

const props = defineProps<{
  id: string;
  uri: string;
}>();

const { data, pagination, refetch } = useActionsQuery(props.uri, props.id);

defineExpose({
  refetch
});
</script>
