import express from "express";
const router = express.Router();
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();


// ₹ ₹ ₹ Razorpay Instance ₹ ₹ ₹
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


router.post("/checkout", async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR",
        };
        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        res.status(500).json({
            success: false
        })
    }
})

router.post("/paymentverification", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Database comes here  

        // await Order.create({
        //     price: "",
        //     description: "",
        //     image: "",
        //     storeId: "",
        //     paymentDetails: {
        //         razorpay_order_id,
        //         razorpay_payment_id,
        //         razorpay_signature,
        //     }
        // });

        // res.redirect(
        //     `http://localhost:3000/paymentsuccess?orderdetail=${razorpay_order_id}&&paymentdetail=${razorpay_payment_id}`
        // );
        res.send({ razorpay_order_id,razorpay_payment_id, success: true, })
    } else {
        res.status(400).json({
            success: false,
        });
    }
})


router.get("/getkey", (req, res) =>
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID })
);

export default router;
