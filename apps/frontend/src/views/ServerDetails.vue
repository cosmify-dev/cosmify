<template>
  <TitleHeader title="Server">
    <template #left>
      <Tag :value="server?.status" :severity="convertServerStatusToColor(server?.status)" small />
    </template>

    <template #right>
      <Button
        icon="pi pi-arrow-left"
        label="Back"
        severity="secondary"
        size="small"
        outlined
        @click="router.push('/servers')"
      />

      <Button
        :icon="isFetching || isFetchingUptime ? 'pi pi-spinner pi-spin' : 'pi pi-sync'"
        label="Refresh"
        size="small"
        outlined
        :disabled="isFetching || isFetchingUptime"
        @click="
          refetch();
          refetchUptime();
          $refs.commandOverview?.refetch();
        "
      />

      <Button
        v-if="server?.status === ServerStatus.PENDING"
        label="Init"
        size="small"
        severity="warn"
        :disabled="
          !(transaction?.status === undefined || transaction?.status === TransactionStatus.ERROR)
        "
        @click="
          initServer(server.id);
          dialogVisible = true;
        "
      />
    </template>
  </TitleHeader>

  <div class="flex align-middle gap-2 mt-2">
    <p class="text-sm text-gray-300 my-auto">
      {{ server?.name }}{{ server?.ip ? ` | ${server.ip}` : ""
      }}{{ server?.prettyOs ? ` | ${server.prettyOs}` : "" }}{{ uptime ? ` | ${uptime}` : "" }}
    </p>
  </div>

  <Message
    v-if="server?.status === ServerStatus.PENDING && transaction?.status === undefined"
    severity="warn"
    closable
    class="mt-2"
  >
    Server must be initialized before it can be used!
  </Message>

  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Initializing server..."
    :style="{ width: '64rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="flex flex-col gap-4">
      <Message v-if="transaction?.status === TransactionStatus.SUCCESS" severity="success">
        Server initialization successfully completed!
      </Message>
      <Message v-if="transaction?.status === TransactionStatus.ERROR" severity="error">
        Server initialization failed. Please check the configuration and try again.
      </Message>
      <ActionPanel v-for="action in transaction?.actions" :key="action.id" :action="action" />
    </div>
  </Dialog>

  <Tabs value="general">
    <TabList>
      <Tab value="general" :disabled="!server">General</Tab>
      <Tab value="commands" :disabled="!server">Commands</Tab>
      <Tab value="settings" :disabled="!server">Settings</Tab>
    </TabList>
    <TabPanels v-if="server" class="-mx-4">
      <TabPanel value="general">
        <div class="flex flex-col gap-4">
          <InputTextLabel v-model:data="server.name" label="Name" />
          <InputAreaLabel v-model:data="server.description" title="Description" />
          <InputNumberLabel v-model:data="server.port" label="SSH Port" />
          <InputTextLabel v-model:data="server.user" label="User" />
          <div class="flex">
            <Button
              label="Save"
              size="small"
              @click="
                updateServer({
                  id: server.id,
                  dto: {
                    name: server.name,
                    description: server.description,
                    port: server.port,
                    user: server.user
                  }
                })
              "
            />
          </div>
        </div>
      </TabPanel>
      <TabPanel value="commands">
        <CommandOverview :id="id" ref="commandOverview" uri="/v1/servers" />
      </TabPanel>
      <TabPanel value="settings">
        <div class="flex flex-col gap-4">
          <Panel header="Security">
            <div class="flex flex-col gap-4">
              <InputSelectLabel
                v-model:data="privateKeyIdDto"
                label="SSH Key"
                :options="privateKeys"
                placeholder="Select..."
                :is-fetching="isFetchingPrivateKeys"
                :lazy-loading="{
                  load: loadPrivateKeys
                }"
                @refresh-data="refetchPrivateKeys"
              />
              <div class="flex">
                <Button
                  label="Save"
                  size="small"
                  :disabled="server.privateKey === privateKeyIdDto"
                  @click="
                    updateServer({
                      id: server.id,
                      dto: {
                        privateKey: privateKeyIdDto
                      }
                    })
                  "
                />
              </div>
            </div>
          </Panel>
          <Panel header="Danger zone">
            <ConfirmButton
              size="small"
              label="Delete"
              severity="danger"
              :action-message="() => 'Are you sure you want to delete this server?'"
              action-button-label="Delete"
              action-button-severity="danger"
              @action="
                deleteServer(server.id, {
                  onSuccess: () => router.push('/servers')
                })
              "
            />
          </Panel>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import TitleHeader from "@/components/TitleHeader.vue";
import { computed, ref } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import InputTextLabel from "@/components/InputTextLabel.vue";
import InputNumberLabel from "@/components/InputNumberLabel.vue";
import InputAreaLabel from "@/components/InputAreaLabel.vue";
import CommandOverview from "@/components/CommandOverview.vue";
import ConfirmButton from "@/components/ConfirmButton.vue";
import { useRouter } from "vue-router";
import InputSelectLabel from "@/components/InputSelectLabel.vue";
import { AxiosError } from "axios";
import {
  useDeleteServerMutation,
  useInitServerMutation,
  useServerQuery,
  useUpdateServerMutation
} from "@/api/useServers";
import { useLazyPrivateKeyQuery } from "@/api/usePrivateKeys";
import { useUptimeActionQuery } from "@/api/useActions";
import { ServerStatus } from "@/utils/types/action.type";
import { useTransactionQuery } from "@/api/useTransactions";
import { TransactionStatus } from "@/utils/types/transaction.type";
import ActionPanel from "@/components/ActionPanel.vue";
import { convertServerStatusToColor } from "@/utils/types/server.type";
import Button from "primevue/button";
import { convertFluxStatusToColor } from "@/utils/types/flux.type";

const router = useRouter();

const props = defineProps<{
  id: string;
}>();

const {
  data: server,
  refetch,
  isFetching
} = useServerQuery(props.id, {
  async onError(error) {
    if (error instanceof AxiosError && error.response?.status === 404)
      await router.push("/servers");
  }
});

const privateKeyIdDto = computed(() => server.value?.privateKey);

const {
  items: privateKeys,
  refetch: refetchPrivateKeys,
  load: loadPrivateKeys,
  isFetching: isFetchingPrivateKeys
} = useLazyPrivateKeyQuery(privateKeyIdDto);

const { mutate: initServer, data: initTransactionId } = useInitServerMutation();
const { data: transaction } = useTransactionQuery(initTransactionId);
const dialogVisible = ref(false);

const { mutate: updateServer } = useUpdateServerMutation();
const { mutate: deleteServer } = useDeleteServerMutation();

const {
  data: uptime,
  refetch: refetchUptime,
  isFetching: isFetchingUptime
} = useUptimeActionQuery(props.id);
</script>
