import "#utils/setup.ts";
import { container } from "@sapphire/framework";
import { PayloadClient } from "#lib/PayloadClient.ts";

const client = new PayloadClient();

try {
  await client.login();
} catch (error) {
  container.logger.error(error);
  client.destroy();
}

process.on("SIGINT", async () => {
  await client.destroy();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await client.destroy();
  process.exit(0);
});
