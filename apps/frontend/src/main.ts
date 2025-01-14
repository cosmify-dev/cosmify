import { createApp } from "vue";
import App from "./App.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ZeroLayout from "@/layouts/ZeroLayout.vue";
import router from "./router";
import pinia from "@/plugins/pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";
import { definePreset } from "@primeuix/styled";
import "@/assets/fonts.css";
import "@/assets/main.css";
import "primeicons/primeicons.css";

const Noir = definePreset(Aura, {
  components: {
    tooltip: {
      styles: {
        maxWidth: "1000"
      }
    }
  },
  semantic: {
    primary: {
      50: "{surface.50}",
      100: "{surface.100}",
      200: "{surface.200}",
      300: "{surface.300}",
      400: "{surface.400}",
      500: "{surface.500}",
      600: "{surface.600}",
      700: "{surface.700}",
      800: "{surface.800}",
      900: "{surface.900}",
      950: "{surface.950}"
    },
    colorScheme: {
      light: {
        primary: {
          color: "{primary.950}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.800}",
          activeColor: "{primary.700}"
        },
        highlight: {
          background: "{primary.950}",
          focusBackground: "{primary.700}",
          color: "#ffffff",
          focusColor: "#ffffff"
        }
      },
      dark: {
        primary: {
          color: "{primary.50}",
          contrastColor: "{primary.950}",
          hoverColor: "{primary.200}",
          activeColor: "{primary.300}"
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.300}",
          color: "{primary.950}",
          focusColor: "{primary.950}"
        }
      }
    }
  }
});

export const app = createApp(App)
  .use(PrimeVue, {
    ripple: false,
    theme: {
      preset: Noir,
      options: {
        cssLayer: {
          name: "primevue",
          order: "tailwind-base, primevue, tailwind-utilities"
        }
      }
    }
  })
  .directive("tooltip", Tooltip)
  .use(ToastService)
  .use(ConfirmationService)
  .use(router)
  .use(pinia)
  .use(VueQueryPlugin)
  .component("DefaultLayout", DefaultLayout)
  .component("ZeroLayout", ZeroLayout);

app.mount("#app");
