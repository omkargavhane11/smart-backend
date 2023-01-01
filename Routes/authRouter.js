import express from "express";
const router = express.Router();
import User from "../Models/userModel.js";
import Merchant from "../Models/merchantModal.js";
import DeliveryPartner from "../Models/deliveryPerson.js";


// customer auth
router.post("/customer", async (req, res) => {
    try {
        const findEmail = await User.findOne({ email: req.body.email });

        if (findEmail) {
            if (findEmail.password === req.body.password) {
                const { password, ...others } = findEmail._doc;
                res.send({ msg: "success", user: others })
            } else {
                res.send({ msg: "Invalid credentials" });
            }
        } else {
            res.send({ msg: "Invalid credentials" });
        }
    } catch (error) {
        res.send({ error: error.message });
    }

})


//  merchant
router.post("/merchant", async (req, res) => {
    try {
        const findEmail = await Merchant.findOne({ email: req.body.email });

        if (findEmail) {
            if (findEmail.password === req.body.password) {
                const { password, ...others } = findEmail._doc;
                res.send({ msg: "success", user: others })
            } else {
                res.send({ msg: "Invalid credentials" });
            }
        } else {
            res.send({ msg: "Invalid credentials" });
        }
    } catch (error) {
        res.send({ error: error.message });
    }

})


//  delivery partner
router.post("/deliverypartner", async (req, res) => {
    try {
        const findEmail = await DeliveryPartner.findOne({ email: req.body.email });

        if (findEmail) {
            if (findEmail.password === req.body.password) {
                const { password, ...others } = findEmail._doc;
                res.send({ msg: "success", user: others })
            } else {
                res.send({ msg: "Invalid credentials" });
            }
        } else {
            res.send({ msg: "Invalid credentials" });
        }
    } catch (error) {
        res.send({ error: error.message });
    }

})

export default router;
