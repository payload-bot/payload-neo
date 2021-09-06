import { Router, Request, Response } from "express";
import { container } from "@sapphire/framework";

const { client } = container;

const version = "5.0.0";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    users: client.users.cache.size,
    servers: client.guilds.cache.size,
    uptime: client.uptime,
    version,
  });
});

// router.get("/commands", (req: Request, res: Response) => {
//   res.json({
//     commands: {
//       count: client.commands.filter((command) => !command.requiresRoot).size,
//       data: [
//         ...client.commands.filter((command) => !command.requiresRoot).values(),
//       ],
//     },
//     autoResponses: {
//       count: client.autoResponses.size,
//       data: [...client.autoResponses.values()],
//     },
//   });
// });

export default router;
