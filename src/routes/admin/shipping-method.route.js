import {Router} from 'express';
import {
    createShippingMethod,
    createShippingMethods,
    getShippingMethods,
    getShippingMethodById, deleteShippingMethod, updateShippingMethod
} from "../../controllers/admin/v1/shipping-methods/shipping-methods.controller.js";

const router = Router({mergeParams: true});

router.route('/').post(createShippingMethod).get(getShippingMethods);
router.route('/:id').get(getShippingMethodById).delete(deleteShippingMethod).put(updateShippingMethod);
router.route('/bulk').post(createShippingMethods);

export default router;
