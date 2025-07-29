import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
    browser: { type: String },
    os: { type: String },
    platform: { type: String },
    source: { type: String }, // Example: 'Desktop' or 'Mobile'
    ip_address: { type: String },
}, { _id: false });

export default DeviceSchema;