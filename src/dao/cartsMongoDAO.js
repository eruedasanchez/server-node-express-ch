import mongoose from "mongoose";
import { cartsModel } from "./models/carts.model.js";
import { ops } from "../utils.js";
import { CustomError } from "../services/errors/customError.js";
import { errorTypes } from "../services/errors/enumsError.js";
import { invalidCidError, invalidPidError } from "../services/errors/infoProductsErrors.js";

export const invalidObjectIdMid = id => {
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new Error(`Id ${id} ingresado tiene un formato invalido`);
    }
}

export class CartsMongoDAO{
    constructor(){}
    
    /**** Metodos ****/

    async create(){
        let newCart = { products: [] };
        return await cartsModel.create(newCart); 
    }
    
    async get(filter = {}, ...operations) {
        invalidObjectIdMid(filter["_id"]);
        
        let query = cartsModel.find(filter);
        
        for (const operation of operations) {
            if (operation === ops.POPULATE){
                query = query.populate('products.productId');
            } else if (operation === ops.LEAN) query = query.lean();
        }
        
        return await query.exec();
    }
    
    async add(cid, pid){
        if(!mongoose.Types.ObjectId.isValid(cid)){
            throw CustomError.createError("Error de datos", "CID inválido", errorTypes.BAD_REQUEST, invalidCidError(cid));
        }

        if(!mongoose.Types.ObjectId.isValid(pid)){
            throw CustomError.createError("Error de datos", "PID inválido", errorTypes.BAD_REQUEST, invalidPidError(pid));
        }
        
        let cartSelected = await this.get({_id:cid});
        let productsSelected = cartSelected[0].products;
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
        
        await cartSelected[0].save();

        return cartSelected[0];
    }

    async update(cid, prods){
        invalidObjectIdMid(cid);
        
        let productos = prods.products;
        
        for(const prod of productos){
            if(!mongoose.Types.ObjectId.isValid(prod.productId)){
                throw new Error('Todos los productId ingresados deben ser de tipo ObjectId');
            } 
        }
        
        return await cartsModel.updateOne({_id: cid}, prods);
    }

    async updateCant(cid, pid, field){
        invalidObjectIdMid(cid);
        invalidObjectIdMid(pid);
        
        let cartSelected = await this.get({_id:cid});
        let productsSelected = cartSelected[0].products;
        let idxPid = productsSelected.findIndex(prod => prod.productId.equals(new mongoose.Types.ObjectId(pid)));

        if(idxPid === -1){
            throw new Error(`El producto con PID ${pid} no existe en el carrito con CID ${cid}.`);
        }
        
        let quantityProp = Object.keys(field)[0]; 
        let quantityValue = Object.values(field)[0];
        productsSelected[idxPid][quantityProp] = quantityValue;
        
        await cartSelected[0].save();
        return cartSelected[0];
    }
    
    async delete(cid, pid){
        invalidObjectIdMid(cid);
        invalidObjectIdMid(pid);
        
        let cartSelected = await this.get({_id:cid});
        let productsSelected = cartSelected[0].products;
        let idxPid = productsSelected.findIndex(prod => prod.productId.equals(new mongoose.Types.ObjectId(pid)));
        
        if(idxPid === -1){
            throw new Error(`El producto con PID ${pid} no existe en el carrito con CID ${cid}.`);
        }
        
        let updatedProducts = productsSelected.filter(prod => prod !== productsSelected[idxPid]);
        
        return cartsModel.updateOne({_id: cid}, {$set:{products:updatedProducts}});
    }
    
    async deleteAll(cid){
        invalidObjectIdMid(cid);
        return await cartsModel.updateOne({_id: cid}, {$set:{products:[]}});
    }
}

