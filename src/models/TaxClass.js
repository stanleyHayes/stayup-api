import mongoose, {Schema} from "mongoose";

const TaxClassSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        lowercase: true,
        trim: true,
        unique: true
    }
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

const TaxClass = mongoose.model('TaxClass', TaxClassSchema);

export default TaxClass;