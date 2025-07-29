import mongoose from "mongoose";
import validator from "validator";

export const ImageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    alt: {
        type: String,
        trim: true,
        default: function() {
            return this.name; // Default alt to name if not provided
        }
    },
    src: {
        type: String,
        required: [true, 'Src is required'],
        trim: true,
        validate: {
            validator: function(value) {
                return validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true });
            },
            message: 'Invalid image URL'
        }
    }
});

export default ImageSchema;
