import express from "express";

import ClientRoutes from "./client-stats";

const router = express.Router();

router.use("/client", ClientRoutes);

export default router;
