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
        trim: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}});

const ShippingZone = mongoose.model("ShippingZone", ShippingZoneSchema);

export default ShippingZone;