<template>
  <Button :label size="small" outlined @click="visible = true" />

  <Dialog
    v-model:visible="visible"
    modal
    :header="header"
    :style="{ width: '32rem' }"
    @after-hide="$emit('cancel')"
  >
    <span v-if="description" class="text-surface-500 dark:text-surface-400 block mb-8">{{
      description
    }}</span>
    <div class="flex flex-col gap-4">
      <slot />
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="
          $emit('cancel');
          visible = false;
        "
      />
      <Button type="button" :label="actionButtonLabel" @click="actionButton()" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  label: string;
  actionButtonLabel: string;
  header: string;
  description?: string;
}>();

const emit = defineEmits<{
  (e: "action"): never | undefined;
  (e: "cancel"): void;
}>();

const actionButton = () => {
  if (emit("action") !== undefined) visible.value = false;
};

const visible = ref(false);
</script>
