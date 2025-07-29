import mongoose, { Schema } from "mongoose";

const TaxRateSchema = new Schema({
    country: {
        type: String,
        required: [true, 'Country code is required'],
        uppercase: true,
        trim: true,
        maxlength: 2, // ISO 3166-1 alpha-2
        description: 'Country ISO 3166 code'
    },
    state: {
        type: String,
        trim: true,
        description: 'State code or region (optional)'
    },
    postcodes: {
        type: [String],
        default: [],
        description: 'Array of ZIP/postcodes'
    },
    cities: {
        type: [String],
        default: [],
        description: 'Array of cities where this tax rate applies'
    },
    rate: {
        type: String,
        required: [true, 'Tax rate percentage is required'],
        trim: true,
        match: [/^\d+(\.\d{1,4})?$/, 'Rate must be a decimal string with up to 4 places'],
        description: 'Tax rate as a percentage (e.g. "15.0000")'
    },
    name: {
        type: String,
        required: [true, 'Tax rate name is required'],
        trim: true,
        description: 'Human-readable name for the tax rate'
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        description: 'Only one rate per priority will apply per location'
    },
    compound: {
        type: Boolean,
        default: false,
        description: 'Whether this is a compound tax (applied on top of others)'
    },
    shipping: {
        type: Boolean,
        default: true,
        description: 'Whether the tax applies to shipping charges'
    },
    order: {
        type: Number,
        default: 1,
        description: 'Display order when querying or listing tax rates'
    },
    class: {
        type: String,
        default: 'standard',
        trim: true,
        lowercase: true,
        description: 'Tax class this rate belongs to (e.g. "standard", "reduced", etc.)'
    },
    is_deleted: {
        type: Boolean,
        default: false,
        description: 'Soft-delete flag'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const TaxRate = mongoose.model('TaxRate', TaxRateSchema);

export default TaxRate;
