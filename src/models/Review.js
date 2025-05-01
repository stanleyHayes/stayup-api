import mongoose from "mongoose";
import validator from "validator";
import {updateProductRatings} from "../utils/helpers.js"; // To validate email

const ReviewSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"]
    },
    status: {
        type: String,
        enum: ["approved", "hold", "spam", "unspam", "trash", "untrash"],
        default: "approved"
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Reviewer name is required"],
        trim: true,
        ref: 'Customer'
    },
    reviewer_email: {
        type: String,
        required: [true, "Reviewer email is required"],
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: "Invalid email address"
        }
    },
    review: {
        type: String,
        required: [true, "Review content is required"],
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: [0, "Rating must be at least 0"],
        max: [5, "Rating cannot be more than 5"]
    },
    verified: {
        type: Boolean,
        default: false
    },
    average_rating: {
        type: String,
        default: "0.00"
    },
    rating_count: {
        type: Number,
        default: 0
    },
    verified_average_rating: {
        type: String,
        default: "0.00"
    },
    verified_rating_count: {
        type: Number,
        default: 0
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// After saving a review
ReviewSchema.post('save', async function () {
    if (this.product_id) {
        await updateProductRatings(this.product_id);
    }
});

// After removing a review
ReviewSchema.post('remove', async function () {
    if (this.product_id) {
        await updateProductRatings(this.product_id);
    }
});


const Review = mongoose.model("Review", ReviewSchema);

export default Review;
