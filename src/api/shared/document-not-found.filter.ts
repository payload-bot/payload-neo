import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { Error } from "mongoose";

@Catch(Error.DocumentNotFoundError)
export class DocumentNotFoundFilter implements ExceptionFilter {
  catch(_exception: Error.DocumentNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response.status(404).send({
      statusCode: 404,
      message: "Requested resource does not exist",
      error: "Not Found",
    });
  }
}
