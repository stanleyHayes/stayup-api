import cors from "cors";
import dotenv from 'dotenv';
import express from 'express';
import expressUserAgent from "express-useragent";
import helmet from 'helmet';

import hpp from 'hpp';
import mongoose from 'mongoose';
import morgan from 'morgan';

import rateLimit from 'express-rate-limit';

import adminCouponV1Router from './routes/admin/coupon.route.js';
import adminShippingMethodV1Router from './routes/admin/shipping-method.route.js';
import {mongoDBUri} from "./config/config.js";

dotenv.config();

const app = express();

// app.set('trust proxy', true);

console.info('Connecting to mongodb server');
mongoose.connect(mongoDBUri).then(() => {
    console.log('MongoDB Connected');
}).catch(error => {
    console.log(error);
});

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(hpp());
app.use(expressUserAgent.express());

const limiter = rateLimit({windowMs: 15 * 60 * 1000, max: 100});
app.use(limiter);

app.use('/api/v1/admin/coupons', adminCouponV1Router);
app.use('/api/v1/admin/shipping-methods', adminShippingMethodV1Router);

export default app;

