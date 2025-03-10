<template>
  <div class="flex justify-center items-center h-screen">
    <div class="flex flex-col gap-4 w-96 items-center justify-center bg-zinc-900 p-6 rounded-xl">
      <h1 class="select-none">Cosmify</h1>

      <Button
        label="Sign In with GitHub"
        icon="pi pi-github"
        icon-class="text-xl"
        class="w-full"
        type="submit"
        severity="secondary"
        @click="signIn()"
      />

      <Divider class="select-none"> or </Divider>

      <div class="flex flex-col gap-2 w-full">
        <Button
          label="cosmify.dev"
          icon="pi pi-home"
          class="w-full"
          outlined
          @click="() => redirect('https://cosmify.dev')"
        />
        <Button
          label="Documentation"
          icon="pi pi-book"
          class="w-full"
          outlined
          @click="() => redirect('https://cosmify.dev/docs/getting-started/introduction')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { authClient } from "@/utils/auth";

const signIn = async () => {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: `${import.meta.env.VITE_APP_URL}`
  });
};

const redirect = (link: string) => {
  window.location.href = link;
};
</script>
