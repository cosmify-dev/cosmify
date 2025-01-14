export class ValidationErrorResponse extends Error {
  public readonly data: ValidationErrors;

  constructor(message: string, data: ValidationErrors) {
    super(message);
    this.data = data;
  }
}

export type ValidationData = ValidationErrors | string[];

export interface ValidationErrors {
  [key: string]: string[] | ValidationErrors;
}

export const hasValidationErrors = (errors?: ValidationData): boolean => {
  return errors !== undefined && Array.isArray(errors) && Object.keys(errors).length > 0;
};
