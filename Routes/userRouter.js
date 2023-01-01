import express from "express";
const router = express.Router();
import User from "../Models/userModel.js";
import Merchant from "../Models/merchantModal.js";


// ✅ CUSTOMER 
router.post("/register", async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.send({ msg: "success" })
        // console.log(req.body)
    } catch (error) {
        res.send({ msg: "Error creating user" });
    }
})

// get all users
router.get("/", async (req, res) => {
    try {
        const getAll = await User.find({}, { password: 0 });
        res.send(getAll)
    } catch (error) {
        res.send({ msg: error });
    }
})

// get user by ID
router.get("/:id", async (req, res) => {
    try {
        const getUser = await User.find({ _id: req.params.id }, { password: 0 });
        res.send(getUser)
    } catch (error) {
        res.send({ msg: error });
    }
})

// edit user details by ID
router.put("/:id", async (req, res) => {
    try {
        const getUser = await User.updateOne({ _id: req.params.id }, { $set: req.body });
        res.send(getUser)
    } catch (error) {
        res.send({ msg: error });
    }
})

// ✅ MERCHANT 
router.post("/merchant/register", async (req, res) => {
    try {
        const newUser = await Merchant.create(req.body);
        res.send({ msg: "success" })
        // console.log(req.body)
    } catch (error) {
        res.send({ msg: error.message });
    }
})

// get all users
router.get("/merchant", async (req, res) => {
    try {
        const getAll = await Merchant.find({}, { password: 0 });
        res.send(getAll)
    } catch (error) {
        res.send({ msg: error });
    }
})

// get user by ID
router.get("/merchant/:id", async (req, res) => {
    try {
        const getUser = await Merchant.find({ _id: req.params.id }, { password: 0 });
        res.send(getUser)
    } catch (error) {
        res.send({ msg: error });
    }
})

// edit user details by ID
router.put("/merchant/:id", async (req, res) => {
    try {
        const getUser = await Merchant.updateOne({ _id: req.params.id }, { $set: req.body });
        res.send(getUser)
    } catch (error) {
        res.send({ msg: error });
    }
})


// ✅ DELIVERY PARTNER 
router.post("/deliverypartner/register", async (req, res) => {
    try {
        const newUser = await Merchant.create(req.body);
        res.send({ msg: "success" })
        // console.log(req.body)
    } catch (error) {
        res.send({ msg: "Error creating user" });
    }
})

// get all users
router.get("/deliverypartner", async (req, res) => {
    try {
        const getAll = await Merchant.find({}, { password: 0 });
        res.send(getAll)
    } catch (error) {
        res.send({ msg: error });
    }
})

// get user by ID
router.get("/deliverypartner/:id", async (req, res) => {
    try {
        const getUser = await Merchant.find({ _id: req.params.id }, { password: 0 });
        res.send(getUser)
    } catch (error) {
        res.send({ msg: error });
    }
})

// edit user details by ID
router.put("/deliverypartner/:id", async (req, res) => {
    try {
        const getUser = await Merchant.updateOne({ _id: req.params.id }, { $set: req.body });
        res.send(getUser)
    } catch (error) {
        res.send({ msg: error });
    }
})


export default router;