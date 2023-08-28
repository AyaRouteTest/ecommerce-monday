
import mongoose, { Schema, model } from "mongoose"

// Schema
const userSchema = new Schema({
    
    userName : {
        type: String,
        required: true,
        min:3,
        max: 20
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    phone: {
        type: String
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: "offline"
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }, isConfirmed: {
        type: Boolean,
        default: false
    }, forgetCode: String,
    activationCode: String,
    profileImage: {
        url: {
            type: String,
            default: "https://res.cloudinary.com/doogob7zl/image/upload/v1690825514/ecommerceDefaults/user/profilePic_omg5ry.jpg"
        },
        id: {
            type: String,
            default: "ecommerceDefaults/user/profilePic_omg5ry"
        }
    },
    coverImages: [{url: {type: String, required: true}, id: {type: String, required: true}}]
},{timestamps: true})

// Model
export const User = mongoose.models.User || model('User', userSchema)