<template>
  <TitleHeader title="Servers">
    <template #right>
      <Button label="Add" outlined size="small" @click="router.push('/servers/create')" />
      <Button
        :icon="isFetching ? 'pi pi-spinner pi-spin' : 'pi pi-sync'"
        label="Refresh"
        size="small"
        outlined
        :disabled="isFetching"
        @click="refetch()"
      />
    </template>
  </TitleHeader>

  <OverviewDataTable
    :items="data?.data"
    :filter-fields="['name', 'ip', 'status']"
    item-name="server"
    :total-items="totalItems"
    :is-loading="isFetching"
    @pagination="pagination.update"
    @delete-items="(items) => items.forEach((item) => deleteServer(item.id))"
  >
    <Column field="name" header="Name" sortable>
      <template #body="props">
        <router-link :to="'/servers/' + props.data.id">
          <p>{{ props.data.name }}</p>
        </router-link>
        <p v-if="props.data.prettyOs" class="text-xs mt-1">{{ props.data.prettyOs }}</p>
      </template>
    </Column>
    <Column field="ip" header="IP" class="select-all">
      <template #body="props">
        <div
          v-tooltip.top="{
            value: props.data.user + '@' + props.data.ip + ' (' + props.data.port + ')',
            showDelay: 200,
            hideDelay: 100
          }"
          class="w-fit"
        >
          {{ props.data.ip }}
        </div>
      </template>
    </Column>
    <Column field="status" header="Status" sortable>
      <template #body="props">
        <Tag :value="props.data.status" :severity="convertServerStatusToColor(props.data.status)" />
      </template>
    </Column>
    <Column field="createdAt" header="Created" sortable>
      <template #body="props">
        <span>
          {{ formatRelative(props.data.createdAt, new Date()) }}
        </span>
      </template>
    </Column>
    <Column header="Actions">
      <template #body="props">
        <div v-if="props.data.status !== 'DELETING'">
          <ConfirmButton
            text
            icon="pi pi-trash"
            severity="danger"
            action-button-label="Delete"
            action-button-severity="danger"
            :action-message="() => generateDeletionMessage(props.data, 'server')"
            @action="deleteServer(props.data.id)"
          />
        </div>
        <i v-else class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
      </template>
    </Column>
  </OverviewDataTable>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { generateDeletionMessage } from "@/utils";
import OverviewDataTable from "@/components/OverviewDataTable.vue";
import TitleHeader from "@/components/TitleHeader.vue";
import { formatRelative } from "date-fns";
import ConfirmButton from "@/components/ConfirmButton.vue";
import { useRouter } from "vue-router";
import { useDeleteServerMutation, useServersQuery } from "@/api/useServers";
import { convertServerStatusToColor } from "@/utils/types/server.type";

const router = useRouter();

const { data, totalItems, isFetching, refetch, pagination } = useServersQuery();
const { mutate: deleteServer } = useDeleteServerMutation();
</script>
