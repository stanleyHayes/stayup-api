import mongoose, {Schema} from "mongoose";


const ShippingZoneLocationSchema = new Schema({
    type: {
        type: String,
        enum: ['postcode', 'state', 'country', 'continent', 'city', 'district', 'region', 'area', 'gps_zone', 'hub', 'custom'],
        default: 'state'
    },
    code: {
        type: String,
        required: [true, 'Code is required'],
        trim: true,
        description: 'Shipping zone location code (e.g., region name, city name, or postcode)'
    },
    shipping_zone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShippingZone',
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}, toJSON: {virtuals: true}, toObject: {virtuals: true}});

const ShippingZoneLocation = mongoose.model('ShippingZoneLocation', ShippingZoneLocationSchema);

export default ShippingZoneLocation;