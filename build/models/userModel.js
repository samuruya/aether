
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        tag: {
            type: String, 
            required: true, 
            minlength: 3,
            maxlength: 12
        },
        email: {
            type: String, 
            required: true, 
            minlength: 3,
            maxlength: 200, 
            unique: true
        },
        password: {
            type: String, 
            required: true, 
            minlength: 3,
            maxlength: 1024
        },
        bio: {
            type: String,
            required: true,
            minlength: 0,
            maxlength: 255,
        },
        pfp: {
            type: String,
            required: true,
            minlength: 0,
            maxlength: 1024,
        }
    }, {
        timestamps: true,
    }
);

const userModel = mongoose.model("User", userSchema)

module.exports = userModel