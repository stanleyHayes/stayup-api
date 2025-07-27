import {Router} from 'express';
import {
    createCoupon,
    deleteCoupon,
    getAllCoupons,
    getCoupon, updateCoupon
} from "../../controllers/admin/v1/coupons/coupons.controller.js";

const router = Router({mergeParams: true});

router.route('/').post(createCoupon).get(getAllCoupons);
router.route('/:id').get(getCoupon).delete(deleteCoupon).put(updateCoupon);

export default router;
