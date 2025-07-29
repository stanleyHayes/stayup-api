import mongoose from "mongoose";
import { ImageSchema } from "../schemas/image.schema.js";

// Helper function to generate slug
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/--+/g, '-')      // Replace multiple hyphens with single hyphen
        .replace(/^-+/, '')          // Trim hyphens from start
        .replace(/-+$/, '');         // Trim hyphens from end
};

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    description: {
        type: String,
        trim: true
    },
    display: {
        type: String,
        enum: ["default", "products", "subcategories", "both"],
        default: "default"
    },
    image: {
        type: ImageSchema,
        default: null
    },
    menu_order: {
        type: Number,
        default: 0
    },
    count: {
        type: Number,
        default: 0,
        immutable: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Smart Slugging: generate and ensure uniqueness
CategorySchema.pre('validate', async function (next) {
    if (!this.slug && this.name) {
        let baseSlug = slugify(this.name);
        let slug = baseSlug;
        let counter = 1;

        // Keep trying until a unique slug is found
        while (await mongoose.models.Category.exists({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
    next();
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;
