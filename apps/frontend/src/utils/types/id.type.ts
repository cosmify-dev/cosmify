export type ID = {
  id: string;
};

export type BaseEntity = {
  status?: string;
} & ID;
