<template>
  <DataTable
    :value="members as any[]"
    data-key="id"
    sort-mode="multiple"
    removable-sort
    paginator
    size="large"
    :rows="10"
    :rows-per-page-options="[10, 25, 50, 100]"
    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
    current-page-report-template="{first} to {last} of {totalRecords}"
    class="mt-4"
  >
    <Column field="name" header="Name" sortable>
      <template #body="props">
        <div class="flex items-center gap-2">
          <Avatar :image="props.data.user.image" />
          <span>
            {{ props.data.user.name }}
          </span>
        </div>
      </template>
    </Column>
    <Column field="role" header="Role" sortable>
      <template #body="props">
        <span>
          {{ props.data.role }}
        </span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { authClient } from "@/utils/auth";
import { computed } from "vue";

const activeOrganization = authClient.useActiveOrganization();
const members = computed(() => activeOrganization.value.data?.members);
</script>
