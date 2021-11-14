import { container } from "@sapphire/framework";
import { ValidationOptions, registerDecorator } from "class-validator";

const { i18n } = container;

const VALID_LANGUAGES = [...i18n.languages.keys()];

export function IsValidLanguage(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidSteamId",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        ...validationOptions,
        message: "$value is not a valid language",
      },
      validator: {
        validate(value: any) {
          return VALID_LANGUAGES.includes(value);
        },
      },
    });
  };
}
