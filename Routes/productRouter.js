import express from "express";
const router = express.Router();
import Product from "../Models/Product.js";
import multer from "multer";
import crypto from "crypto";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { appendFile } from "fs";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

dotenv.config();

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
        let products = req.query ? await Product.find({...req.query, quantity:{$gt:0}}) : await Product.find({quantity:{$gt:0}});

        // for (let product of products) {
        //     const getObjectParams = {
        //         Bucket: bucketName,
        //         Key: product.image
        //     }
        //     const command = new GetObjectCommand(getObjectParams);
        //     const url = await getSignedUrl(s3Client, command);
        //     product.url = url;
        // }

        const colorFilter = await Product.aggregate([{$match:{quantity:{$gt:0}}},{ $group: { _id: "$color" } }]);
        const brandFilter = await Product.aggregate([{$match:{quantity:{$gt:0}}},{ $group: { _id: "$brand" } }]);


        res.send({ productList: products, colorFilter, brandFilter });
    } catch (error) {
        res.send({ error: error.message })
    }
})

// get all products
router.get('/inventory/:merchantId', async (req, res) => {
    try {
        let products = await Product.find({merchantId:req.params.merchantId});

        const colorFilter = await Product.aggregate([{$match:{merchantId:req.params.merchantId}},{ $group: { _id: "$color" } }]);
        const brandFilter = await Product.aggregate([{$match:{merchantId:req.params.merchantId}},{ $group: { _id: "$brand" } }]);


        res.send({ productList: products, colorFilter, brandFilter });
    } catch (error) {
        res.send({ error: error.message })
    }
})


// get subcategory products
router.get('/subcategory/:subcategory', async (req, res) => {
    try {
        let products = await Product.find({ subcategory: req.params.subcategory, quantity:{$gt:0} });

        let colorFilter = [];
        let brandFilter = [];

         products?.forEach((product) => {
            if (!colorFilter.includes(product.color)) {
                colorFilter.push(product.color.toLowerCase());
            }

            if (!brandFilter.includes(product.brand)) {
                brandFilter.push(product.brand.toLowerCase());
            }
        });

        res.send({ productList: products, colorFilter, brandFilter });
        // console.log(products);
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
            merchantId:req.body.merchantId
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
            const update = await Product.updateOne({ _id: req.params.productId }, {
                $set: newData
            })
            res.send({ update })
        } else {
            const update = await Product.updateOne({ _id: req.params.productId }, {
                $set: req.body
            })
            res.send({ update })

            // res.send({custom:req.body, productID:req.params.productId})
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

// get products from user input keywords
router.get("/search/:search", async (req, res) => {
    const params = req.params.search;
    const input_keyword_array = params.split(" ");

    function format(str) {
        let one = str.split("");

        while (one.includes("-") || one.includes("'")) {

            if (one.includes("-")) {
                let index = one.indexOf("-");
                one.splice(index, 1);
            } else if (one.includes("'")) {
                let index = one.indexOf("'");
                one.splice(index, 1);
            }
            one = one;
        }
        one = one.join("").toLowerCase();

        // Keywords inside below array are tend to be added with "s" and "'" , that's why they are kept in the list. Removing those from both user input keyword and product deatils keyword while matching and comparing improves search result.
        let common_keywors = ["mens", "womens", "kids", "females", "males", "girls", "boys"]

        if (common_keywors.includes(one)) {
            one = one.split("");
            let index = Number(one.length) - 1;
            one.splice(index, 1);
            one = one.join("");
            return one;
        }

        return one;
    }

    try {
        const data = await Product.find();

        let search_result = [];

        data.forEach((item) => {
            let p_name = item.name.split(" ");
            let p_description = item.description.split(" ");
            let p_brand = item.brand.split(" ");
            let p_category = item.category.split(" ");
            let p_subcategory = item.subcategory.split(" ");
            let p_color = item.color.split(" ");

            let master = [...p_name, ...p_description, ...p_brand, ...p_category, ...p_subcategory, ...p_color];

            let matched = true;
            for (let i = 0; i < input_keyword_array.length; i++) {
                let inner_match = false;

                for (let j = 0; j < master.length; j++) {
                    let user_key = format(input_keyword_array[i]);
                    let product_key = format(master[j]);

                    if (product_key === user_key) {
                        inner_match = true;
                    }
                }
                if (inner_match !== true) {
                    matched = false;
                }
            }
            if (matched) search_result.push(item);
        })

        let colorFilter = [];
        let brandFilter = [];

        search_result.forEach((product) => {
            if (!colorFilter.includes(product.color)) {
                colorFilter.push(product.color.toLowerCase());
            }

            if (!brandFilter.includes(product.brand)) {
                brandFilter.push(product.brand.toLowerCase());
            }
        });

        search_result.length ? res.send({ productList: search_result, colorFilter, brandFilter }) : res.send("no results");

    } catch (error) {
        res.send({ error: error.message });
    }
})




export default router;