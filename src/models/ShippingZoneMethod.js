import mongoose, {Schema} from "mongoose";

const ShippingZoneSchema = new Schema({
    shipping_method: {
        type: Schema.Types.ObjectId,
        ref: 'ShippingMethod',
        required: [true, 'Shipping Method Required']
    },
    title: {
        type: String,
        required: [true, 'Title Required'],
        trim: true,
    },
    order: {
        type: Number,
        required: [true, 'Order Number Required']
    },
    enabled: {
        type: Boolean,
        default: false
    },
    method_title: {
        type: String,
        required: [true, 'Method Title Required'],
        trim: true,
    },
    method_description: {
        type: String,
        required: [true, 'Method Title Required'],
        trim: true,
    }
}, {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}});

const ShippingZone = mongoose.model("ShippingZone", ShippingZoneSchema);

export default ShippingZone;