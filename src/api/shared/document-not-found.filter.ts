import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";
import { Error } from "mongoose";

@Catch(Error.DocumentNotFoundError)
export class DocumentNotFoundFilter implements ExceptionFilter {
  catch(_exception: Error.DocumentNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(404).json({
      message: "Not Found",
      statusCode: 404,
      path: request.url,
    });
  }
}
