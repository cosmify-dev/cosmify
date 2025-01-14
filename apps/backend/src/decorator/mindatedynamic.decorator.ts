import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import dayjs from "dayjs";

export const MinDateDynamic = (minDate: () => Date, validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [minDate],
      validator: MinDateConstraint
    });
  };
};

@ValidatorConstraint({ name: "MinDateDynamic" })
export class MinDateConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const [minDate] = args.constraints;
    return dayjs(minDate()).isBefore(dayjs(value));
  }

  defaultMessage(args: ValidationArguments) {
    const [minDate] = args.constraints;
    return `minimal allowed date for ${args.property} is ${minDate()}`;
  }
}
