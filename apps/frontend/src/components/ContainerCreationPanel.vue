<template>
  <div class="flex flex-col gap-4">
    <InputTextLabel
      v-model:data="dto.name"
      v-model:validation-errors="validationErrors['name']"
      label="Name"
      required
    />

    <InputTextLabel
      v-model:data="dto.image"
      v-model:validation-errors="validationErrors['image']"
      label="Image"
      required
    />

    <InputMultiSelectLabel
      v-model:data="dto.networks"
      v-model:validation-errors="validationErrors['networks']"
      label="Network"
      option-label="name"
      option-value="id"
      :options="networks"
      placeholder="Select networks"
      :is-fetching="isFetchingNetworks"
      :lazy-loading="{
        load: loadNetworks
      }"
      @refresh-data="refetchNetworks"
    />

    <InputArrayLabel
      v-model:items="dto.ports"
      v-model:validation-errors="validationErrors['ports']"
      title="Ports"
      @add-item="dto.ports = [...dto.ports, { hostPort: 80, containerPort: 80 }]"
    >
      <template #default="{ item, index, remove, validationErrors }">
        <div class="flex gap-2 items-start">
          <InputNumberLabel
            v-model:data="item['hostPort']"
            v-model:validation-errors="validationErrors['hostPort']"
            :min="1"
            :max="65535"
            class="flex-grow min-w-20"
          />
          <p class="pt-2">:</p>
          <InputNumberLabel
            v-model:data="item['containerPort']"
            v-model:validation-errors="validationErrors['containerPort']"
            :min="1"
            :max="65535"
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

    <InputArrayLabel
      v-model:items="dto.command"
      title="Command"
      column
      :validation-errors="validationErrors['command']"
      @add-item="dto.command = [...dto.command, '']"
    >
      <template #default="{ items, index, remove }">
        <div class="flex gap-2 items-center">
          <InputTextLabel v-model:data="items[index]" class="flex-grow" />
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

    <InputArrayLabel
      v-model:validation-errors="validationErrors['labels']"
      v-model:items="dto.labels"
      title="Labels"
      column
      @add-item="dto.labels = [...dto.labels, '']"
    >
      <template #default="{ items, index, remove }">
        <div class="flex gap-2 items-center">
          <InputTextLabel v-model:data="items[index]" class="flex-grow" />
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

    <InputArrayLabel
      v-model:validation-errors="validationErrors['environmentVars']"
      v-model:items="dto.environmentVars"
      title="Environment variables"
      column
      @add-item="dto.environmentVars = [...dto.environmentVars, { key: '', value: '' }]"
    >
      <template #default="{ item, index, remove, validationErrors }">
        <div class="flex gap-2 items-start">
          <InputTextLabel
            v-model:data="item['key']"
            v-model:validation-errors="validationErrors['key']"
            class="flex-grow min-w-20 max-w-64"
          />
          <p class="pt-2">=</p>
          <InputTextLabel
            v-model:data="item['value']"
            v-model:validation-errors="validationErrors['value']"
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

    <InputArrayLabel
      v-model:items="dto.volumes"
      v-model:validation-errors="validationErrors['volumes']"
      title="Volumes"
      column
      @add-item="
        dto.volumes = [
          ...dto.volumes,
          {
            create: false,
            permission: 644,
            hostPath: '',
            type: FileType.FILE,
            containerPath: '',
            readonly: false
          }
        ]
      "
    >
      <template #default="{ item, index, remove, validationErrors }">
        <div class="flex items-start gap-2">
          <InputTextLabel
            v-model:data="item['hostPath']"
            v-model:validation-errors="validationErrors['hostPath']"
            class="w-1/3"
          />
          <InputCheckboxLabel
            v-model:data="item['create']"
            v-tooltip.top="'Create this?'"
            :binary="true"
            class="pt-2"
          />
          <InputSelectButtonLabel
            v-model:data="item['type']"
            v-model:validation-errors="validationErrors['type']"
            :options="Object.values(FileType)"
            :allow-empty="false"
            :disabled="!item['create']"
          />
          <InputNumberLabel
            v-model:data="item['permission']"
            :max="777"
            :min="0"
            :disabled="!item['create']"
          />
          <p class="pt-2">:</p>
          <InputTextLabel
            v-model:data="item['containerPath']"
            v-model:validation-errors="validationErrors['containerPath']"
            class="w-1/2"
          />
          <InputToggleButtonLabel
            v-model:data="item['readonly']"
            v-tooltip.left="'ro = read-only\nrw = read-write'"
            on-label="ro"
            off-label="rw"
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
  </div>
</template>

<script lang="ts" setup>
import { type CreateContainerDto, FileType } from "@/utils/types/flux.type";
import InputTextLabel from "@/components/InputTextLabel.vue";
import type { ValidationErrors } from "@/utils/types/validation.type";
import { computed } from "vue";
import { useLazyNetworksQuery } from "@/api/useNetworks";
import InputMultiSelectLabel from "@/components/InputMultiSelectLabel.vue";
import InputNumberLabel from "@/components/InputNumberLabel.vue";
import InputArrayLabel from "@/components/InputArrayLabel.vue";
import InputSelectButtonLabel from "@/components/InputSelectButtonLabel.vue";
import InputCheckboxLabel from "@/components/InputCheckboxLabel.vue";
import InputToggleButtonLabel from "@/components/InputToggleButtonLabel.vue";

const dto = defineModel<CreateContainerDto>("dto", { required: true });
const validationErrors = defineModel<ValidationErrors>("validationErrors", {
  required: true
});

const firstSelectedNetworkId = computed(() => dto.value.networks[0]);

const {
  items: networks,
  refetch: refetchNetworks,
  load: loadNetworks,
  isFetching: isFetchingNetworks
} = useLazyNetworksQuery(firstSelectedNetworkId);
</script>
