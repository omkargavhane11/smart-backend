import express from "express";
const router = express.Router();
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";

router.post("/", async (req, res) => {
    try {
        const newOrder = await Order.create(req.body);

        // reduce stock quantity of product
        const findProduct = await Product.findOne({ _id: req.body.productDetail._id });

        const updated_quantity = findProduct.quantity - req.body.productDetail.order_quantity;

        // reduce stock quantity by order quanity
        const updateProduct = await Product.updateOne({ _id: req.body.productDetail._id }, { $set: { quantity: updated_quantity } });


        if(updateProduct.modifiedCount === 1){
            res.send({ msg: "ok" })
        }else{
            res.send({msg:"not ok"})
        }

        // console.log({findProduct,updated_quantity})
    } catch (err) {
        res.send({ error: err.message })
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

    const {orderLog, ...others} = req.body;
    try {
        const data = req.body.orderLog ?  await Order.updateOne({ _id: req.params.orderid },{$set: others},{$push:{orderLog:orderLog}}) : 
            await Order.updateOne({ _id: req.params.orderid},{ $set: others });
        
        if(data.modifiedCount === 1){
            res.send({ msg: "success" });
        }else{
            res.send({ msg: "failed" });
        }

    } catch (err) {
        res.send({ msg: "failed", error: err.message })
    }

    // console.log( others)
})


// get orders which are ready to be dispatched
router.get("/deliverypartner/first", async(req,res) => {
    try {
        const mydata = await Order.find({status:{$in:["Dispatched", "Out for delivery", "Delivered"]}});
        const toPick = await Order.find({status:"Ready for dispatch"});

        res.send([...mydata,...toPick]);
    } catch (error) {
        res.send({msg :"failed", error:error.message});
    }
})


export default router;