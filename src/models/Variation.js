import mongoose, { Schema } from "mongoose";
import DimensionSchema from "../schemas/dimension.schema.js";

const AttributeSchema = new Schema({
    id: { type: Number },
    name: { type: String },
    option: { type: String }
}, { _id: false });

const MetaDataSchema = new Schema({
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed }
}, { _id: false });

const ProductVariationSchema = new Schema({
    description: { type: String },
    permalink: { type: String },
    sku: { type: String, unique: true, sparse: true },
    price: { type: String },
    regular_price: { type: String },
    sale_price: { type: String },
    date_on_sale_from: { type: Date },
    date_on_sale_to: { type: Date },
    status: {
        type: String,
        enum: ['draft', 'pending', 'private', 'publish'],
        default: 'publish'
    },
    virtual: { type: Boolean, default: false },
    downloadable: { type: Boolean, default: false },
    downloads: { type: [DownloadSchema], default: [] },
    download_limit: { type: Number, default: -1 },
    download_expiry: { type: Number, default: -1 },
    tax_status: {
        type: String,
        enum: ['taxable', 'shipping', 'none'],
        default: 'taxable'
    },
    tax_class: { type: String },
    manage_stock: {
        type: Schema.Types.Mixed, // boolean or 'parent'
        default: false
    },
    stock_quantity: { type: Number },
    stock_status: {
        type: String,
        enum: ['instock', 'outofstock', 'onbackorder'],
        default: 'instock'
    },
    backorders: {
        type: String,
        enum: ['no', 'notify', 'yes'],
        default: 'no'
    },
    weight: { type: String },
    dimensions: { type: DimensionSchema },
    shipping_class: { type: String },
    image: { type: ImageSchema },
    attributes: { type: [AttributeSchema], default: [] },
    menu_order: { type: Number, default: 0 },
    meta_data: { type: [MetaDataSchema], default: [] },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const ProductVariation = mongoose.model('ProductVariation', ProductVariationSchema);

export default ProductVariation;
