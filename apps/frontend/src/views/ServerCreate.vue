<template>
  <TitleHeader title="New server">
    <template #right>
      <Button label="Back" severity="secondary" size="small" outlined @click="router.go(-1)" />
    </template>
  </TitleHeader>

  <Stepper v-model:value="step" class="mt-4" linear>
    <StepList>
      <Step :value="1">Details</Step>
      <Step :value="2">Installation</Step>
      <Step :value="3">Proxy</Step>
    </StepList>
    <StepPanels>
      <StepPanel :value="1" class="flex flex-col gap-4">
        <InputTextLabel
          v-model:data="serverDto.name"
          v-model:validation-errors="createServerValidationErrors['name']"
          label="Name"
          required
        />

        <InputAreaLabel
          v-model:data="serverDto.description"
          v-model:validation-errors="createServerValidationErrors['description']"
          title="Description"
          placeholder="Optional"
        />

        <div class="flex gap-4">
          <InputTextLabel
            v-model:data="serverDto.ip"
            v-model:validation-errors="createServerValidationErrors['ip']"
            label="IP Address"
            required
            class="w-4/5"
          />

          <InputNumberLabel
            v-model:data="serverDto.port"
            v-model:validation-errors="createServerValidationErrors['port']"
            label="SSH Port"
            :min="0"
            :max="65536"
            class="w-1/5"
          />
        </div>

        <InputTextLabel
          v-model:data="serverDto.user"
          v-model:validation-errors="createServerValidationErrors['user']"
          label="User"
          required
        />

        <InputSelectLabel
          v-model:data="serverDto.privateKey"
          v-model:validation-errors="createServerValidationErrors['privateKey']"
          label="SSH Key"
          placeholder="Select..."
          :options="privateKeys"
          required
          :is-fetching="isFetchingPrivateKeys"
          :lazy-loading="{
            load: loadPrivateKeys
          }"
          @refresh-data="refetchPrivateKeys"
        />

        <div class="flex justify-end gap-2">
          <ConfirmButton
            label="Reset"
            severity="secondary"
            :action-message="() => 'Are you sure you want to reset the form?'"
            action-button-label="Reset"
            action-button-severity="danger"
            :disabled="isServerPending || !!server?.id"
            @action="resetServer()"
          />
          <Button
            :label="!isServerPending ? 'Save' : ''"
            :icon="isServerPending ? 'pi pi-spin pi-spinner' : ''"
            :disabled="isServerPending || !!server?.id"
            @click="
              createServer(undefined, {
                onSuccess: () => (step = 2)
              })
            "
          />
        </div>
      </StepPanel>
      <StepPanel v-slot="{ activateCallback }" :value="2">
        <div class="flex flex-col gap-4">
          <div class="flex gap-2">
            <div class="p-inputtext flex items-center w-full">
              <p v-if="isConnectivityPending" class="w-full">Checking connectivity...</p>
              <p v-if="isConnectivitySuccessful" class="w-full">Successfully connected...</p>
              <p v-if="isConnectivityError" class="w-full">
                Verify the server connection and press the Refresh button.
              </p>
              <ProgressSpinner
                v-if="connectivity === ServerStatus.PENDING || isConnectivityPending"
                class="w-5 h-5"
                stroke-width="6"
              />
              <i
                v-if="connectivity === ServerStatus.ONLINE"
                class="pi pi-check text-xl text-green-500"
              />
              <i
                v-if="connectivity === ServerStatus.OFFLINE || isConnectivityError"
                class="pi pi-times text-xl text-red-500"
              />
            </div>
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              :disabled="connectivity === ServerStatus.ONLINE"
              @click="refetchConnectivity()"
            />
          </div>

          <Panel header="Preparing the Server for Use with Cosmify:">
            <ul class="list-disc pl-6">
              <li>Fetch server information</li>
              <li>Upgrade OS packages</li>
              <li>Install Docker</li>
              <li>Create default Docker network</li>
            </ul>

            <div class="flex mt-4">
              <ConfirmButton
                severity="primary"
                action-message="Proceed with the initialization?"
                action-button-label="Accept"
                action-button-severity="primary"
                size="small"
                label="Initialize"
                :disabled="
                  !serverId ||
                    connectivity !== ServerStatus.ONLINE ||
                    (transaction?.id !== undefined && transaction?.status !== TransactionStatus.ERROR)
                "
                @action="serverId && initServer(serverId)"
              />
            </div>
          </Panel>

          <div class="flex flex-col gap-4">
            <ActionPanel v-for="action in transaction?.actions" :key="action.id" :action="action" />
          </div>
        </div>
        <div class="flex pt-6 justify-between">
          <StepperNextButton
            :disabled="transaction?.status !== TransactionStatus.SUCCESS"
            @click="activateCallback(3)"
          />
        </div>
      </StepPanel>
      <StepPanel v-slot="{ activateCallback }" :value="3" class="flex flex-col gap-4">
        <FluxCreationPanel :dto="proxyDto" :validation-errors="proxyValidationErrors" />

        <div class="flex gap-2">
          <StepperBackButton @click="activateCallback(2)" />
          <Button
            :label="!isProxyPending || !proxy ? 'Save' : ''"
            :icon="isProxyPending ? 'pi pi-spin pi-spinner' : proxy ? 'pi pi-check-circle' : ''"
            :disabled="isProxyPending || proxy !== undefined"
            class="ml-auto"
            @click="createProxy()"
          />
        </div>
      </StepPanel>
    </StepPanels>
  </Stepper>
