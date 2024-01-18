import mongoose from "mongoose";
import { cartsModel } from "../models/carts.model.js"; 

class MongoCartManager{
    
    /**** Metodos ****/

    createCart(){
        let newCart = { products: [] };
        return cartsModel.create(newCart); 
    }

    getCarts(){
        return cartsModel.find().populate('products.productId');
    }

    async getCartById(cid){
        return await cartsModel.findById(cid).populate('products.productId');
    }

    async getCartByIdLean(cid){
        return await cartsModel.findById(cid).populate('products.productId').lean();
    }

    async getCartByIdWithoutPopulate(cid){
        return await cartsModel.findById(cid);
    }
    
    async addProduct(cid, pid){
        let cartSelected = await this.getCartByIdWithoutPopulate(cid);
        let productsSelected = cartSelected.products;
        let idxPid = productsSelected.findIndex(prod => prod.productId.equals(new mongoose.Types.ObjectId(pid)));
        
        if(idxPid === -1){
            let newProductAdded = {
				productId: pid,
				quantity: 1 
			}
			productsSelected.push(newProductAdded);
		} else {
            productsSelected[idxPid].quantity += 1;
		}
        
        await cartSelected.save();
        return cartSelected;
    }

    updateProducts(cid, prods){
        return cartsModel.updateOne({_id: cid}, prods);
    }

    async updateQuantity(cid, pid, field){
        let cartSelected = await this.getCartByIdWithoutPopulate(cid);
        let productsSelected = cartSelected.products;
        let idxPid = productsSelected.findIndex(prod => prod.productId.equals(new mongoose.Types.ObjectId(pid)));
        
        let quantityProp = Object.keys(field)[0]; 
        let quantityValue = Object.values(field)[0];
        productsSelected[idxPid][quantityProp] = quantityValue;
        
        await cartSelected.save();
        return cartSelected;
    }
    
    async deleteProduct(cid, pid){
        let cartSelected = await this.getCartByIdWithoutPopulate(cid);
        let productsSelected = cartSelected.products;
        let idxPid = productsSelected.findIndex(prod => prod.productId.equals(new mongoose.Types.ObjectId(pid)));
        
        let updatedProducts = productsSelected.filter(prod => prod !== productsSelected[idxPid]);
        
        return cartsModel.updateOne({_id: cid}, {$set:{products:updatedProducts}});
    }

    deleteAllProducts(cid){
        return cartsModel.updateOne({_id: cid}, {$set:{products:[]}});
    }
}

export default MongoCartManager;
