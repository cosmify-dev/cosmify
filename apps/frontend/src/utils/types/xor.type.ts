import type { Without } from "@/utils/types/without.type";

export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
