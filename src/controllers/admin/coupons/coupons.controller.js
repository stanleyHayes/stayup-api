import moment from "moment";
import mongoose from "mongoose";
import status from "http-status";

import Coupon from "../../../models/Coupon.js";
import Customer from "../../../models/Customer.js";
import Product from "../../../models/Product.js";
import Category from "../../../models/Category.js";

import {validateExistence} from "../../../utils/helpers.js";

export const createCoupon = async (req, res) => {
    console.info("Session Started")
    const session = await Coupon.startSession();
    console.info("Transaction Started")
    session.startTransaction();
    try {
        const {
            code,
            amount,
            discount_type,
            description,
            date_expires,
            usage_count,
            individual_use,
            included_products,
            excluded_products,
            usage_limit,
            usage_limit_per_user,
            limit_usage_to_x_items,
            free_shipping,
            included_product_categories,
            excluded_product_categories,
            exclude_sale_items,
            minimum_amount,
            maximum_amount,
            included_emails,
            meta_data
        } = req.body;

        console.info("Checking if code exist in request.")
        if (!code) {
            console.error(`Code is required.`)
            return res.status(status.BAD_REQUEST).json({
                message: "code is required",
                data: null
            });
        }

        if (date_expires) {
            console.info(`Code ${code} has expired: ${date_expires}`);
            if (moment(date_expires).isBefore(Date.now())) {
                return res.status(status.BAD_REQUEST).json({
                    message: `Code ${code} has already expired.`,
                    data: null
                });
            }
        }

        const existingCoupon = await Coupon.findOne({code});
        if (existingCoupon) {
            console.error(`Code ${code} already exists.`);
            return res.status(status.BAD_REQUEST).json({
                message: `Code ${code} already exists.`,
                data: null
            });
        }

        // Parallel validation (use session)
        await Promise.all([
            validateExistence(Customer, included_emails, 'email', session),
            validateExistence(Product, included_products, '_id', session),
            validateExistence(Product, excluded_products, '_id', session),
            validateExistence(Category, included_product_categories, '_id', session),
            validateExistence(Category, excluded_product_categories, '_id', session),
        ]);

        const coupon = await Coupon.create([
            {
                code,
                amount,
                discount_type,
                description,
                date_expires,
                usage_count,
                individual_use,
                included_products,
                excluded_products,
                usage_limit,
                usage_limit_per_user,
                limit_usage_to_x_items,
                free_shipping,
                included_product_categories,
                excluded_product_categories,
                exclude_sale_items,
                minimum_amount,
                maximum_amount,
                included_emails,
                meta_data
            }
        ], {session}); // Create inside session

        await session.commitTransaction(); // ✅ All good
        await session.endSession();

        res.status(status.CREATED).json({
            message: `Coupon with code ${code} created successfully.`,
            data: coupon[0] // because we used array insert
        });
    } catch (error) {
        await session.abortTransaction(); // ❌ Rollback everything
        await session.endSession();

        console.error(`Coupon creation failed:`, error.message);
        res.status(500).json({
            message: error.message || 'Something went wrong.',
            data: null
        });
    }
};

export const getCoupon = async (req, res) => {
    try {
        const {id} = req.params;

        // Defensive check: is the ID a valid Mongo ObjectId?
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BAD_REQUEST).json({
                message: "Invalid coupon ID format.",
                data: null
            });
        }


        const coupon = await Coupon.findById(id)
            .populate([
                { path: 'included_products', select: 'name image' },
                { path: 'excluded_products', select: 'name image' },
                { path: 'included_product_categories', select: 'name image' },
                { path: 'excluded_product_categories', select: 'name image' },
                { path: 'included_customers', select: 'name image email' },
            ])
            .lean();

        if (!coupon) {
            return res.status(status.NOT_FOUND).json({
                message: `Coupon not found`,
                data: null
            });
        }

        res.status(status.OK).json({
            message: 'Coupon successfully retrieved.',
            data: coupon
        })
    }catch (e) {
        console.error(`[GetCoupon] Failed:`, e.message);

        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: e.message || "Something went wrong.",
            data: null
        });
    }
}

