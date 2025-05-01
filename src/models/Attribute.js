import mongoose from "mongoose";
import {slugify} from "../utils/helpers.js";

const AttributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Attribute name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['select'], // You can extend later
        default: 'select'
    },
    order_by: {
        type: String,
        enum: ['menu_order', 'name', 'name_num', 'id'],
        default: 'menu_order'
    },
    has_archives: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Auto-generate slug before validating
AttributeSchema.pre('validate', async function (next) {
    if (!this.slug && this.name) {
        let baseSlug = slugify(this.name);
        let slug = baseSlug;
        let counter = 1;

        while (await mongoose.models.Attribute.exists({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
    next();
});

const Attribute = mongoose.model("Attribute", AttributeSchema);

export default Attribute;
