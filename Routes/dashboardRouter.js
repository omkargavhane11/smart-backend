import express from "express";
const router = express.Router();
import Order from "../Models/Order.js";

router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().count();
        const sales = await Order.aggregate([{ $group: { _id: 0, sum: { $sum: "$orderTotal" } } }]);
        const openOrder = await Order.find({ status: "Generated" }).count();


        res.send({ orders, sales: sales[0].sum, openOrder: openOrder });
    } catch (error) {
        res.send({ error: error.message });
    }
})


export default router;