export const getAllCoupons = async (req, res) => {
    try {
        const {
            page = 1,
            per_page = 10,
            search,
            after,
            before,
            modified_after,
            modified_before,
            dates_are_gmt = false,
            exclude = [],
            include = [],
            offset = 0,
            order = 'desc',
            order_by = 'date',
            code
        } = req.query;

        const query = {};

        // Search by code or description
        if (search) {
            query.$or = [
                { code: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by code exactly
        if (code) {
            query.code = code;
        }

        // Handle published dates
        if (after || before) {
            query.created_at = {};
            if (after) {
                query.created_at.$gte = dates_are_gmt ? moment.utc(after).toDate() : moment(after).toDate();
            }
            if (before) {
                query.created_at.$lte = dates_are_gmt ? moment.utc(before).toDate() : moment(before).toDate();
            }
        }

        // Handle modified dates
        if (modified_after || modified_before) {
            query.updated_at = {};
            if (modified_after) {
                query.updated_at.$gte = dates_are_gmt ? moment.utc(modified_after).toDate() : moment(modified_after).toDate();
            }
            if (modified_before) {
                query.updated_at.$lte = dates_are_gmt ? moment.utc(modified_before).toDate() : moment(modified_before).toDate();
            }
        }

        // Include only specific IDs
        if (include.length) {
            query._id = { $in: Array.isArray(include) ? include : [include] };
        }

        // Exclude specific IDs
        if (exclude.length) {
            query._id = query._id || {};
            query._id.$nin = Array.isArray(exclude) ? exclude : [exclude];
        }

        // Set sorting
        let sortField = 'created_at'; // default sort
        if (order_by === 'date') sortField = 'created_at';
        else if (order_by === 'modified') sortField = 'updated_at';
        else if (order_by === 'id') sortField = '_id';
        else if (order_by === 'include') sortField = '_id';
        else if (order_by === 'title') sortField = 'description';
        else if (order_by === 'slug') sortField = 'code';

        const sortOrder = order === 'asc' ? 1 : -1;

        // Pagination
        const skip = offset ? parseInt(offset) : (parseInt(page) - 1) * parseInt(per_page);
        const limit = parseInt(per_page);

        const [coupons, total] = await Promise.all([
            Coupon.find(query)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Coupon.countDocuments(query)
        ]);

        res.status(status.OK).json({
            message: "Coupons successfully retrieved.",
            total,
            page: parseInt(page),
            per_page: parseInt(per_page),
            data: coupons
        });
    } catch (e) {
        console.error(`[GetAllCoupons] Failed:`, e.message);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: e.message || "Something went wrong.",
            data: null
        });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { force } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(status.BAD_REQUEST).json({
                message: `Invalid coupon ID format.`,
                data: null
            });
        }

        // Parse force properly
        const forceDelete = force === 'true';

        if (forceDelete) {
            const deletedCoupon = await Coupon.findByIdAndDelete(id);
            if (!deletedCoupon) {
                return res.status(status.NOT_FOUND).json({
                    message: `Coupon with ID ${id} not found.`,
                    data: null
                });
            }
            return res.status(status.OK).json({
                message: `Coupon with ID ${id} permanently deleted.`,
                data: null
            });
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(status.NOT_FOUND).json({
                message: `Coupon with ID ${id} not found.`,
                data: null
            });
        }

        coupon.is_deleted = true;
        if (!coupon.date_expires || new Date(coupon.date_expires) > new Date()) {
            coupon.date_expires = new Date(); // Set expiration to now only if not already expired
        }
        await coupon.save();

        res.status(status.OK).json({
            message: `Coupon with ID ${id} marked as deleted (soft delete).`,
            data: coupon
        });
    } catch (e) {
        console.error(`[DeleteCoupon] Failed:`, e.message);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: e.message || "Something went wrong.",
        });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        // Define fields that are safe to update
        const allowedUpdates = [
            "code", "amount", "discount_type", "description", "date_expires",
            "usage_count", "usage_limit", "usage_limit_per_user",
            "individual_use", "included_products", "excluded_products",
            "free_shipping", "included_product_categories", "excluded_product_categories",
            "exclude_sale_items", "minimum_amount", "maximum_amount", "included_emails", "meta_data"
        ];

        const updates = Object.keys(req.body);

        // Check if any of the requested updates are not allowed
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(status.BAD_REQUEST).json({
                message: `Invalid updates detected. Only specific fields are allowed to be updated.`,
                data: null
            });
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(status.NOT_FOUND).json({
                message: `Coupon with ID ${id} not found.`,
                data: null
            });
        }

        // Apply updates safely
        updates.forEach(update => {
            coupon[update] = req.body[update];
        });

        await coupon.save();

        res.status(status.OK).json({
            message: `Coupon with ID ${id} successfully updated.`,
            data: coupon
        });

    } catch (e) {
        console.error(`[UpdateCoupon] Failed:`, e.message);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            message: e.message || "Something went wrong.",
        });
    }
};
