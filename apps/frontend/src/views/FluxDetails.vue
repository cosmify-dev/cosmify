<template>
  <TitleHeader :title="`Flux (${flux?.name})`">
    <template #left>
      <Tag :value="flux?.status" :severity="convertFluxStatusToColor(flux?.status)" />
    </template>

    <template #right>
      <Button
        icon="pi pi-arrow-left"
        label="Back"
        severity="secondary"
        size="small"
        outlined
        @click="router.push('/fluxor')"
      />

      <Button
        :icon="
          isFetching || isFetchingContainerStats || isFetchingContainerLogs
            ? 'pi pi-spinner pi-spin'
            : 'pi pi-sync'
        "
        label="Refresh"
        size="small"
        outlined
        :disabled="isFetching || isFetchingContainerStats || isFetchingContainerLogs"
        @click="
          refetch();
          refetchContainerLogs();
          refetchContainerStats();
          $refs.commandOverview?.refetch();
        "
      />

      <SplitButton
        :icon="flux?.status === FluxStatus.ONLINE ? 'pi pi-stop' : ''"
        outlined
        size="small"
        :label="flux?.status === FluxStatus.ONLINE ? 'Stop' : 'Start'"
        :pt="{
          pcButton: {
            root: flux?.status === FluxStatus.ONLINE ? 'text-red-500' : 'text-green-500'
          }
        }"
        :model="actionItems"
        @click="
          action({
            id: id,
            action: flux?.status === FluxStatus.ONLINE ? FluxAction.STOP : FluxAction.START
          })
        "
      />
    </template>
  </TitleHeader>

  <Tabs value="overview">
    <TabList>
      <Tab value="overview" :disabled="!flux"> Overview </Tab>
      <Tab value="configuration" :disabled="!flux"> Configuration </Tab>
      <Tab value="logs" :disabled="!flux"> Container Logs </Tab>
      <Tab value="commands" :disabled="!flux"> Commands </Tab>
      <Tab value="settings" :disabled="!flux"> Settings </Tab>
    </TabList>
    <TabPanels v-if="flux" class="-mx-4">
      <TabPanel value="overview">
        <div class="flex flex-col gap-4">
          <InputTextLabel v-model:data="flux.name" label="Name" disabled />
          <InputTextLabel v-model:data="flux.server.name" label="Server" disabled />
        </div>

        <div v-if="containerStats && !isFetchingContainerStats" class="mt-4">
          <div v-for="(value, key, index) in containerStats" :key="index">
            <h2>{{ key }}</h2>
            <div class="flex gap-4 mt-2 align-baseline">
              <Card class="bg-primary-800 flex-grow">
                <template #title>
                  <div class="flex justify-center font-bold">CPU Percentage</div>
                </template>
                <template #content>
                  <div class="flex justify-center">
                    <Knob
                      v-model="parseContainerStats(value).cpuUsage"
                      readonly
                      :show-value="false"
                      :max="100"
                      :step="0.1"
                    />
                  </div>
                </template>
                <template #footer>
                  <div class="flex justify-center text-xl">
                    {{ value.cpu_percentage }}
                  </div>
                </template>
              </Card>

              <Card class="bg-primary-800 flex-grow">
                <template #title>
                  <div class="flex justify-center font-bold">Memory Percentage</div>
                </template>
                <template #content>
                  <div class="flex justify-center">
                    <Knob
                      v-model="parseContainerStats(value).memoryUsage"
                      readonly
                      :show-value="false"
                      :max="100"
                      :step="0.1"
                    />
                  </div>
                </template>
                <template #footer>
                  <div class="flex justify-center text-xl">
                    {{ value.memory_percentage }}
                  </div>
                </template>
              </Card>

              <Card class="bg-primary-800 flex-grow">
                <template #title>
                  <div class="flex justify-center font-bold">Memory Usage</div>
                </template>
                <template #content>
                  <div class="flex justify-center">
                    <Knob
                      v-model="parseContainerStats(value).memoryUsed"
                      readonly
                      :show-value="false"
                      :max="parseContainerStats(value).memoryTotal"
                      :step="0.1"
                    />
                  </div>
                </template>
                <template #footer>
                  <div class="flex justify-center text-xl">
                    {{ value.memory_usage }}
                  </div>
                </template>
              </Card>

              <Card class="bg-primary-800 flex-grow">
                <template #title>
                  <div class="flex justify-center font-bold">Network I/O</div>
                </template>
                <template #footer>
                  <div class="flex justify-center text-xl">(rx) {{ value.network_io }} (tx)</div>
                </template>
              </Card>
            </div>
          </div>
        </div>
        <div
          v-if="!containerStats || isFetchingContainerStats"
          class="flex w-full justify-center mt-4"
        >
          <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
        </div>
      </TabPanel>
      <TabPanel value="configuration" class="flex flex-col gap-2">
        <p>docker-compose.yml</p>
        <div class="p-inputtext">
          <pre>{{ composeFile }}</pre>
        </div>
      </TabPanel>
      <TabPanel value="logs" class="flex flex-col gap-2">
        <div class="flex items-end">
          <div>
            <InputSelectLabel
              v-model:data="containerId"
              :options="flux.containers"
              label="Container"
              @refresh-data="refetch()"
            />
          </div>
          <div class="flex gap-2 ml-auto items-center">
            <div v-if="!containerLogs || isFetchingContainerLogs">
              <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
            </div>

            <Button label="Last 1h" severity="secondary" @click="setTimeframe(60)" />

            <DatePicker
              id="from"
              v-model="from"
              show-icon
              show-time
              hour-format="24"
              fluid
              date-format="dd/mm/yy"
              :max-date="new Date()"
            />
            <DatePicker
              id="from"
              v-model="to"
              show-icon
              show-time
              hour-format="24"
              fluid
              date-format="dd/mm/yy"
              :max-date="new Date()"
            />
          </div>
        </div>

        <div v-if="!containerId">No container selected!</div>
        <div v-if="containerLogs && containerId" class="flex flex-col gap-2">
          <div>
            <label class="font-bold mb-1.5">stdout</label>
            <div class="p-inputtext">
              <pre class="overflow-x-auto">{{ containerLogs.stdout || "Empty" }}</pre>
            </div>
          </div>

          <div>
            <label for="console" class="font-bold mb-2">stderr</label>
            <div id="console" class="p-inputtext">
              <pre id="console" class="overflow-x-auto">{{ containerLogs.stderr || "Empty" }}</pre>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel value="commands">
        <CommandOverview :id="id" ref="commandOverview" uri="/v1/fluxor" />
      </TabPanel>
      <TabPanel value="settings">
        <div class="flex flex-col gap-4">
          <Panel header="Settings">
            <div class="flex flex-col gap-4">
              <InputNumberLabel
                v-model:data="dto.shutdownTimeout"
                label="Shutdown Timeout"
                :validation-errors="validationErrors['shutdownTimeout']"
                :min="0"
                suffix=" seconds"
              />

              <div>
                <Button label="Save" :disabled="!isUpdated" @click="updateFlux()" />
              </div>
            </div>
          </Panel>

          <Panel header="Danger zone">
            <ConfirmButton
              label="Delete"
              size="small"
              severity="danger"
              action-button-label="Delete"
              action-button-severity="danger"
              :action-message="() => 'Are you sure you want to delete this flux?'"
              @action="
                deleteFlux(id, {
                  onSuccess: () => router.push('/fluxor')
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
import { ref, watch } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import InputTextLabel from "@/components/InputTextLabel.vue";
import DatePicker from "primevue/datepicker";
import { subMinutes } from "date-fns";
import ConfirmButton from "@/components/ConfirmButton.vue";
import { useRouter } from "vue-router";
import {
  useContainerLogsQuery,
  useContainerStatsQuery,
  useDeleteFluxMutation,
  useFluxActionMutation,
  useFluxQuery,
  useFluxUpdateMutation
} from "@/api/useFluxor";
import { watchDebounced } from "@vueuse/core";
import InputSelectLabel from "@/components/InputSelectLabel.vue";
import InputNumberLabel from "@/components/InputNumberLabel.vue";
import { convertFluxStatusToColor, FluxAction, parseContainerStats } from "@/utils/types/flux.type";
import { FluxStatus } from "@/utils/types/action.type";
import CommandOverview from "@/components/CommandOverview.vue";
import Button from "primevue/button";

const router = useRouter();

const props = defineProps<{
  id: string;
}>();

const from = ref<Date>(subMinutes(new Date(), 60));
const to = ref<Date>(new Date());
const containerId = ref<string>("");

function setTimeframe(amount: number) {
  from.value = subMinutes(new Date(), amount);
  to.value = new Date();
}

watchDebounced(
  [from, to, containerId],
  async () => {
    await refetchContainerLogs();
  },
  {
    debounce: 750
  }
);

const { data: flux, refetch, composeFile, isFetching } = useFluxQuery(props.id);
const {
  data: containerStats,
  isFetching: isFetchingContainerStats,
  refetch: refetchContainerStats
} = useContainerStatsQuery(props.id);

const { mutate: updateFlux, validationErrors, dto, isUpdated } = useFluxUpdateMutation(flux);

watch(
  () => flux.value?.containers,
  () => {
    if (!flux.value?.containers || flux.value.containers.length < 1) return;
    containerId.value = flux.value.containers[0].id;
  },
  {
    immediate: true
  }
);

const {
  data: containerLogs,
  isFetching: isFetchingContainerLogs,
  refetch: refetchContainerLogs
} = useContainerLogsQuery(props.id, containerId, from, to);

const { mutate: action } = useFluxActionMutation();
const { mutate: deleteFlux } = useDeleteFluxMutation();

const actionItems = [
  {
    label: "Restart",
    icon: "pi pi-refresh",
    command: () => {
      action({
        id: props.id,
        action: FluxAction.RESTART
      });
    }
  },
  {
    label: "Refresh images",
    icon: "pi pi-download",
    command: () => {
      action({
        id: props.id,
        action: FluxAction.REFRESH_IMAGES
      });
    }
  }
];
</script>
