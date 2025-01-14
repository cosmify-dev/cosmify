<template>
  <Panel toggleable collapsed>
    <template #header>
      <p class="font-bold">{{ action.type }}</p>
      <Tag
        v-if="action.commandLogs.length > 0"
        :value="action.commandLogs.length + ' command(s)'"
        severity="info"
        class="ml-2"
      />
      <Tag
        :value="action.status"
        :severity="getActionSeverity(action.status)"
        class="ml-auto mr-2"
      />
      <Button
        icon="pi pi-refresh"
        size="small"
        severity="secondary"
        class="mr-2"
        :disabled="!retryable"
        @click="emit('retry')"
      />
    </template>
    <template #footer>
      <div class="flex">
        <div class="ml-auto flex gap-2 items-center">
          <Tag
            v-if="action.status === Status.SUCCESS || action.status === Status.ERROR"
            v-tooltip.top="'Duration'"
            :value="formatDistanceStrict(action.createdAt, action.updatedAt)"
            severity="secondary"
          />
          <Tag
            v-tooltip.top="'Execution time'"
            :value="format(action.createdAt, 'HH:mm:ss dd/MM/yyyy')"
            severity="secondary"
          />
        </div>
      </div>
    </template>
    <div class="flex flex-col gap-4">
      <div v-for="commandLog in sortCommandLogs()" :key="commandLog.id">
        <div class="border p-2.5 border-primary-700 rounded-md bg-primary-950">
          <div class="flex gap-2 items-center font-bold">
            <span class="overflow-x-auto text-nowrap overscroll-contain">{{
              "$ " + commandLog.command
            }}</span>
            <Tag
              :value="commandLog.status"
              :severity="getActionSeverity(commandLog.status)"
              class="ml-auto"
            />
            <Tag :value="format(commandLog.createdAt, 'HH:mm:ss')" />
          </div>
          <div
            v-if="commandLog.stdout.length > 0 || commandLog.stderr.length > 0"
            class="flex mt-2 overflow-x-auto"
          >
            <pre class="select-none">{{ "  " }}</pre>
            <div class="flex flex-col">
              <pre>{{ commandLog.stdout }}</pre>
              <div v-if="commandLog.stderr"><br /></div>
              <pre v-if="commandLog.stderr">{{ commandLog.stderr }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { type Action, Status } from "@/utils/types/action.type";
import { compareAsc, format, formatDistanceStrict } from "date-fns";

const props = defineProps<{
  action: Action;
  retryable?: boolean;
}>();

const sortCommandLogs = () => {
  return [...props.action.commandLogs].sort((a, b) => compareAsc(a.createdAt, b.createdAt));
};

const emit = defineEmits<{
  (e: "retry"): void;
}>();

const getActionSeverity = (status: Status) => {
  switch (status) {
    case Status.SUCCESS:
      return "success";
    case Status.ERROR:
      return "danger";
    case Status.PENDING:
      return "secondary";
    case Status.EXECUTING:
      return "info";
    default:
      return undefined;
  }
};
</script>
