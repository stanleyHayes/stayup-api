import mongoose from "mongoose";

const MetadataSchema = new mongoose.Schema({
    key: {type: String, required: true},
    value: {type: String, required: true},
});

export default MetadataSchema;