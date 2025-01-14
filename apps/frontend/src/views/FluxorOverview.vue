<template>
  <TitleHeader title="Fluxor">
    <template #right>
      <Button label="Add" size="small" outlined @click="router.push('/fluxor/create')" />
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
    :filter-fields="['name', 'server', 'status']"
    item-name="flux"
    :total-items="totalItems"
    :is-loading="isFetching"
    @pagination="pagination.update"
    @delete-items="(items) => items.forEach((item) => deleteFlux(item.id))"
  >
    <Column field="name" header="Name">
      <template #body="props">
        <router-link :to="'/fluxor/' + props.data.id">
          <p>{{ props.data.name }}</p>
        </router-link>
      </template>
    </Column>
    <Column field="server" header="Server">
      <template #body="props">
        <router-link :to="'/servers/' + props.data.server.id">
          <p>{{ props.data.server.name }}</p>
        </router-link>
        <p v-if="props.data.server.prettyOs" class="text-xs mt-1">
          {{ props.data.server.prettyOs }}
        </p>
      </template>
    </Column>
    <Column field="status" header="Status">
      <template #body="props">
        <Tag :value="props.data.status" :severity="convertFluxStatusToColor(props.data.status)" />
      </template>
    </Column>
    <Column field="createdAt" header="Created">
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
            action-button-severity="danger"
            action-button-label="Delete"
            :action-message="() => generateDeletionMessage(props.data, 'flux')"
            @action="deleteFlux(props.data.id)"
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
import { useDeleteFluxMutation, useFluxorQuery } from "@/api/useFluxor";
import { convertFluxStatusToColor } from "@/utils/types/flux.type";

const router = useRouter();

const { data, totalItems, isFetching, refetch, pagination } = useFluxorQuery();
const { mutate: deleteFlux } = useDeleteFluxMutation();
</script>
