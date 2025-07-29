import httpStatuses from "http-statuses";
import ShippingClass from "../../../../models/shipping-class.model.js";

export const createShippingClass = async (req, res) => {
    try {
        const {name} = req.body;
        if (!name) {
            console.error(`[ERROR] | Missing required field name | Received ${JSON.stringify(req.body)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({message: "Please enter name"});
        }
        const shippingClass = await ShippingClass.create({name});
        if (!shippingClass) {
            console.error(`[ERROR] | Unable to create shipping class | Received ${JSON.stringify(req.body)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({message: "Unable to create a shipping class"});
        }
        res.status(httpStatuses.CREATED.code).json({
            message: 'Created Shipping Class Successfully',
            data: shippingClass
        })
    } catch (e) {
        console.error(`[ERROR] createShippingClass | Creating Shipping Class Schema: ${e} | Received: ${JSON.stringify(req.body)}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: e});
    }
}

export const createShippingClasses = async (req, res) => {
    try {
        const {classes} = req.body;

        if (!Array.isArray(classes) || classes.length === 0) {
            console.error(`[ERROR] Invalid payload: Must be a non-empty array | Received: ${JSON.stringify(req.body)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Invalid payload: classes must be a non-empty array'
            });
        }

        const validClasses = [];
        const invalidClasses = [];

        classes.forEach((item) => {
            if (!item?.name || typeof item.name !== 'string' || item.name.trim() === '') {
                invalidClasses.push(item);
            } else {
                validClasses.push({name: item.name.trim()});
            }
        });

        if (validClasses.length === 0) {
            console.error(`[ERROR] No valid shipping classes to create | Invalid: ${JSON.stringify(invalidClasses)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'No valid shipping classes found in the request',
                invalidClasses
            });
        }

        const createdClasses = await ShippingClass.insertMany(validClasses, {ordered: false});

        console.info(`[INFO] Created ${createdClasses.length} shipping classes`);
        res.status(httpStatuses.CREATED.code).json({
            message: 'Created shipping classes successfully',
            data: createdClasses,
            invalidClasses
        });

    } catch (e) {
        console.error(`[ERROR] createShippingClasses | ${e.message} | Payload: ${JSON.stringify(req.body)}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({
            message: `Failed to create shipping classes | ${e.message}`
        });
    }
};

export const getShippingClass = async (req, res) => {
    try {
        res.status(httpStatuses.OK.code).json({
            message: 'Created Shipping Classes Successfully',
            data: null
        })
    } catch (e) {
        console.error(`[ERROR] createShippingClass | Creating Shipping Class Schema: ${e} | Received: ${JSON.stringify(req.body)}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: e});
    }
}

export const deleteShippingClass = async (req, res) => {
    try {
        const {id} = req.params;

        const deleted = await ShippingClass.findByIdAndUpdate(id, {is_deleted: true}, {new: true});

        if (!deleted) {
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping class not found',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping class deleted (soft delete)',
            data: deleted
        });
    } catch (e) {
        console.error(`[ERROR] deleteShippingClass | ${e.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: e.message});
    }
};


export const updateShippingClass = async (req, res) => {
    try {
        const {id} = req.params;
        const {name} = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: 'Invalid payload: name is required'
            });
        }

        const updated = await ShippingClass.findByIdAndUpdate(id, {name: name.trim()}, {
            new: true,
            runValidators: true
        });

        if (!updated) {
            return res.status(httpStatuses.NOT_FOUND.code).json({
                message: 'Shipping class not found',
                data: null
            });
        }

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping class updated successfully',
            data: updated
        });
    } catch (e) {
        console.error(`[ERROR] updateShippingClass | ${e.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: e.message});
    }
};


export const getShippingClasses = async (req, res) => {
    try {
        const {
            page = 1,
            size = 20,
            sort = 'created_at',
            fields,
            search
        } = req.query;

        const filter = {};
        if (search) {
            filter.name = {$regex: search, $options: 'i'};
        }

        const projection = {};
        if (fields) {
            fields.split(',').forEach(f => projection[f.trim()] = 1);
        }

        const limit = parseInt(size);
        const skip = (parseInt(page) - 1) * limit;

        const shippingClasses = await ShippingClass.find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await ShippingClass.countDocuments(filter);

        res.status(httpStatuses.OK.code).json({
            message: 'Shipping classes fetched successfully',
            data: shippingClasses,
            pagination: {
                total,
                page: parseInt(page),
                size: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        console.error(`[ERROR] getShippingClasses | ${e.message}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({message: e.message});
    }
};

export const bulkDeleteShippingClasses = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            console.error(`[ERROR] bulkDeleteShippingClasses | Invalid payload: "ids" must be a non-empty array | Received: ${JSON.stringify(req.body)}`);
            return res.status(httpStatuses.BAD_REQUEST.code).json({
                message: '"ids" must be a non-empty array of MongoDB ObjectIds'
            });
        }

        const result = await ShippingClass.updateMany(
            { _id: { $in: ids } },
            { $set: { is_deleted: true } }
        );

        res.status(httpStatuses.OK.code).json({
            message: `Soft-deleted ${result.modifiedCount} shipping class(es)`,
            modifiedCount: result.modifiedCount
        });
    } catch (e) {
        console.error(`[ERROR] bulkDeleteShippingClasses | ${e.message} | Payload: ${JSON.stringify(req.body)}`);
        res.status(httpStatuses.INTERNAL_SERVER_ERROR.code).json({ message: e.message });
    }
};
