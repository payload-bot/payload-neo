import express from "express";

import PublicRoutes from "./public/internal-public-handler";

const router = express.Router();

router.use("/public", PublicRoutes);

export default router;
