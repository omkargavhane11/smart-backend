import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema({
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
        type: Object,
        required: true,
    },
    contactNo: {
        type: Number,
        required: true
    },
    businessName:{
        type:String,
        required:true
    }, 
    userType:{
        type:String,
        required:true
    }
},
    { timestamps: true }
);



export default mongoose.model("Merchant", merchantSchema);