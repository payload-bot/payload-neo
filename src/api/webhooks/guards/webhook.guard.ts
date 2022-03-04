import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { WebhookCrudService } from "../services/webhook-crud.service";

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private webhookService: WebhookCrudService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const token = request.headers?.authorization;

    if (!token) {
      throw new UnauthorizedException();
    }

    const webhook = await this.webhookService.getWebhookBySecret(token);

    request.webhook = webhook;

    return true;
  }
}
