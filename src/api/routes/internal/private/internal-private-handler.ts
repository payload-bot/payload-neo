import express from "express";

import GuildsRoute from "./guilds";

const router = express.Router();

router.use("/guilds", GuildsRoute);

export default router;
