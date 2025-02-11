<template>
  <TitleHeader title="Team" />

  <Tabs value="members">
    <TabList>
      <Tab value="members" :disabled="!activeOrganization.data"> Members </Tab>
      <Tab value="settings" :disabled="!activeOrganization.data"> Settings </Tab>
    </TabList>
    <TabPanels v-if="activeOrganization.data" class="-mx-4">
      <TabPanel value="members">
        <DataTable
          :value="members"
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
          <Column selection-mode="multiple" header-style="width: 3rem" />
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
      </TabPanel>
      <TabPanel value="settings">
        <div class="flex mt-4 flex-col gap-4">
          <InputTextLabel v-model:data="teamDto.name" label="Name" />

          <div>
            <Button
              label="Save"
              :disabled="activeOrganization.data?.name === teamDto.name"
              @click="updateOrganization()"
            />
          </div>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import TitleHeader from "@/components/TitleHeader.vue";
import InputTextLabel from "@/components/InputTextLabel.vue";
import { computed, ref, watch } from "vue";
import type { UpdateTeamDto } from "@/utils/types/team.type";
import { authClient } from "@/utils/auth";
import Tab from "primevue/tab";
import TabPanel from "primevue/tabpanel";
import Tabs from "primevue/tabs";
import TabPanels from "primevue/tabpanels";
import TabList from "primevue/tablist";

const activeOrganization = authClient.useActiveOrganization();
const members = computed(() => activeOrganization.value.data?.members);

const teamDto = ref<UpdateTeamDto>({
  name: activeOrganization.value.data?.name
});

watch(
  () => activeOrganization.value,
  () => {
    teamDto.value.name = activeOrganization.value?.data?.name;
  }
);

const updateOrganization = () => {
  authClient.organization.update({
    data: {
      name: teamDto.value.name
    }
  });
};
</script>
