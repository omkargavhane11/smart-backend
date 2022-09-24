import express from "express";
const router = express.Router();
import Product from "../Models/Product.js";
import multer from "multer";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// s3 bucket details
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// connecting to s3 bucket
const s3Client = new S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    region: bucketRegion
})


// get all products
router.get('/', async (req, res) => {
    try {
        let products = await Product.find();

        // for (let product of products) {
        //     const getObjectParams = {
        //         Bucket: bucketName,
        //         Key: product.image
        //     }
        //     const command = new GetObjectCommand(getObjectParams);
        //     const url = await getSignedUrl(s3Client, command);
        //     product.url = url;
        // }

        const colorFilter = await Product.aggregate([{ $group: { _id: "$color" } }]);
        const brandFilter = await Product.aggregate([{ $group: { _id: "$brand" } }]);


        res.send({ productList: products, colorFilter, brandFilter });
    } catch (error) {
        res.send({ error: error.message })
    }
})


// get subcategory products
router.get('/subcategory/:subcategory', async (req, res) => {
    try {
        let products = await Product.find({ subcategory: req.params.subcategory });

        const colorFilter = await Product.aggregate([{ $group: { _id: "$color" } }]);
        const brandFilter = await Product.aggregate([{ $group: { _id: "$brand" } }]);

        products.length ? res.send({ productList: products, colorFilter, brandFilter }) : res.send("no results");
        // console.log(products.length);
    } catch (error) {
        res.send({ error: error.message })
    }
})


// get single product data
router.get('/:id', async (req, res) => {
    try {
        let single_product = await Product.findOne({ _id: req.params.id });

        // const getObjectParams = {
        //     Bucket: bucketName,
        //     Key: single_product.image
        // }
        // const command = new GetObjectCommand(getObjectParams);
        // const url = await getSignedUrl(s3Client, command);
        // single_product.url = url;

        res.send(single_product);
    } catch (error) {
        res.send({ error: error.message })
    }

})


// add new product
router.post("/", upload.single('image'), async (req, res) => {
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
        await s3Client.send(command);

        const newProduct = await Product.create({
            image: `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}`,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            unit: req.body.unit,
            category: req.body.category,
            subcategory: req.body.subcategory,
            name: req.body.name,
            color: req.body.color,
            brand: req.body.brand,
        })

        res.send(newProduct);
    } catch (error) {
        res.send({ error: error.message });
    }

})


// edit product details
router.put("/:productId", upload.single('image'), async (req, res) => {
    try {
        const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
        const uniqueFileName = generateFileName();

        if (req.file) {
            const params = {
                Bucket: bucketName,
                Key: uniqueFileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            }

            const command = new PutObjectCommand(params);
            await s3Client.send(command);

            const newData = {
                image: `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}`,
                ...req.body
            }
            const update = await Product.updateOne({ _id: req.params.id }, {
                $set: newData
            })
            res.send({ update })
        } else {
            const newData = { ...req.body }
            const update = await Product.updateOne({ _id: req.params.id }, {
                $set: newData
            })
            res.send({ update })
        }



    } catch (error) {
        res.send({ error: error.message });
    }
})



// delete product
router.delete("/:id", async (req, res) => {
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




export default router;