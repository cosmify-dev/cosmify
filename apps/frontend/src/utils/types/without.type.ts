export type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};
