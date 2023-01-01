import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// importing routes
import userRouter from "./Routes/userRouter.js";
import orderRouter from "./Routes/orderRouter.js";
import productsRouter from "./Routes/productRouter.js";
import authRouter from "./Routes/authRouter.js";
import dashboardRouter from "./Routes/dashboardRouter.js";
import paymentRouter from "./Routes/paymentRouter.js";

dotenv.config(); // getting access to files in ".env" folder
const app = express();
const PORT = process.env.PORT || 8080;

// connecting to mongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongodb connected ✅"))
  .catch((error) => console.log("Error while connecting to DB..."));

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Smartbuy API");
});

// routes
app.use("/login", authRouter);
app.use("/user", userRouter);
app.use("/products", productsRouter);
app.use("/api/order", orderRouter);
app.use("/dashboard", dashboardRouter);
app.use("/payment", paymentRouter);

app.listen(PORT, () => console.log(`Server started at port ${PORT} 🚀`));
