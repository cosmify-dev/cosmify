<template>
  <Button
    :size="size"
    :text="text"
    :icon="icon"
    :label="label"
    :severity="severity"
    @click="confirmAction($event)"
  />
</template>

<script setup lang="ts" generic="T">
import { useConfirm } from "primevue/useconfirm";
import Button from "primevue/button";

const confirm = useConfirm();

interface Props {
  label?: string;
  icon?: string;
  text?: boolean;
  severity: "primary" | "secondary" | "success" | "info" | "warning" | "danger";
  size?: "small" | "large" | undefined;
  actionMessage: (() => string | undefined) | string | undefined;
  actionButtonLabel: string;
  actionIcon?: string;
  actionButtonSeverity: "primary" | "secondary" | "success" | "info" | "warning" | "danger";
}

const { actionIcon = "pi pi-info-circle", ...props } = defineProps<Props>();

const emit = defineEmits<{
  (e: "action"): void;
}>();

const confirmAction = (event: Event) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message:
      props.actionMessage === undefined || typeof props.actionMessage === "string"
        ? props.actionMessage
        : props.actionMessage(),
    icon: actionIcon,
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: props.actionButtonLabel,
      severity: props.actionButtonSeverity
    },
    accept: () => {
      emit("action");
    }
  });
};
</script>