</template>

<script setup lang="ts">
import TitleHeader from "@/components/TitleHeader.vue";
import { computed, ref, watch } from "vue";
import InputTextLabel from "@/components/InputTextLabel.vue";
import InputAreaLabel from "@/components/InputAreaLabel.vue";
import InputNumberLabel from "@/components/InputNumberLabel.vue";
import { useRouter } from "vue-router";
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import StepPanels from "primevue/steppanels";
import Step from "primevue/step";
import StepPanel from "primevue/steppanel";
import { ServerStatus } from "@/utils/types/action.type";
import ConfirmButton from "@/components/ConfirmButton.vue";
import { newProxyFluxDto } from "@/utils/types/flux.type";
import StepperBackButton from "@/components/StepperBackButton.vue";
import StepperNextButton from "@/components/StepperNextButton.vue";
import ActionPanel from "@/components/ActionPanel.vue";
import {
  useCreateServerMutation,
  useInitServerMutation,
  useServerDefaultNetworkQuery
} from "@/api/useServers";
import { useLazyPrivateKeyQuery } from "@/api/usePrivateKeys";
import InputSelectLabel from "@/components/InputSelectLabel.vue";
import { useServerConnectivityActionQuery } from "@/api/useActions";
import { TransactionStatus } from "@/utils/types/transaction.type";
import { useTransactionQuery } from "@/api/useTransactions";
import { useCreateFluxorMutation } from "@/api/useFluxor";
import FluxCreationPanel from "@/components/FluxCreationPanel.vue";
import { authClient } from "@/utils/auth";

const router = useRouter();

const step = ref<number>(1);

const {
  items: privateKeys,
  refetch: refetchPrivateKeys,
  load: loadPrivateKeys,
  isFetching: isFetchingPrivateKeys
} = useLazyPrivateKeyQuery();

const {
  mutate: createServer,
  data: server,
  validationErrors: createServerValidationErrors,
  dto: serverDto,
  isPending: isServerPending,
  reset: resetServer
} = useCreateServerMutation();

const serverId = computed(() => server.value?.id);

const {
  isPending: isConnectivityPending,
  isSuccess: isConnectivitySuccessful,
  isError: isConnectivityError,
  data: connectivity,
  refetch: refetchConnectivity
} = useServerConnectivityActionQuery(serverId);

const { data: initTransactionId, mutate: initServer } = useInitServerMutation();
const { data: transaction } = useTransactionQuery(initTransactionId);

const { data: defaultNetwork, refetch: refetchDefaultNetwork } =
  useServerDefaultNetworkQuery(serverId);

const session = await authClient.getSession();
const user = session.data?.user;

const {
  mutate: createProxy,
  data: proxy,
  validationErrors: proxyValidationErrors,
  dto: proxyDto,
  isPending: isProxyPending,
  reset: resetProxy
} = useCreateFluxorMutation(() =>
  newProxyFluxDto({
    serverId: serverId.value || "",
    email: user?.email || "",
    networkIds: defaultNetwork.value?.id ? [defaultNetwork.value?.id] : []
  })
);

watch(
  () => transaction.value?.status,
  async () => {
    if (transaction.value?.status !== TransactionStatus.SUCCESS) return;
    await refetchDefaultNetwork();
    resetProxy();
  }
);
</script>
