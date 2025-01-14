<template>
  <Menu :model="items" class="flex flex-col pt-5 border-0 border-r-2 rounded-none" title="Orbit">
    <template #start>
      <div class="flex justify-center items-center mb-2">
        <img width="40" height="40" alt="dropdown icon" src="/logo_main_transparent.svg" />
        <h1 class="text-3xl font-bold ml-1 select-none">Cosmify</h1>
      </div>
      <div class="px-3 w-full">
        <InputSelectLabel
          v-model:data="authStore.organizationId"
          label="Organization"
          :options="organizations.data || undefined"
          :is-fetching="organizations.isPending"
          :disabled="organizations.isPending"
          @change="router.go(0)"
        />
      </div>
    </template>
    <template #item="{ item, props }">
      <div class="flex cursor-pointer">
        <RouterLink v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-bind="props.action" :href="href" class="w-full" @click="navigate">
            <span>{{ item.label }}</span>
            <div class="ml-auto flex justify-center items-center">
              <Tag
                v-if="item.beta"
                value="Beta"
                severity="info"
                class="text-[10px] px-1.5"
                @click="navigate"
              />
            </div>
          </a>
        </RouterLink>
      </div>
    </template>
    <template #end>
      <div class="px-3">
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          class="w-full"
          severity="secondary"
          outlined
          @click="signOut()"
        />
      </div>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { authClient } from "@/utils/auth";
import InputSelectLabel from "@/components/InputSelectLabel.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const organizations = authClient.useListOrganizations();

const signOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/auth/login");
      }
    }
  });
};

const items = ref([
  {
    label: "General",
    items: [
      {
        label: "Dashboard",
        route: "/"
      }
    ]
  },
  {
    label: "Projects",
    route: "/projects"
  },
  {
    label: "Fluxor",
    route: "/fluxor",
    beta: true
  },
  {
    label: "Networks",
    route: "/networks"
  },
  {
    label: "Servers",
    route: "/servers"
  },
  {
    label: "Security",
    route: "/security"
  },
  {
    label: "Profile",
    items: [
      {
        label: "Team",
        route: "/auth/team"
      },
      {
        label: "Settings",
        route: "/auth/profile"
      }
    ]
  }
]);
</script>

<style>
/*noinspection CssUnusedSymbol*/
.p-menu-end {
  margin-top: auto;
  margin-bottom: 1rem;
}
</style>
