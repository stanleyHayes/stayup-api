import mongoose, {Schema} from "mongoose";

const shippingMethodSchema = new Schema({
        title: {
            type: String,
            trim: true,
            required: [true, 'Shipping method title is required'],
        },
        description: {
            type: String,
            trim: true,
            required: [true, "Shipping method description is required"],
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}});

const ShippingMethod = mongoose.model("ShippingMethod", shippingMethodSchema);

export default ShippingMethod;