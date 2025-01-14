import type { Server } from "@/utils/types/server.type";

export type Network = {
  id: string;
  name: string;
  server: Server;
  fluxes: string[];
  createdAt: string;
};

export type PostNetworkDto = Omit<Network, "id" | "server" | "fluxes" | "createdAt"> & {
  server: string;
};

export const emptyPostNetworkDto: () => PostNetworkDto = () => ({
  name: "",
  server: ""
});
