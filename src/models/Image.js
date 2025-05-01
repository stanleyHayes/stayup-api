import mongoose from "mongoose";
import validator from "validator"; // Add this to validate URLs

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
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Image = mongoose.model("Image", ImageSchema);

export default Image;
