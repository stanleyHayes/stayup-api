import {Schema} from "mongoose";

const DimensionSchema = new Schema({
    length: {type: Number, default: 0},
    width: {type: Number, default: 0},
    height: {type: Number, default: 0}
});

export default DimensionSchema;