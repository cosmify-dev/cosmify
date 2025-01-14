import { NextFunction, Request, Response } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { BadRequestError, Errors } from "../utils/index.js";

function convertToDto<T>(
  dtoClass: ClassConstructor<T>,
  plain: object,
  groups: string[],
  exposeDefaultValues = true
) {
  return plainToInstance(dtoClass, plain, {
    groups: groups,
    excludeExtraneousValues: true,
    exposeDefaultValues: exposeDefaultValues
  });
}

// Skip Missing Properties => Skip every parameter not defined in request body, useful for partial updates of the entity

const validateDTO = (
  dto: object,
  groups: string[],
  skipMissingProperties: boolean,
  logValuesToError: boolean,
  res: Response,
  next: NextFunction,
  saveDTO: (dto: object) => void
): void => {
  validate(dto, {
    skipMissingProperties: skipMissingProperties,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    always: true,
    groups: groups,
    dismissDefaultMessages: false,
    validationError: {
      target: logValuesToError,
      value: logValuesToError
    }
  }).then((errors) => {
    if (errors.length === 0) return saveDTO(dto);
    else {
      const validationErrors: ValidationErrors = {};
      errors.forEach((error) => {
        convertValidationError(validationErrors, error);
      });
      return next(
        new BadRequestError("Validation Error", Errors.VALIDATION_ERROR, validationErrors)
      );
    }
  });
};

const convertValidationError = (validationErrors: ValidationErrors, error: ValidationError) => {
  if (!error.property || (!error.constraints && error.children?.length === 0)) return;
  if (error.children && error.children?.length > 0) {
    validationErrors[error.property] = {};
    error.children.forEach((childError) => {
      convertValidationError(validationErrors[error.property] as ValidationErrors, childError);
    });
  }
  if (error.constraints) validationErrors[error.property] = Object.values(error.constraints);
};

export type ValidationErrors = {
  [key: string]: ValidationErrors | string[];
};

export type ValidationOptions = {
  groups: string[];
  skipMissingProperties: boolean;
  logValuesToError: boolean;
  exposeDefaultValues: boolean;
};

const createValidationOptions = (options?: Partial<ValidationOptions>) => {
  return {
    groups: [],
    skipMissingProperties: false,
    logValuesToError: false,
    exposeDefaultValues: true,
    ...(options || {})
  };
};

export function validateBodyDTO<T extends object>(
  dtoClass: new () => T,
  options?: Partial<ValidationOptions>
) {
  return function (req: Request, res: Response, next: NextFunction) {
    const localOptions: ValidationOptions = createValidationOptions(options);
    const dto = convertToDto(
      dtoClass,
      req.body,
      localOptions.groups,
      localOptions.exposeDefaultValues
    );
    validateDTO(
      dto,
      localOptions.groups,
      localOptions.skipMissingProperties,
      localOptions.logValuesToError,
      res,
      next,
      (dto: object) => {
        res.locals.body = dto;
        next();
      }
    );
  };
}

export const validateParamDTO = (
  dtoClass: ClassConstructor<object>,
  options?: Partial<ValidationOptions>
) => {
  return function (req: Request, res: Response, next: NextFunction) {
    const localOptions: ValidationOptions = createValidationOptions(options);
    const dto = convertToDto(
      dtoClass,
      req.params,
      localOptions.groups,
      localOptions.exposeDefaultValues
    );
    validateDTO(
      dto,
      localOptions.groups,
      localOptions.skipMissingProperties,
      localOptions.logValuesToError,
      res,
      next,
      (dto: object) => {
        res.locals.params = dto;
        next();
      }
    );
  };
};

export const validateQueryDTO = (
  dtoClass: ClassConstructor<object>,
  options?: Partial<ValidationOptions>
) => {
  return function (req: Request, res: Response, next: NextFunction) {
    const localOptions: ValidationOptions = createValidationOptions(options);
    const dto =
      convertToDto(dtoClass, req.query, localOptions.groups, localOptions.exposeDefaultValues) ||
      {};
    validateDTO(
      dto,
      localOptions.groups,
      localOptions.skipMissingProperties,
      localOptions.logValuesToError,
      res,
      next,
      (dto: object) => {
        res.locals.query = dto;
        next();
      }
    );
  };
};
