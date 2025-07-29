// Helper function to validate existence
import countries from "i18n-iso-countries";
import {City, State} from "country-state-city";
import mongoose from "mongoose";
import Category from "../models/Category.js";

export const validateExistence = async (Model, idsOrEmails, field = '_id') => {
    if (!idsOrEmails || !idsOrEmails.length) return;

    const query = {[field]: {$in: idsOrEmails}};
    const count = await Model.countDocuments(query);

    if (count !== idsOrEmails.length) {
        throw new Error(`One or more provided ${field === '_id' ? 'IDs' : 'emails'} do not exist.`);
    }
};

// Validate country name using i18n-iso-countries
export const isValidCountry = (countryName) => {
    const countriesList = countries.getNames('en', { select: 'official' });
    return Object.values(countriesList).includes(countryName);
};

// Validate state name based on country code
export const isValidState = (countryCode, stateName) => {
    if (!countryCode) return false;
    const states = State.getStatesOfCountry(countryCode);
    return states.some(state => state.name.toLowerCase() === stateName.toLowerCase());
};

// Validate city name based on country code and state code
export const isValidCity = (countryCode, stateCode, cityName) => {
    if (!countryCode || !stateCode) return false;
    const cities = City.getCitiesOfState(countryCode, stateCode);
    return cities.some(city => city.name.toLowerCase() === cityName.toLowerCase());
};


export const getClientIp = (req) => {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim();
    }
    return req.socket?.remoteAddress;
};


// Function to update count for all categories
export async function updateCategoryProductCounts() {
    const counts = await mongoose.model('Product').aggregate([
        { $unwind: "$categories" },
        { $group: { _id: "$categories.id", count: { $sum: 1 } } }
    ]);

    // Reset all counts to 0 first
    await Category.updateMany({}, { count: 0 });

    // Update each category with its new count
    for (const c of counts) {
        await Category.findByIdAndUpdate(c._id, { count: c.count });
    }
}


// Helper to generate clean slugs
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
        .replace(/--+/g, '-')      // Replace multiple hyphens
        .replace(/^-+/, '')          // Trim hyphens from start
        .replace(/-+$/, '');         // Trim hyphens from end
};


export const updateProductRatings = async (productId) => {
    try {
        const Review = mongoose.model('Review');

        // Calculate ALL approved reviews
        const allStats = await Review.aggregate([
            { $match: { product_id: new mongoose.Types.ObjectId(productId), status: "approved" } },
            {
                $group: {
                    _id: "$product_id",
                    averageRating: { $avg: "$rating" },
                    ratingCount: { $sum: 1 }
                }
            }
        ]);

        // Calculate VERIFIED approved reviews
        const verifiedStats = await Review.aggregate([
            { $match: { product_id: new mongoose.Types.ObjectId(productId), status: "approved", verified: true } },
            {
                $group: {
                    _id: "$product_id",
                    verifiedAverage: { $avg: "$rating" },
                    verifiedCount: { $sum: 1 }
                }
            }
        ]);

        if (allStats.length > 0) {
            const { averageRating, ratingCount } = allStats[0];

            const verifiedData = verifiedStats[0] || { verifiedAverage: 0, verifiedCount: 0 };

            await Product.findByIdAndUpdate(productId, {
                average_rating: averageRating.toFixed(2),
                rating_count: ratingCount,
                verified_average_rating: verifiedData.verifiedAverage.toFixed(2),
                verified_rating_count: verifiedData.verifiedCount
            });
        } else {
            // No reviews at all
            await Product.findByIdAndUpdate(productId, {
                average_rating: "0.00",
                rating_count: 0,
                verified_average_rating: "0.00",
                verified_rating_count: 0
            });
        }

    } catch (error) {
        console.error(`[updateProductRatings] Error:`, error.message);
    }
};