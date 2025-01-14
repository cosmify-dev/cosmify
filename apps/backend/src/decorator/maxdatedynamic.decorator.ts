import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import dayjs from "dayjs";

export const MaxDateDynamic = (maxDate: () => Date, validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxDate],
      validator: MaxDateConstraint
    });
  };
};

@ValidatorConstraint({ name: "MaxDateDynamic" })
export class MaxDateConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const [maxDate] = args.constraints;
    return dayjs(maxDate()).isAfter(dayjs(value));
  }

  defaultMessage(args: ValidationArguments) {
    const [maxDate] = args.constraints;
    return `maximal allowed date for ${args.property} is ${maxDate()}`;
  }
}
