import { registerDecorator, ValidationOptions } from "class-validator";
import { ID as SteamId } from "@node-steam/id";

export function IsValidSteamId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidSteamId",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        ...validationOptions,
        message: "$value is not a valid steamid64",
      },
      validator: {
        validate(value: any) {
          const steamId = new SteamId(value);

          return (
            typeof value === "string" &&
            steamId.isValid() &&
            value === steamId.getSteamID64()
          );
        },
      },
    });
  };
}
