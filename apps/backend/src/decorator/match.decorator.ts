import { ClassConstructor } from "class-transformer";
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

export const Match = <T>(
  type: ClassConstructor<T>,
  property: (o: T) => object,
  validationOptions?: ValidationOptions
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint
    });
  };
};

@ValidatorConstraint({ name: "Match" })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: never, args: ValidationArguments) {
    const [fn] = args.constraints;
    return fn(args.object) === value;
  }

  defaultMessage(args: ValidationArguments) {
    const [constraintProperty]: (() => never)[] = args.constraints;
    return `${constraintProperty} and ${args.property} does not match`;
  }
}
