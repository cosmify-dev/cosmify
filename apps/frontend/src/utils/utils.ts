import type { LocationQueryValue } from "vue-router";

export type DeleteEntity = {
  name: string;
};

export const generateDeletionMessage = (
  entity: DeleteEntity | DeleteEntity[],
  entityName: string
): string => {
  if (Array.isArray(entity) && entity.length > 1)
    return `Do you really want to delete ${entity.length} ${entityName}s?`;
  if (Array.isArray(entity) && entity.length === 1)
    return `Do you really want to delete ${entity[0].name}?`;
  if (!Array.isArray(entity)) return `Do you want to delete ${entity.name}?`;
  return `Please select first!`;
};

export const parseQueryParam = (
  param: LocationQueryValue | LocationQueryValue[] | null
): string | undefined => {
  return (Array.isArray(param) ? param[0] : param) || undefined;
};
