import express from "express";

import RglRoutes from "./rgl-api";

const router = express.Router();

router.use("/rgl", RglRoutes);

export default router;
