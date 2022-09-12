import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import Product from "./Models/Product.js";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Razorpay from "razorpay";
import Order from './Models/Order.js';
import { log } from 'console';

// getting access to files in ".env" folder
dotenv.config();

const app = express();
const PORT = process.env.PORT;


// connecting to mongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => console.log("mongodb connected ✅"));


// ₹ ₹ ₹ Razorpay Instance ₹ ₹ ₹
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;



// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// s3 bucket details
const s3Client = new S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    region: bucketRegion
})

app.get("/", (req, res) => {
    res.send("Smart ready to serve its customers 😊")
})

// routes
app.get('/products', async (req, res) => {
    try {
        let products = await Product.find();

        for (let product of products) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: product.image
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3Client, command);
            product.url = url;
        }

        res.send(products);
    } catch (error) {
        res.send({ error: error.message })
    }

})

// get single product data
app.get('/products/:id', async (req, res) => {
    try {
        let single_product = await Product.findOne({ _id: req.params.id });

        const getObjectParams = {
            Bucket: bucketName,
            Key: single_product.image
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3Client, command);
        single_product.url = url;

        res.send(single_product);
    } catch (error) {
        res.send({ error: error.message })
    }

})


// add new product
app.post("/products", upload.single('image'), async (req, res) => {
    try {
        const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
        const uniqueFileName = generateFileName();

        const params = {
            Bucket: bucketName,
            Key: uniqueFileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }

        const command = new PutObjectCommand(params);
        await s3Client.send(command)

        const newProduct = await Product.create({
            image: uniqueFileName,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            unit: req.body.unit,
            category: req.body.category
        })

        res.send(newProduct);
    } catch (error) {
        res.send({ error: error.message });
    }

})

// delete product
app.delete("/products/:id", async (req, res) => {
    try {
        const findProduct = await Product.findById(req.params.id);
        const params = {
            Bucket: bucketName,
            Key: findProduct.image,
        }

        const command = new DeleteObjectCommand(params);
        await s3Client.send(command)

        const deleteProduct = await Product.deleteOne({ _id: req.params.id });

        res.send({ msg: "deleted" });
    } catch (error) {
        res.send({ error: error.message });
    }

})


// ₹₹₹₹₹₹₹₹₹ 
app.post("/api/checkout", async (req, res) => {
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

app.post("/api/paymentverification", async (req, res) => {
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

        res.redirect(
            `http://localhost:3000/paymentsuccess?orderdetail=${razorpay_order_id}&&paymentdetail=${razorpay_payment_id}`
        );
        // res.send({ razorpay_order_id, success: true, })
    } else {
        res.status(400).json({
            success: false,
        });
    }

})


app.get("/api/getkey", (req, res) =>
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID })
);

app.post("/api/order", async (req, res) => {
    try {
        const newOrder = await Order.create({
            productDetail: req.body.productDetail,
            deliveryAddress: req.body.deliveryAddress,
            user: req.body.user,
            orderTotal: req.body.orderTotal,
            contactNo: req.body.contactNo,
        })
        // res.redirect("http://localhost:3000/orders")
        res.send({ msg: "ok" })
    } catch (err) {
        res.send(err)
    }
})

app.get("/api/order", async (req, res) => {
    try {
        const userOrders = await Order.find({});
        console.log(userOrders);
        res.send(userOrders)
        // res.redirect("http://localhost:3000/orders")
    } catch (err) {
        res.send(err)
    }
})
app.listen(PORT, () => console.log(`Hacksprint Server started at port ${PORT} 🚀`));