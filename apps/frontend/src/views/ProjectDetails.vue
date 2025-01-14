<template>
  <TitleHeader :title="`Project (${project?.name})`">
    <template #right>
      <Button label="Add" size="small" outlined @click="createFlux()" />

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

  <Tabs value="overview">
    <TabList>
      <Tab value="general" :disabled="!project">Overview</Tab>
      <Tab value="resources" :disabled="!project">Resources</Tab>
      <Tab value="settings" :disabled="!project">Settings</Tab>
    </TabList>
    <TabPanels v-if="project" class="-mx-4">
      <TabPanel value="overview">
        <div class="flex flex-col gap-4">
          <InputTextLabel v-model:data="project.name" label="Name" disabled />
        </div>
      </TabPanel>
      <TabPanel value="resources" class="flex flex-col gap-2">
        <div class="flex gap-2 ml-auto items-center">
          <InputSelectLabel
            v-model:data="environment"
            label="Environment"
            class="w-64"
            :options="project.environments"
          />
        </div>
      </TabPanel>
      <TabPanel value="settings">
        <div class="flex flex-col gap-4">
          <Panel header="Danger zone">
            <ConfirmButton
              label="Delete"
              size="small"
              severity="danger"
              action-button-label="Delete"
              action-button-severity="danger"
              :action-message="() => 'Are you sure you want to delete this project?'"
              @action="
                deleteProject(id, {
                  onSuccess: () => router.push('/projects')
                })
              "
            />
          </Panel>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script lang="ts" setup>
import TitleHeader from "@/components/TitleHeader.vue";
import { useDeleteProjectMutation, useProjectQuery } from "@/api/useProjects";
import Button from "primevue/button";
import InputTextLabel from "@/components/InputTextLabel.vue";
import ConfirmButton from "@/components/ConfirmButton.vue";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import TabPanel from "primevue/tabpanel";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import { useRouter } from "vue-router";
import InputSelectLabel from "@/components/InputSelectLabel.vue";
import { ref, watch } from "vue";

const router = useRouter();

const props = defineProps<{
  id: string;
}>();

const { data: project, refetch, isFetching } = useProjectQuery(props.id);
const { mutate: deleteProject } = useDeleteProjectMutation();

const environment = ref<string>(project.value?.environments[0].id || "");

watch(
  () => project.value,
  () => {
    console.log(environment.value, project.value);
    if (environment.value !== "" || !project.value) return;
    environment.value = project.value.environments[0].id;
    console.log(environment.value);
  }
);

const createFlux = async (): Promise<void> => {
  await router.push({
    path: "/fluxor/create",
    query: {
      project: project.value?.id,
      environment: environment.value
    }
  });
};
</script>
