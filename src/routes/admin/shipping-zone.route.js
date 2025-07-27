import {Router} from 'express';
import {
    createShippingZones,
    updateShippingZone,
    getShippingZones,
    deleteShippingZone,
    getShippingZoneById,
    createShippingZone
} from "../../controllers/admin/v1/shipping-zones/shipping-zones.controller.js";

const router = Router({mergeParams: true});

router.route('/').post(createShippingZone).get(getShippingZones);
router.route('/:id').get(getShippingZoneById).delete(deleteShippingZone).put(updateShippingZone);
router.route('/bulk').post(createShippingZones);

export default router;
