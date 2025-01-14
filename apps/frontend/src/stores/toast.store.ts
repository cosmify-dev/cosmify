import mitt from "mitt";
import type { ToastMessageOptions } from "primevue/toast";

export const emitter = mitt<{
  "add-toast": ToastMessageOptions;
}>();
