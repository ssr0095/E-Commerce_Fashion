import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  editProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import { authAdmin } from "../middleware/auth.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  authAdmin,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);
productRouter.delete("/remove", authAdmin, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.post("/edit", authAdmin, editProduct);
productRouter.get("/list", listProducts);

export default productRouter;
