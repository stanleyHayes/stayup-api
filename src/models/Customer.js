import mongoose from "mongoose";
import validator from "validator";

import AddressSchema from "../schemas/address.schema.js";
import LoginSessionSchema from "../schemas/LoginSession.js";
import DeviceSchema from "../schemas/device.schema.js";


// Full Customer Schema
const CustomerSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    last_name: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    display_name: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
    },
    referral_code: {
        type: String,
        unique: true,
        sparse: true, // Unique only if exists
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email address'
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: validator.isMobilePhone,
            message: 'Invalid phone number'
        }
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        validate: {
            validator: validator.isStrongPassword,
            message: 'Password is too weak. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special symbol.'
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers: [longitude, latitude]
            required: true,
            validate: {
                validator: function(coords) {
                    return coords.length === 2;
                },
                message: 'Coordinates must be [longitude, latitude]'
            }
        }
    },
    billing: AddressSchema,
    shipping: AddressSchema,
    meta_data: [{ type: mongoose.Schema.Types.Mixed }],
    avatar_url: { type: String },
    gender: { type: String, enum: ['male', 'female'] },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    is_paying_customer: { type: Boolean, default: false },
    devices: [DeviceSchema],
    login_sessions: [LoginSessionSchema]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Customer = mongoose.model('Customer', CustomerSchema);

export default Customer;
