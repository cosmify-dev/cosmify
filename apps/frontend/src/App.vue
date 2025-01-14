<template>
  <Toast />
  <ConfirmPopup />
  <component :is="layout">
    <router-view />
  </component>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import ConfirmPopup from "primevue/confirmpopup";
import { useToast } from "primevue/usetoast";
import { emitter } from "@/stores/toast.store";
import Toast from "primevue/toast";

const layout = ref("");
const route = useRoute();

const toast = useToast();

emitter.on<"add-toast">("add-toast", (item) => toast.add(item));

watch(
  () => route.meta?.layout,
  (metaLayout) => {
    layout.value = metaLayout as string;
  },
  { immediate: true }
);
</script>
