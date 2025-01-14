<template>
  <Tabs value="general">
    <TabList>
      <Tab value="general">General</Tab>
      <Tab value="containers">
        Containers
        <Badge
          v-if="dto.containers?.length > 0"
          :value="dto.containers.length"
          severity="primary"
          size="small"
        />
      </Tab>
    </TabList>

    <TabPanels class="-mx-4">
      <TabPanel value="general">
        <div class="flex flex-col gap-4">
          <InputSelectLabel
            v-model:data="dto.project"
            v-model:validation-errors="validationErrors['project']"
            label="Project"
            :options="projects"
            placeholder="Select project"
            :is-fetching="isFetchingProjects"
            :lazy-loading="{
              load: loadProjects
            }"
            @refresh-data="refetchProjects"
          />

          <InputSelectLabel
            v-model:data="dto.environment"
            v-model:validation-errors="validationErrors['environment']"
            label="Environment"
            :options="selectedProject?.environments"
            placeholder="Select environment"
            :is-fetching="isFetchingProjects"
            @refresh-data="refetchProjects"
          />

          <InputTextLabel
            v-model:data="dto.name"
            v-model:validation-errors="validationErrors['name']"
            label="Name"
            required
          />

          <InputSelectLabel
            v-model:data="dto.server"
            v-model:validation-errors="validationErrors['server']"
            label="Server"
            :options="servers"
            placeholder="Select server"
            required
            :is-fetching="isFetchingServers"
            :lazy-loading="{
              load: loadServers
            }"
            @refresh-data="refetchServers"
          />
        </div>
      </TabPanel>
      <TabPanel value="containers">
        <div class="flex flex-col gap-4">
          <div class="ml-auto">
            <Button
              label="Add"
              size="small"
              outlined
              @click="dto.containers = [...dto.containers, emptyCreateContainerDto()]"
            />
          </div>

          <Panel
            v-for="(container, index) in dto.containers"
            :key="index"
            :header="container.name || 'Container'"
            toggleable
          >
            <template #icons>
              <Button
                icon="pi pi-trash"
                severity="secondary"
                rounded
                text
                class="mr-1"
                @click="dto.containers = dto.containers.filter((_, i) => index !== i)"
              />
            </template>
            <ContainerCreationPanel
              :validation-errors="validationErrors?.['containers']?.[index] || {}"
              :dto="container"
            />
          </Panel>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script lang="ts" setup>
import { type CreateFluxDto, emptyCreateContainerDto } from "@/utils/types/flux.type";
import InputTextLabel from "@/components/InputTextLabel.vue";
import InputSelectLabel from "@/components/InputSelectLabel.vue";
import ContainerCreationPanel from "@/components/ContainerCreationPanel.vue";
import { computed } from "vue";
import { useLazyServersQuery } from "@/api/useServers";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { useLazyProjectsQuery } from "@/api/useProjects";

const dto = defineModel<CreateFluxDto>("dto", {
  required: true
});

const validationErrors = defineModel<never>("validationErrors", {
  required: true
});

const serverId = computed(() => dto.value.server);
const projectId = computed(() => dto.value.project);

const {
  items: servers,
  refetch: refetchServers,
  load: loadServers,
  isFetching: isFetchingServers
} = useLazyServersQuery(serverId);

const {
  items: projects,
  refetch: refetchProjects,
  load: loadProjects,
  isFetching: isFetchingProjects,
  selectedItem: selectedProject
} = useLazyProjectsQuery(projectId);
</script>
