import { Router } from 'express';
import checkExternalToken from '../../middleware/checkExternalToken';
import validateWebhookToken from '../../middleware/validateWebhookToken';
import ExternalRoutes from "./external.webhook";
import InternalRoutes from "./internal.webhook";
import CRUDRoutes from "./webhook";

const router = Router();

router.use('/', CRUDRoutes)
router.use('/external/', checkExternalToken, ExternalRoutes);
router.use('/internal/', validateWebhookToken, InternalRoutes);

export default router;