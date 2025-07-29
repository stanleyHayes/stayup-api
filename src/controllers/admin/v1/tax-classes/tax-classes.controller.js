import mongoose, {Schema} from "mongoose";

const TaxClassSchema = new Schema({
    country: {type: String, required: true, trim: true},
    statue: {type: String, required: true, trim: true},
    postcodes: {type: [String]},
    cities: {type: [String]},
    rate: {type: Number, required: true},
    name: {type: String, required: true},
    priority: {type: Number, default: 1},
    compound: {type: Boolean, default: false},
    shipping: {type: Boolean, default: true},
    class: {type: Schema.Types.ObjectId, ref: 'TaxClass'}
}, {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

const TaxClass = mongoose.model('TaxClass', TaxClassSchema);