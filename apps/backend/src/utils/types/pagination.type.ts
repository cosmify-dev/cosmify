export type PaginationResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  data: T[];
};
