import {isValidCity, isValidCountry, isValidState} from "../utils/helpers.js";
import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    country: {
        type: String,
        required: [true, 'Country is required'],
        validate: {
            validator: isValidCountry,
            message: props => `${props.value} is not a valid country`
        }
    },
    country_code: {
        type: String,
        required: [true, 'Country code is required']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        validate: {
            validator: function(value) {
                return isValidState(this.country_code, value);
            },
            message: props => `${props.value} is not a valid state in ${props.instance.country}`
        }
    },
    state_code: {
        type: String,
        required: [true, 'State code is required']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        validate: {
            validator: function(value) {
                return isValidCity(this.country_code, this.state_code, value);
            },
            message: props => `${props.value} is not a valid city in ${props.instance.state}`
        }
    },
    address_1: {
        type: String,
        required: [true, 'AddressModel Line 1 is required']
    },
    address_2: {
        type: String
    },
    postcode: {
        type: String
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(value) {
                return validator.isMobilePhone(value);
            },
            message: 'Invalid phone number'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: function(value) {
                return validator.isEmail(value);
            },
            message: 'Invalid email address'
        }
    },
    digital_address: {
        type: String
    },
    community_or_area: {
        type: String
    }
});

export default AddressSchema;