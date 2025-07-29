import mongoose from "mongoose";
import {ImageSchema} from "../schemas/image.schema.js";
import {updateCategoryProductCounts} from "../utils/helpers.js";
import MetadataSchema from "../schemas/metadata.schema.js";

// Dimensions schema
const dimensionsSchema = new mongoose.Schema({
    length: {type: String},
    width: {type: String},
    height: {type: String}
}, {_id: false});


const ProductSchema = new mongoose.Schema({
    name: {type: String, required: true},
    slug: {type: String, required: true, unique: true},
    permalink: {type: String},
    type: {type: String, enum: ["simple", "grouped", "external", "variable"], default: "simple"},
    status: {type: String, enum: ["draft", "pending", "private", "publish"], default: "publish"},
    featured: {type: Boolean, default: false},
    catalog_visibility: {type: String, enum: ["visible", "catalog", "search", "hidden"], default: "visible"},
    description: {type: String},
    short_description: {type: String},
    sku: {type: String, unique: true, sparse: true},
    regular_price: {type: String},
    sale_price: {type: String},
    date_on_sale_from: {type: Date},
    date_on_sale_to: {type: Date},
    virtual: {type: Boolean, default: false},
    external_url: {type: String},
    button_text: {type: String},
    tax_status: {type: String, enum: ["taxable", "shipping", "none"], default: "taxable"},
    tax_class: {type: String},
    manage_stock: {type: Boolean, default: false},
    stock_quantity: {type: Number},
    stock_status: {type: String, enum: ["instock", "outofstock", "onbackorder"], default: "instock"},
    backorders: {type: String, enum: ["no", "notify", "yes"], default: "no"},
    sold_individually: {type: Boolean, default: false},
    weight: {type: Number},
    dimensions: dimensionsSchema,
    shipping_required: {type: Boolean, default: true},
    shipping_taxable: {type: Boolean, default: true},
    shipping_class: {type: String},
    shipping_class_id: {type: mongoose.Schema.Types.ObjectId, ref: "ShippingClass"},
    reviews_allowed: {type: Boolean, default: true},
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: "Category"}],
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: "Tag"}],
    images: [ImageSchema],
    attributes: [{type: mongoose.Schema.Types.ObjectId, ref: "Attribute"}],
    variations: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}], // references to variation products
    grouped_products: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}], // references to grouped products
    upsell_ids: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
    cross_sell_ids: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
    parent_id: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
    purchase_note: {type: String},
    meta_data: [MetadataSchema],
    total_sales: {type: Number, default: 0},
    average_rating: {type: Number, default: 0.00},
    rating_count: {type: Number, default: 0},
    on_sale: {type: Boolean, default: false},
    purchasable: {type: Boolean, default: true},
    default_attributes: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute" },
            name: { type: String },
            option: { type: String }
        }
    ]
}, {
    timestamps: {createdAt: 'date_created', updatedAt: 'updated_at'},
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Auto-calculate on_sale before save
ProductSchema.pre('save', function (next) {
    const now = new Date();

    if (this.sale_price) {
        if (this.date_on_sale_from && this.date_on_sale_to) {
            this.on_sale = now >= this.date_on_sale_from && now <= this.date_on_sale_to;
        } else if (this.date_on_sale_from && !this.date_on_sale_to) {
            this.on_sale = now >= this.date_on_sale_from;
        } else {
            // Sale price exists but no date limits
            this.on_sale = true;
        }
    } else {
        this.on_sale = false;
    }
    next();
});

// After saving a product
ProductSchema.post('save', async function () {
    await updateCategoryProductCounts();
});

// After removing a product
ProductSchema.post('remove', async function () {
    await updateCategoryProductCounts();
});


// Auto-calculate purchasable before save
ProductSchema.pre('save', function (next) {
    if (this.manage_stock) {
        this.purchasable = this.stock_quantity > 0;
    } else {
        this.purchasable = true;
    }
    next();
});


// After saving a product
ProductSchema.post('save', async function () {
    await updateTagCounts();
});

// After removing a product
ProductSchema.post('remove', async function () {
    await updateTagCounts();
});


const Product = mongoose.model("Product", ProductSchema);

export default Product;