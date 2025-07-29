import {Router} from 'express';

import {
    createShippingClass,
    updateShippingClass,
    getShippingClasses,
    createShippingClasses,
    deleteShippingClass,
    getShippingClass,
    bulkDeleteShippingClasses
} from "../../controllers/admin/v1/shipping-classes/shipping-classes.controller.js";

const router = Router({mergeParams: true});

router.route('/bulk').post(createShippingClasses);
router.route('/bulk').delete(bulkDeleteShippingClasses);
router.route('/').post(createShippingClass).get(getShippingClasses);
router.route('/:id').get(getShippingClass).delete(deleteShippingClass).put(updateShippingClass);

export default router;
