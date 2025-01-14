import { createPinia } from "pinia";
import { markRaw } from "vue";
import router from "@/router";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

export default createPinia()
  .use(({ store }) => {
    store.router = markRaw(router);
  })
  .use(piniaPluginPersistedState);
