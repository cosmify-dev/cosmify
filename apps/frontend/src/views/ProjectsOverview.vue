<template>
  <TitleHeader title="Projects">
    <template #right>
      <DialogButton
        label="Add"
        action-button-label="Save"
        header="New project"
        description="Create a new project to group Services together"
        @action="createProject()"
        @cancel="reset()"
      >
        <InputTextLabel
          v-model:data="dto.name"
          label="Name"
          required
          :validation-errors="validationErrors['name']"
        />

        <InputTextLabel
          v-model:data="dto.logoUrl"
          label="Logo URL"
          :validation-errors="validationErrors['logoUrl']"
        />

        <InputArrayLabel
          v-model:items="dto.environments"
          v-model:validation-errors="validationErrors['environments']"
          title="Environments"
          @add-item="dto.environments = [...dto.environments, newCreateEnvironmentDto()]"
        >
          <template #default="{ item, index, remove, validationErrors }">
            <div class="flex gap-2 items-start">
              <InputTextLabel
                v-model:data="item['name']"
                v-model:validation-errors="validationErrors['name']"
                class="flex-grow min-w-20"
              />
              <div>
                <Button
                  severity="danger"
                  class="w-full aspect-square font-extrabold"
                  label="-"
                  outlined
                  @click="remove(index)"
                />
              </div>
            </div>
          </template>
        </InputArrayLabel>
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

  <IconField class="w-full mt-4">
    <InputIcon class="pi pi-search" />
    <InputText placeholder="Search" class="w-full" />
  </IconField>

  <div class="columns-3 mt-4">
    <Panel
      v-for="project in projects?.data"
      :key="project.id"
      :header="project.name"
      class="break-inside-avoid-column mb-4"
    >
      <template #header>
        <div class="flex flex-col w-full">
          <div v-if="project.logoUrl" class="flex w-full justify-center">
            <img alt="Project Logo" :src="project.logoUrl" />
          </div>
          <span class="font-bold text-xl">{{ project.name }}</span>
        </div>
      </template>

      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <Button icon="pi pi-arrow-right" text @click="router.push(`/projects/${project.id}`)" />
          </div>
          <span class="text-surface-500 dark:text-surface-400 ml-auto">
            {{ `Updated ${formatDistanceToNow(project.updatedAt, { includeSeconds: true })} ago` }}
          </span>
        </div>
      </template>
    </Panel>
  </div>
</template>

<script lang="ts" setup>
import TitleHeader from "@/components/TitleHeader.vue";
import { useCreateProjectMutation, useProjectsQuery } from "@/api/useProjects";
import { formatDistanceToNow } from "date-fns";
import InputTextLabel from "@/components/InputTextLabel.vue";
import DialogButton from "@/components/DialogButton.vue";
import InputArrayLabel from "@/components/InputArrayLabel.vue";
import { newCreateEnvironmentDto } from "@/utils/types/project.type";
import { useRouter } from "vue-router";

const router = useRouter();

const { data: projects, refetch, isFetching } = useProjectsQuery();
const { mutate: createProject, dto, validationErrors, reset } = useCreateProjectMutation();
</script>
