<template>
  <TitleHeader title="Profile" />

  <div v-if="session.data" class="flex flex-col gap-4 mt-4">
    <Avatar
      :image="session?.data.user.image || undefined"
      style="background-color: #ece9fc; color: #2a1261"
      class="rounded-xl"
      size="xlarge"
    />
    <InputTextLabel label="Name" :data="session.data.user.name" disabled />
    <InputTextLabel label="Email" :data="session.data.user.email" disabled />
  </div>
</template>

<script setup lang="ts">
import TitleHeader from "@/components/TitleHeader.vue";
import InputTextLabel from "@/components/InputTextLabel.vue";
import { authClient } from "@/utils/auth";

const session = authClient.useSession();
</script>
