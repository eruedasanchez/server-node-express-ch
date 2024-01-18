import mongoose from "mongoose";

const productIdQuantity = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products'}, 
    quantity: Number
}, {strict: true});

const cartsCollection = 'carts';                                            
const cartsSchema = new mongoose.Schema({
    products: {type: [productIdQuantity], require: true}
}, {strict: true})  

export const cartsModel = mongoose.model(cartsCollection, cartsSchema);






