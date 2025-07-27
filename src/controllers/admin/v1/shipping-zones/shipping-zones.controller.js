import httpStatuses from "http-statuses";
import mongoose from "mongoose";

import ShippingZone from "../../../../models/ShippingZone.js";

export const createShippingZones = async (req, res) => {
    try {
        const {zones} = req.body;

        if (!Array.isArray(zones) || zones.length === 0) {
            console.error(`[ERROR] | Invalid payload: zones must be a non-empty array | Received: ${JSON.stringify(req.body)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Missing or invalid "zones" array in request body',
                data: null
            });
        }

        const validZones = [];
        const skippedZones = [];

        zones.forEach((zone, index) => {
            const {shipping_method, title} = zone;
            const missingFields = [];

            if (!shipping_method) missingFields.push('shipping_method');
            if (!title || typeof title !== 'string' || title.trim() === '') missingFields.push('title');

            if (missingFields.length > 0) {
                console.warn(`[WARN] | Skipping zone at index ${index} | Missing fields: ${missingFields.join(', ')} | Zone: ${JSON.stringify(zone)}`);
                skippedZones.push({
                    index,
                    zone,
                    reason: `Missing field(s): ${missingFields.join(', ')}`
                });
            } else {
                validZones.push({
                    ...zone,
                    title: title.trim(),
                    enabled: zone.enabled || false
                });
            }
        });

        if (validZones.length === 0) {
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'No valid zones provided',
                data: null,
                skipped: skippedZones
            });
        }

        const newZones = await ShippingZone.insertMany(validZones, {ordered: false});
        const insertedIds = newZones.map(zone => zone._id);

        const populatedShippingZones = await ShippingZone.find({_id: {$in: insertedIds}})
            .populate({path: 'shipping_method', select: 'title description'});

        res.status(httpStatuses.CREATED.code).json({
            message: 'Shipping zones created successfully',
            data: populatedShippingZones,
            total: populatedShippingZones.length,
            skipped: skippedZones.length > 0 ? skippedZones : undefined
        });

    } catch (error) {
        console.error(`[ERROR] | createShippingZones | Failed to create shipping zones | ${error.stack || error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: `Something went wrong | ${error.message}`,
        });
    }
};

export const createShippingZone = async (req, res) => {
    try {
        const {shipping_method, title, enabled} = req.body;

        const missingFields = [];
        if (!shipping_method) missingFields.push('shipping_method');
        if (!title || typeof title !== 'string' || title.trim() === '') missingFields.push('title');

        if (missingFields.length > 0) {
            console.warn(`[WARN] | createShippingZone | Missing required fields: ${missingFields.join(', ')} | Request body: ${JSON.stringify(req.body)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: `Missing required field(s): ${missingFields.join(', ')}`,
                data: null
            });
        }

        // Create the zone
        const newZone = await ShippingZone.create({
            shipping_method,
            title: title.trim(),
            enabled: enabled || false
        });

        // Populate the shipping_method reference
        const populatedZone = await ShippingZone.findById(newZone._id).populate('shipping_method').lean();

        if (!populatedZone) {
            console.error(`[ERROR] | createShippingZone | Failed to retrieve populated shipping zone | ID: ${newZone._id}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Unable to create shipping zone',
                data: null
            });
        }

        res.status(httpStatuses.CREATED.code).json({
            message: 'Shipping zone created successfully',
            data: populatedZone
        });
    } catch (error) {
        console.error(`[ERROR] | createShippingZone | Unexpected error: ${error.stack || error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: `Something went wrong | ${error.message}`
        });
    }
};

export const getShippingZones = async (req, res) => {
    try {
        const {page = 1, size = 10, fields, sort = '-created_at', title} = req.query;

        const limit = parseInt(size);
        const skip = (parseInt(page) - 1) * limit;

        const filter = {};
        if (title) {
            filter.title = {$regex: title, $options: 'i'};
        }
        const projection = {};
        if (fields) {
            fields.split(',').forEach((field) => {
                projection[field.trim()] = 1;
            });
        }

        const sortOrder = {};
        if (sort) {
            sort.split(',').forEach((field) => {
                const trimmed = field.trim().toLowerCase();
                if (trimmed.startsWith('-1')) {
                    sortOrder[trimmed.slice(1)] = -1;
                } else {
                    sortOrder[trimmed] = 1;
                }
            });
        }

        const shippingZones = await ShippingZone.find(filter)
            .sort(sortOrder)
            .limit(limit)
            .skip(skip)
            .populate('shipping_method').lean();

        const total = await ShippingZone.countDocuments(filter);

        res.status(httpStatuses.OK.code).json({
            message: 'Successfully retrieved shipping zone methods.',
            data: shippingZones,
            total
        });
    } catch (error) {
        console.error(`[ERROR] | getShippingZones | Unable to retrieve shipping zone methods | ${error}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: `Something went wrong | ${error.message}`,
        });
    }
}

export const getShippingZoneById = async (req, res) => {
    try {
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[WARN] | getShippingZoneById | Invalid ObjectId format: ${id}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Invalid shipping zone ID format',
                data: null
            });
        }

        const zone = await ShippingZone.findById(id)
            .populate('shipping_method', 'title description')
            .lean();

        if (!zone) {
            console.error(`[ERROR] | getShippingZoneById | Zone not found for ID: ${id}`);
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping zone not found',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping zone retrieved successfully',
            data: zone
        });
    } catch (error) {
        console.error(`[ERROR] | getShippingZoneById | Failed for ID: ${req.params.id} | ${error.stack || error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: `Something went wrong | ${error.message}`,
        });
    }
};

export const deleteShippingZone = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[WARN] | deleteShippingZone | Invalid ObjectId format: ${id}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Invalid shipping zone ID format',
                data: null
            });
        }

        const updated = await ShippingZone.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        ).populate('shipping_method', 'title description');

        if (!updated) {
            console.error(`[ERROR] | deleteShippingZone | Zone not found for ID: ${id}`);
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping zone not found',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping zone deleted successfully (soft delete)',
            data: updated
        });
    } catch (error) {
        console.error(`[ERROR] | deleteShippingZone | Failed for ID: ${req.params.id} | ${error.stack || error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: `Something went wrong | ${error.message}`
        });
    }
};

export const updateShippingZone = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[WARN] | updateShippingZone | Invalid ObjectId format: ${id}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Invalid shipping zone ID format',
                data: null
            });
        }

        const updateData = req.body;

        const zone = await ShippingZone.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).populate('shipping_method', 'title description');

        if (!zone) {
            console.error(`[ERROR] | updateShippingZone | Zone not found for ID: ${id}`);
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping zone not found',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping zone updated successfully',
            data: zone
        });
    } catch (error) {
        console.error(`[ERROR] | updateShippingZone | Failed for ID: ${req.params.id} | ${error.stack || error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: `Something went wrong | ${error.message}`
        });
    }
};

