<template>
  <TitleHeader title="New Flux">
    <template #right>
      <Button
        icon="pi pi-arrow-left"
        label="Back"
        severity="secondary"
        size="small"
        outlined
        @click="router.go(-1)"
      />
      <ConfirmButton
        size="small"
        label="Reset"
        severity="secondary"
        outlined
        :action-message="() => 'Are you sure you want to reset the creation?'"
        action-button-label="Reset"
        action-button-severity="danger"
        @action="reset()"
      />
    </template>
  </TitleHeader>

  <Stepper v-model:value="step" class="mt-4">
    <StepList>
      <Step :value="1">
        Configuration
        <Badge
          v-if="validationErrorCount > 0"
          :value="validationErrorCount"
          severity="danger"
          size="small"
        />
      </Step>
      <Step :value="2">Validation</Step>
    </StepList>
    <StepPanels>
      <StepPanel v-slot="{ activateCallback }" :value="1" class="flex flex-col gap-4 -mt-4">
        <FluxCreationPanel :dto="dto" :validation-errors="validationErrors" />

        <div class="flex gap-2 w-full">
          <StepperNextButton @click="activateCallback(2)" />
        </div>
      </StepPanel>
      <StepPanel v-slot="{ activateCallback }" :value="2" class="flex flex-col gap-4">
        <div class="p-inputtext">
          <i v-if="isComposeFilePending" class="pi pi-spin pi-spinner" />
          <pre v-else-if="isComposeFileSuccess">{{ composeFileContent }}</pre>
        </div>

        <div class="flex gap-2">
          <StepperBackButton @click="activateCallback(1)" />
          <Button label="Validate" class="ml-auto" severity="secondary" @click="validate()" />
          <Button
            :label="!isPending ? 'Save' : ''"
            :icon="isPending ? 'pi pi-spin pi-spinner' : ''"
            :disabled="isPending"
            @click="
              createFlux();
              router.push('/fluxor');
            "
          />
        </div>
      </StepPanel>
    </StepPanels>
  </Stepper>
</template>

<script setup lang="ts">
import TitleHeader from "@/components/TitleHeader.vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { emptyCreateFluxDto } from "@/utils/types/flux.type";
import StepPanel from "primevue/steppanel";
import StepPanels from "primevue/steppanels";
import Step from "primevue/step";
import Stepper from "primevue/stepper";
import StepList from "primevue/steplist";
import ConfirmButton from "@/components/ConfirmButton.vue";
import StepperNextButton from "@/components/StepperNextButton.vue";
import StepperBackButton from "@/components/StepperBackButton.vue";
import { useCreateFluxorMutation } from "@/api/useFluxor";
import FluxCreationPanel from "@/components/FluxCreationPanel.vue";
import { parseQueryParam } from "@/utils";

const router = useRouter();
const route = useRoute();
const step = ref(1);

const {
  mutate: createFlux,
  isPending,
  validate,
  composeFileContent,
  isComposeFilePending,
  isComposeFileSuccess,
  dto,
  reset,
  validationErrors,
  validationErrorCount
} = useCreateFluxorMutation(() =>
  emptyCreateFluxDto(parseQueryParam(route.query.project), parseQueryParam(route.query.environment))
);
</script>
