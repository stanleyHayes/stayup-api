import mongoose, {Schema} from "mongoose";
import {slugify} from "../utils/helpers.js";

const ShippingClassSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        unique: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

ShippingClassSchema.virtual('count', {
    ref: 'Product',
    localField: 'count',
    foreignField: '_id',
    count: true
});

ShippingClassSchema.pre('save', async function (next) {
    if(this.isModified('name')){
        this.name = slugify(this.name);
    }
    next();
});

const ShippingClass = mongoose.model('ShippingClass', ShippingClassSchema);

export default ShippingClass;