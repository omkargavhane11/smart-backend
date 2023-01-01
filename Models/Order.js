import mongoose from "mongoose";
const { Schema } = mongoose;

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
    // paymentDetails:{
    //     type:Object,
    //     required: true
    // },
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
    },
    orderFor:{
        type:Object,
        required:true
    },
    deliveryPartner:{
        type: Schema.Types.ObjectId,
        ref:"DeliveryPartner",
        default:null
    },
    orderLog:{
        type:[Object],
        default:[]
    }


},
    { timestamps: true }
)

export default mongoose.model("Order", orderSchema);



// const orderLog = [
//     {
//         status:"generated",
//         location:"user_location",
//         date:"",
//     },
//     {
//         status:"ready for dispatch",
//         location:"user_location",
//         date:"",
//     },
//     {
//         status:"dispatched",
//         location:"user_location",
//         date:"",
//     },
//     {
//         status:"out for delivery",
//         location:"user_location",
//         date:"",
//     },
//     {
//         status:"delivered",
//         location:"user_location",
//         date:"",
//     },
// ]