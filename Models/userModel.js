import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
    },
    email: {
        type: String,
        required: true,
        min: 5,
        max: 20,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 5,
        max: 20
    },
    address: {
        type: String,
        required: true,
    },
    contactNo: {
        type: Number,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }, 
    userType:{
        type:String,
        required:true
    }

},
    { timestamps: true }
);



export default mongoose.model("User", userSchema);