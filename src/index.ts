import "#utils/setup.ts";
import { container } from "@sapphire/framework";
import { PayloadClient } from "#lib/PayloadClient.ts";

const client = new PayloadClient();

try {
  await client.login();
} catch (error) {
  container.logger.error(error);
  client.destroy();
  process.exit(1);
}
