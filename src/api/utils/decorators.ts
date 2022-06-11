import { createFunctionPrecondition } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  HttpCodes,
} from "@sapphire/plugin-api";

export const Authenticate = () =>
  createFunctionPrecondition(
    (request: ApiRequest) => Boolean(request.auth?.token),
    (_request: ApiRequest, response: ApiResponse) =>
      response.error(HttpCodes.Unauthorized)
  );
