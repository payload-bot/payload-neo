import express from "express";

import RconRoutes from "./rcon-api";
import RglRoutes from "./rgl-api";

const router = express.Router();

router.use("/rcon", RconRoutes);
router.use("/rgl", RglRoutes);

export default router;
