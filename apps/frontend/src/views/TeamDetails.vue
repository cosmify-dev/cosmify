<template>
  <TitleHeader title="Team" />

  <Tabs value="settings">
    <TabList>
      <!-- <Tab value="members" :disabled="!activeOrganization.data"> Members </Tab> -->
      <Tab value="settings" :disabled="!activeOrganization.data"> Settings </Tab>
    </TabList>
    <TabPanels v-if="activeOrganization.data" class="-mx-4">
      <TabPanel value="members">
        <TeamMemberOverview />
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
import { ref, watch } from "vue";
import type { UpdateTeamDto } from "@/utils/types/team.type";
import { authClient } from "@/utils/auth";
import Tab from "primevue/tab";
import TabPanel from "primevue/tabpanel";
import Tabs from "primevue/tabs";
import TabPanels from "primevue/tabpanels";
import TabList from "primevue/tablist";

const activeOrganization = authClient.useActiveOrganization();

const teamDto = ref<UpdateTeamDto>({
  name: ""
});

watch(
  () => activeOrganization.value,
  () => {
    teamDto.value.name = activeOrganization.value?.data?.name;
  },
  {
    immediate: true
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
