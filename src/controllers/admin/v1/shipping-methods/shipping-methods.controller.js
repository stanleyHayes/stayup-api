import httpStatuses from "http-statuses";
import ShippingMethod from "../../../../models/ShippingMethod.js";


export const getShippingMethods = async (req, res) => {
    try {
        const {
            page = 1,
            size = 10,
            fields,          // Projection fields e.g., "title,description"
            sort = 'createdAt', // Sorting e.g., "-createdAt"
            title,
            description,
            ...otherFilters   // Catch any other dynamic filters
        } = req.query;

        const limit = parseInt(size);
        const skip = (parseInt(page) - 1) * limit;

        // Build search filter
        const filter = {};

        if (title) {
            filter.title = { $regex: title, $options: 'i' }; // case-insensitive
        }

        if (description) {
            filter.description = { $regex: description, $options: 'i' };
        }

        // Add any other filters directly (exact match)
        for (const key in otherFilters) {
            if (!['fields', 'sort', 'page', 'size'].includes(key)) {
                filter[key] = otherFilters[key];
            }
        }

        // Handle projection
        let projection = {};
        if (fields) {
            fields.split(',').forEach((field) => {
                projection[field.trim()] = 1;
            });
        }

        // Handle sorting
        let sortOrder = {};
        if (sort) {
            sort.split(',').forEach((field) => {
                const trimmed = field.trim();
                if (trimmed.startsWith('-')) {
                    sortOrder[trimmed.slice(1)] = -1;
                } else {
                    sortOrder[trimmed] = 1;
                }
            });
        }

        const shippingMethods = await ShippingMethod.find(filter, projection)
            .sort(sortOrder)
            .skip(skip)
            .limit(limit);

        const total = await ShippingMethod.countDocuments(filter);

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping methods fetched successfully',
            data: shippingMethods,
            pagination: {
                total,
                page: parseInt(page),
                size: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        console.error(`[ERROR] | Unable to retrieve shipping methods | ${e.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: e.message
        });
    }
};

export const getShippingMethodById = async (req, res) => {
    try {
        const {id} = req.params;

        const shippingMethod = await ShippingMethod.findById(id);
        if (!shippingMethod) {
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Unable to fetch Shipping method',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping method fetched successfully',
            data: shippingMethod
        });
    } catch (e) {
        console.error(`[ERROR] | Unable to retrieve shipping methods | ${e.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: e.message
        });
    }
}

export const createShippingMethods = async (req, res) => {
    try {
        const { methods } = req.body;

        if (!Array.isArray(methods) || methods.length === 0) {
            console.error(`[ERROR] | Invalid payload: methods must be a non-empty array | Received: ${JSON.stringify(req.body)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Missing or invalid "methods" array in request body',
                data: null
            });
        }

        const shippingMethods = await ShippingMethod.insertMany(methods, { ordered: false });

        if (!shippingMethods || shippingMethods.length === 0) {
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Unable to create any shipping methods',
                data: null
            });
        }

        res.status(httpStatuses.CREATED.code).json({
            message: 'Shipping methods created successfully',
            data: shippingMethods
        });
    } catch (e) {
        console.error(`[ERROR] | Unable to create shipping methods | ${e.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: e.message
        });
    }
}

export const createShippingMethod = async (req, res) => {
    try {
        const {title, description} = req.body;
        if (!title || !description) {
            console.error(`[ERROR] | Missing required fields | ${req.body.toString()}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Missing required fields',
                data: null
            });
        }
        const shippingMethod = await ShippingMethod.create({title, description});
        if (!shippingMethod) {
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Unable to create Shipping method',
                data: null
            });
        }

        res.status(httpStatuses.CREATED.code).json({
            message: 'Shipping method created successfully',
            data: shippingMethod
        });
    } catch (e) {
        console.error(`[ERROR] | Unable to retrieve shipping methods | ${e.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: e.message
        });
    }
}

export const updateShippingMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const method = await ShippingMethod.findById(id);
        if (!method) {
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping method not found',
                data: null
            });
        }

        const updatedMethod = await ShippingMethod.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping method updated successfully',
            data: updatedMethod
        });
    } catch (e) {
        console.error(`[ERROR] | Unable to update shipping method | ${e.message} | ${req.params.id}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: e.message
        });
    }
}

export const deleteShippingMethod = async (req, res) => {
    try {
        const {id} = req.params;
        const method = await ShippingMethod.findById(id);
        if (!method) {
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping method not found',
                data: null
            });
        }
        method.is_deleted = true;
        await ShippingMethod.updateOne({_id: id}, req.body, {
            runValidators: true,
            new: true,
        });

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping method deleted successfully',
            data: method
        });
    } catch (e) {
        console.error(`[ERROR] | Unable to delete shipping method | ${e.message} | ${req.params.id}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: e.message
        });
    }
}

