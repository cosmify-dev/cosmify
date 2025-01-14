import type { Ref } from "vue";
import { ref } from "vue";

export class Pagination {
  page: Ref<number>;
  pageSize: Ref<number>;

  constructor(page: number, pageSize: number) {
    this.page = ref(page);
    this.pageSize = ref(pageSize);
  }

  public update = (page: number, pageSize: number) => {
    this.page.value = page;
    this.pageSize.value = pageSize;
  };
}

export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export const emptyPaginationResult = <T>(): PaginationResult<T> => ({
  data: [],
  total: 0,
  page: 1,
  pageSize: 10
});
