import ShippingZoneLocation from "../../../../models/ShippingZoneLocation.js";


export const createZoneLocation = async (req, res) => {
    try {
        const {code, type = 'state', shipping_zone} = req.body;

        if (!code || !shipping_zone) {
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Missing required fields: code or shipping_zone',
                data: null
            });
        }

        const location = await ShippingZoneLocation.create({code, type, shipping_zone});

        const populated = await ShippingZoneLocation.findById(location._id).populate({
            path: 'shipping_zone',
            populate: {
                path: 'shipping_method',
                select: 'title description enabled'
            }
        });

        res.status(httpStatuses.CREATED.code).json({
            message: 'Shipping zone location created successfully',
            data: populated
        });
    } catch (error) {
        console.error(`[ERROR] | createZoneLocation | ${error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: error.message});
    }
};


export const createBulkZoneLocations = async (req, res) => {
    try {
        const {locations} = req.body;

        if (!Array.isArray(locations) || locations.length === 0) {
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Invalid or empty "locations" array',
                data: null
            });
        }

        const valid = locations.filter(loc => loc.code && loc.shipping_zone);
        const inserted = await ShippingZoneLocation.insertMany(valid, {ordered: false});

        const ids = inserted.map(doc => doc._id);
        const populated = await ShippingZoneLocation.find({_id: {$in: ids}}).populate({
            path: 'shipping_zone',
            populate: {
                path: 'shipping_method',
                select: 'title description enabled'
            }
        });

        res.status(httpStatuses.CREATED.code).json({
            message: 'Shipping zone locations created successfully',
            data: populated,
            total: inserted.length
        });
    } catch (error) {
        console.error(`[ERROR] | createBulkZoneLocations | ${error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: error.message});
    }
};


export const updateZoneLocation = async (req, res) => {
    try {
        const {id} = req.params;

        const updated = await ShippingZoneLocation.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: 'shipping_zone',
            populate: {
                path: 'shipping_method',
                select: 'title description enabled'
            }
        });

        if (!updated) {
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping zone location not found',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping zone location updated successfully',
            data: updated
        });
    } catch (error) {
        console.error(`[ERROR] | updateZoneLocation | ${error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: error.message});
    }
};


export const getSingleZoneLocation = async (req, res) => {
    try {
        const {id} = req.params;

        const location = await ShippingZoneLocation.findOne({_id: id, is_deleted: false}).populate({
            path: 'shipping_zone',
            populate: {
                path: 'shipping_method',
                select: 'title description enabled'
            }
        });

        if (!location) {
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping zone location not found',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping zone location retrieved successfully',
            data: location
        });
    } catch (error) {
        console.error(`[ERROR] | getSingleZoneLocation | ${error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: error.message});
    }
};

export const getAllZoneLocations = async (req, res) => {
    try {
        const {
            page = 1,
            size = 10,
            sort = 'created_at',
            fields,
            search,
            type,
            shipping_zone
        } = req.query;

        const filter = {is_deleted: false};

        if (type) filter.type = type;
        if (shipping_zone) filter.shipping_zone = shipping_zone;
        if (search) filter.code = {$regex: search, $options: 'i'};

        const projection = {};
        if (fields) {
            fields.split(',').forEach(f => projection[f.trim()] = 1);
        }

        const skip = (parseInt(page) - 1) * parseInt(size);

        const data = await ShippingZoneLocation.find(filter, projection)
            .populate({
                path: 'shipping_zone',
                populate: {
                    path: 'shipping_method',
                    select: 'title description enabled'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(size));

        const total = await ShippingZoneLocation.countDocuments(filter);

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping zone locations fetched successfully',
            data,
            pagination: {
                total,
                page: parseInt(page),
                size: parseInt(size),
                totalPages: Math.ceil(total / size)
            }
        });
    } catch (error) {
        console.error(`[ERROR] | getAllZoneLocations | ${error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: error.message});
    }
};


export const getLocationsByZone = async (req, res) => {
    try {
        const {zoneId} = req.params;

        const locations = await ShippingZoneLocation.find({
            shipping_zone: zoneId,
            is_deleted: false
        }).populate({
            path: 'shipping_zone',
            populate: {
                path: 'shipping_method',
                select: 'title description enabled'
            }
        });

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping zone locations fetched successfully for given zone',
            data: locations
        });
    } catch (error) {
        console.error(`[ERROR] | getLocationsByZone | ${error.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: error.message});
    }
};
