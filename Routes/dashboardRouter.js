import express from "express";
const router = express.Router();
import Order from "../Models/Order.js";

router.get("/:merchantID", async (req, res) => {
    try {
        const orders = await Order.find({orderFor:req.params.merchantID}).count();
        const sales = await Order.aggregate([{$match:{orderFor:req.params.merchantID}},{ $group: { _id: 0, sum: { $sum: "$orderTotal" } } }]);
        const openOrder = await Order.find({ status: "Generated" }).count();

        res.send({ orders, sales: sales, openOrder: openOrder });
        // res.send(sales)
    } catch (error) {
        res.send({ error: error.message });
    }
});


export default router;