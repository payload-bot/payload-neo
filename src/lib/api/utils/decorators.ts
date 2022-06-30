import { createFunctionPrecondition } from "@sapphire/decorators";
import { type ApiRequest, ApiResponse, HttpCodes } from "@sapphire/plugin-api";

export const Authenticated = () =>
  createFunctionPrecondition(
    (request: ApiRequest) => Boolean(request.auth?.token),
    (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized)
  );

export const FixKnownErrors = (_target: object, _propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      await originalMethod.apply(this, args);
    } catch (e: unknown) {
      if (e instanceof ApiResponse) {
        return e;
      }

      if (args[1].headersSent) {
        return e;
      }

      return args[1].badRequest("Malformed request");
    }
  };
};
