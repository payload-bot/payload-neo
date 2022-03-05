import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { Error } from "mongoose";

@Catch(Error.DocumentNotFoundError)
export class DocumentNotFoundFilter implements ExceptionFilter {
  catch(_exception: Error.DocumentNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(404).json({
      statusCode: 404,
      message: "Requested resource not found",
      error: "Not Found",
    });
  }
}
