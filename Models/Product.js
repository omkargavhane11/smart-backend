import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: "",
    },
    url: {
        type: String,
        default: "",
    },
    storeId: {
        type: String,
        default: "",
    },
    quantity: {
        type: Number,
        default: null
    },
    unit: {
        type: String,
        default: null
    },
    category: {
        type: String,
        default: null
    },
    subcategory: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: null
    },
    brand: {
        type: String,
        default: null
    },
    merchantId:{
        type: Schema.Types.ObjectId,
        required:true,
        ref:"Merchant"
    }
},
    { timestamps: true }
)

export default mongoose.model("Product", productSchema);