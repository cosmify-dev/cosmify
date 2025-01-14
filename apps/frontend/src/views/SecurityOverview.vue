<template>
  <TitleHeader title="Security">
    <template #right>
      <DialogButton
        label="Add"
        action-button-label="Save"
        header="Add SSH key"
        description="Enter your private SSH key to connect to your servers"
        @action="createPrivateKey()"
        @cancel="reset()"
      >
        <InputTextLabel
          v-model:data="dto.name"
          label="Name"
          required
          :validation-errors="validationErrors['name']"
        />
        <InputAreaLabel
          v-model:data="dto.data"
          :validation-errors="validationErrors['data']"
          title="SSH Key"
          placeholder="Paste your private SSH key here"
          required
          class="mt-4"
        />
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
    :items="data?.data"
    :filter-fields="['name', 'createdAt']"
    item-name="SSH key"
    :total-items="totalItems"
    :is-loading="isFetching"
    @pagination="pagination.update"
    @delete-items="(items) => items.forEach((value) => deletePrivateKey(value.id))"
  >
    <Column field="name" header="Name" />

    <Column field="createdAt" header="Created">
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
          action-button-severity="danger"
          action-button-label="Delete"
          :action-message="() => generateDeletionMessage(props.data, 'SSH key')"
          @action="deletePrivateKey(props.data.id)"
        />
      </template>
    </Column>
  </OverviewDataTable>
</template>

<script setup lang="ts">
import TitleHeader from "@/components/TitleHeader.vue";
import OverviewDataTable from "@/components/OverviewDataTable.vue";
import { generateDeletionMessage } from "@/utils";
import { formatRelative } from "date-fns";
import InputTextLabel from "@/components/InputTextLabel.vue";
import InputAreaLabel from "@/components/InputAreaLabel.vue";
import DialogButton from "@/components/DialogButton.vue";
import ConfirmButton from "@/components/ConfirmButton.vue";
import {
  useCreatePrivateKeyMutation,
  useDeletePrivateKeyMutation,
  usePrivateKeysQuery
} from "@/api/usePrivateKeys";

const { data, totalItems, isFetching, pagination, refetch } = usePrivateKeysQuery();
const { mutate: createPrivateKey, dto, reset, validationErrors } = useCreatePrivateKeyMutation();
const { mutate: deletePrivateKey } = useDeletePrivateKeyMutation();
</script>
