export type PrivateKey = {
  id: string;
  name: string;
  createdAt: string;
};

export type PostPrivateKeyDto = Omit<PrivateKey, "id" | "createdAt"> & {
  data: string;
};

export const emptyPostPrivateKeyDto = (): PostPrivateKeyDto => ({
  name: "",
  data: ""
});
