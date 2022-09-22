import mongoose from "mongoose";

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
        type: String,
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
    }
},
    { timestamps: true }
)

export default mongoose.model("Product", productSchema);