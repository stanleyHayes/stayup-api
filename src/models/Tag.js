import mongoose from "mongoose";
import {slugify} from "../utils/helpers.js";

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tag name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    count: {
        type: Number,
        default: 0,
        immutable: true // read-only, managed by the system
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Auto-generate unique slug before validating
TagSchema.pre('validate', async function (next) {
    if (!this.slug && this.name) {
        let baseSlug = slugify(this.name);
        let slug = baseSlug;
        let counter = 1;

        while (await mongoose.models.Tag.exists({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
    next();
});

const Tag = mongoose.model("Tag", TagSchema);

export default Tag;
