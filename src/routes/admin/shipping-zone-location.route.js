import {Router} from 'express';
import {
    createZoneLocation,
    getAllZoneLocations,
    createBulkZoneLocations,
    updateZoneLocation,
    getLocationsByZone,
    getSingleZoneLocation
} from "../../controllers/admin/v1/shipping-zone-locations/shipping-zone-locations.controller.js";

const router = Router({mergeParams: true});

router.route('/').post(createZoneLocation).get(getAllZoneLocations);
router.route('/:id').get(getSingleZoneLocation).delete(deleteShippingZone).put(updateZoneLocation);
router.route('/bulk').post(createBulkZoneLocations);
router.route('/zones/:zoneId').get(getLocationsByZone);
export default router;
