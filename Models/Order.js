import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    productDetail: {
        type: Object,
        required: true
    },
    orderTotal: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        type: String,
        default: "",
        required: true
    },
    contactNo: {
        type: Number,
        required: true
    },
    isPaymentPaid: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: "Generated"
    },
    user: {
        type: String,
        default: "",
    },
    isCancelled: {
        type: Boolean,
        default: false,
    }


},
    { timestamps: true }
)

export default mongoose.model("Order", orderSchema);