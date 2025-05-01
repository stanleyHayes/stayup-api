import mongoose from "mongoose";

const LoginSessionSchema = new mongoose.Schema({
    token: {type: String, required: true},
    login_time: {type: Date, default: Date.now}
}, {_id: false});

export default LoginSessionSchema;