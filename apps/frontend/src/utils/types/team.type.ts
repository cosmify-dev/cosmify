import type { Optional } from "@tanstack/vue-query";

export type Team = {
  id: string;
  name: string;
};

export type CreateTeamDto = Pick<Team, "name">;
export type UpdateTeamDto = {
  name?: string;
};
