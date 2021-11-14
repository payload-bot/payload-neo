import { Auth } from '#api/auth/guards/auth.guard';
import { ClassSerializerInterceptor, Controller, Delete, Get, Post, UseInterceptors } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('webhook')
@UseInterceptors(ClassSerializerInterceptor)
export class WebhookController {
    constructor(
        private webhookService: WebhookService
    ) {}

    @Get('users')
    @Auth()
    async getUserWebhook() {}

    @Get('servers')
    @Auth()
    async getServerWebhook() {}

    @Post('users')
    @Auth()
    async createUserWebhook() {}
    
    @Post('servers')
    @Auth()
    async createServerWebhook() {}

    @Delete('users')
    @Auth()
    async deleteUserWebhook() {}

    @Delete('servers')
    @Auth()
    async deleteServerWebhook() {}

}
