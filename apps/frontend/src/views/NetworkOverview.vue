<template>
  <TitleHeader title="Networks">
    <template #right>
      <DialogButton
        label="Add"
        action-button-label="Save"
        header="Add new network"
        description="Create a new docker network to connect your services"
        @action="createNetwork()"
        @cancel="reset()"
      >
        <div class="flex flex-col gap-4">
          <InputTextLabel v-model:data="dto.name" label="Name" required />
          <InputSelectLabel
            v-model:data="dto.server"
            label="Server"
            :options="servers"
            required
            :is-fetching="isFetchingServers"
            :lazy-loading="{
              load: loadServers
            }"
            @refresh-data="refetchServers"
          />
        </div>
      </DialogButton>

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
    :items="networks?.data"
    :filter-fields="['name', 'server']"
    item-name="server"
    :total-items="totalItems"
    :is-loading="isFetching"
    @pagination="pagination.update"
    @delete-items="(items) => items.forEach((item) => deleteNetwork(item.id))"
  >
    <Column field="name" header="Name" sortable>
      <template #body="props">
        <router-link :to="'/networks/' + props.data.id">
          <p>{{ props.data.name }}</p>
        </router-link>
        <p v-if="props.data.prettyOs" class="text-xs mt-1">{{ props.data.prettyOs }}</p>
      </template>
    </Column>
    <Column field="server" header="Server" sortable>
      <template #body="props">
        <router-link :to="'/servers/' + props.data.server.id">
          <p>{{ props.data.server.name }}</p>
        </router-link>
        <p v-if="props.data.server.prettyOs" class="text-xs mt-1">
          {{ props.data.server.prettyOs }}
        </p>
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
        <ConfirmButton
          text
          icon="pi pi-trash"
          severity="danger"
          action-button-label="Delete"
          action-button-severity="danger"
          :disabled="props.data.default"
          :action-message="() => generateDeletionMessage(props.data, 'network')"
          outlined
          @action="deleteNetwork(props.data.id)"
        />
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
import DialogButton from "@/components/DialogButton.vue";
import InputTextLabel from "@/components/InputTextLabel.vue";
import ConfirmButton from "@/components/ConfirmButton.vue";
import { useLazyServersQuery } from "@/api/useServers";
import InputSelectLabel from "@/components/InputSelectLabel.vue";
import {
  useCreateNetworkMutation,
  useDeleteNetworkMutation,
  useNetworksQuery
} from "@/api/useNetworks";

const {
  items: servers,
  refetch: refetchServers,
  load: loadServers,
  isFetching: isFetchingServers
} = useLazyServersQuery();

const { data: networks, totalItems, isFetching, pagination, refetch } = useNetworksQuery();
const { mutate: createNetwork, dto, reset } = useCreateNetworkMutation();
const { mutate: deleteNetwork } = useDeleteNetworkMutation();
</script>
