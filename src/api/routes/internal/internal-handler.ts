import express from "express";

import PublicRoutes from "./public/internal-public-handler";
import PrivateRoutes from "./private/internal-private-handler";

const router = express.Router();

router.use("/public", PublicRoutes);
router.use("/private", PrivateRoutes);

export default router;
