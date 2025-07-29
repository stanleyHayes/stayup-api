import mongoose from 'mongoose';
import MetadataSchema from "../schemas/metadata.schema.js";

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Code is required'],
        unique: [true, 'Code is unique'],
    },
    amount: {
        type: Number,
    },
    discount_type: {
        type: String,
        enum: ['percent', 'fixed_at', 'fixed_cart', 'fixed_product'],
        default: 'fixed_cart'
    },
    description: {
        type: String,
    },
    date_expires: {
        type: Date,
    },
    usage_count: {
        type: Number,
        readOnly: true,
    },
    individual_use: {
        type: Boolean,
        default: false,
    },
    included_products: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product',
    },
    excluded_products: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product',
    },
    usage_limit: {
        type: Number,
    },
    usage_limit_per_user: {
        type: Number,
    },
    limit_usage_to_x_items: {
        type: Number,
    },
    free_shipping: {
        type: Boolean,
        default: false,
    },
    included_product_categories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Category'
    },
    excluded_product_categories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Category'
    },
    exclude_sale_items: {
        type: Boolean,
        default: false,
    },
    minimum_amount: {
        type: Number,
    },
    maximum_amount: {
        type: Number,
    },
    included_emails: {
        type: [String]
    },
    used_by: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Customer'
    },
    meta_data: {
        type: [MetadataSchema]
    },
    is_deleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

CouponSchema.virtual('included_customers', {
    ref: 'Customer',
    localField: 'included_emails',
    foreignField: 'email',
    justOne: false
});

const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;