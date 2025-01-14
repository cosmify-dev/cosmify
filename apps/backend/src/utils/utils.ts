import xss from "xss";

export function validateXss(value: string | undefined): string | undefined {
  return value === undefined ? undefined : xss(value);
}

export function validateInt(value: string | undefined) {
  return value !== undefined ? parseInt(value) || undefined : undefined;
}
