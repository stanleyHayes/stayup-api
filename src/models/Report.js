import mongoose, {Schema} from "mongoose";

const reportSchema = new Schema({

}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

const Report = mongoose.model("Report", reportSchema);

export default Report;