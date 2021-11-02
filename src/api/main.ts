import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.modules";

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
