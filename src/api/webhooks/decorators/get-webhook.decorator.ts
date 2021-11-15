import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentWebhook = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().webhook
);
