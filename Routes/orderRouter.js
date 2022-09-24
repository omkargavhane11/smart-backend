import express from "express";
const router = express.Router();
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";

router.post("/", async (req, res) => {
    try {
        const newOrder = await Order.create({
            productDetail: req.body.productDetail,
            deliveryAddress: req.body.deliveryAddress,
            user: req.body.user,
            orderTotal: req.body.orderTotal,
            contactNo: req.body.contactNo,
        })

        // reduce stock quantity of product
        const findProduct = await Product.findOne({ _id: req.body.productDetail._id })

        // reduce stock quantity by order quanity
        const updateProduct = await Product.updateOne({ _id: req.body.id }, { $set: { quantity: findProduct.productDetail.quantity - req.body.productDetail.order_quantity } });

        res.send({ msg: "ok" })
    } catch (err) {
        res.send({ msg: err.message })
    }
})

// get all orders
router.get("/", async (req, res) => {
    try {
        const userOrders = await Order.find({});
        console.log(userOrders);
        res.send(userOrders)
        // res.redirect("http://localhost:3000/orders")
    } catch (err) {
        res.send({ msg: err.message })
    }
})

// get user specific orders
router.get("/:id", async (req, res) => {
    try {
        const userOrders = await Order.find({ user: req.params.id });
        res.send(userOrders)
    } catch (err) {
        res.send({ msg: err.message })
    }
})

// update order
router.put("/:orderid", async (req, res) => {
    try {
        const updateOrder = await Order.updateOne({ _id: req.params.orderid }, { $set: req.body });
        res.send({ msg: "success" })
    } catch (err) {
        res.send({ msg: err.message })
    }
})


export default router;