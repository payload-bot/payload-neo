import "#utils/setup";
import { container } from "@sapphire/framework";
import { PayloadClient } from "#lib/PayloadClient";

const client = new PayloadClient();

async function main() {
  try {
    await client.login();
  } catch (error) {
    container.logger.error(error);
    client.destroy();
    process.exit(1);
  }
}

main().catch(container.logger.error.bind(container.logger));
