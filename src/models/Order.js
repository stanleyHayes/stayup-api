import mongoose from "mongoose";
import MetadataSchema from "../schemas/Metadata.js";

// Tax lines schema
const TaxLineSchema = new mongoose.Schema({
    rate_code: String,
    rate_id: Number,
    label: String,
    compound: Boolean,
    tax_total: String,
    shipping_tax_total: String,
    meta_data: [MetadataSchema]
}, { _id: false });

// Line item schema
const LineItemSchema = new mongoose.Schema({
    name: String,
    product_id: mongoose.Schema.Types.ObjectId,
    variation_id: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    tax_class: String,
    subtotal: String,
    subtotal_tax: String,
    total: String,
    total_tax: String,
    taxes: [TaxLineSchema],
    meta_data: [MetadataSchema],
    sku: String,
    price: String
}, { _id: false });

// Shipping line schema
const ShippingLineSchema = new mongoose.Schema({
    method_title: String,
    method_id: String,
    total: String,
    total_tax: String,
    taxes: [TaxLineSchema],
    meta_data: [MetadataSchema]
}, { _id: false });

// Fee line schema
const FeeLineSchema = new mongoose.Schema({
    name: String,
    tax_class: String,
    tax_status: { type: String, enum: ["taxable", "none"] },
    total: String,
    total_tax: String,
    taxes: [TaxLineSchema],
    meta_data: [MetadataSchema]
}, { _id: false });

// Coupon line schema
const CouponLineSchema = new mongoose.Schema({
    code: String,
    discount: String,
    discount_tax: String,
    meta_data: [MetadataSchema]
}, { _id: false });

// Refund schema
const RefundSchema = new mongoose.Schema({
    reason: String,
    total: String
}, { _id: false });

// Address schema (billing and shipping)
const AddressSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    company: String,
    address_1: String,
    address_2: String,
    city: String,
    state: String,
    postcode: String,
    country: String,
    email: String,
    phone: String
}, { _id: false });

// Main Order Schema
const OrderSchema = new mongoose.Schema({
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    number: { type: String },
    order_key: { type: String },
    created_via: { type: String },
    version: { type: String },
    status: { type: String, enum: ["pending", "processing", "on-hold", "completed", "cancelled", "refunded", "failed", "trash"], default: "pending" },
    currency: { type: String, default: "USD" },
    date_created: { type: Date, default: Date.now },
    date_modified: { type: Date, default: Date.now },
    discount_total: String,
    discount_tax: String,
    shipping_total: String,
    shipping_tax: String,
    cart_tax: String,
    total: String,
    total_tax: String,
    prices_include_tax: { type: Boolean, default: false },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    customer_ip_address: String,
    customer_user_agent: String,
    customer_note: String,
    billing: AddressSchema,
    shipping: AddressSchema,
    payment_method: String,
    payment_method_title: String,
    transaction_id: String,
    date_paid: Date,
    date_completed: Date,
    cart_hash: String,
    meta_data: [MetadataSchema],
    line_items: [LineItemSchema],
    tax_lines: [TaxLineSchema],
    shipping_lines: [ShippingLineSchema],
    fee_lines: [FeeLineSchema],
    coupon_lines: [CouponLineSchema],
    refunds: [RefundSchema],
    set_paid: { type: Boolean, default: false }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
