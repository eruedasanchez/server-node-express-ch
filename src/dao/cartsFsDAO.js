import fs from 'fs';
import __dirname from '../utils.js';

const path = __dirname + '/data/carts.json';
const letters = [
    'a', 
    'b', 
    'c', 
    'd', 
    'e', 
    'f', 
    'g', 
    'h', 
    'i', 
    'j', 
    'k', 
    'l', 
    'm', 
    'n', 
    'ñ', 
    'o', 
    'p', 
    'q', 
    'r', 
    's', 
    't', 
    'u', 
    'v', 
    'w', 
    'x', 
    'y', 
    'z', 
    'A', 
    'B', 
    'C', 
    'D', 
    'E', 
    'F', 
    'G', 
    'H', 
    'I', 
    'J', 
    'K', 
    'L', 
    'M', 
    'N', 
    'Ñ', 
    'O', 
    'P', 
    'Q', 
    'R', 
    'S', 
    'T', 
    'U', 
    'V', 
    'W', 
    'X', 
    'Y', 
    'Z'
];

const invalidIdMid = id => {
    if(letters.includes(id)){
        throw new Error(`El ${id} ingresado tiene un formato invalido`);
    } 

    if(parseInt(id) < 1){
        throw new Error(`Solo se admiten ${id}'s mayores o iguales a 1`);
    }
}

const filterCarts = (arr, filters) => {
    let filterProps = Object.keys(filters);

    filterProps.forEach(prop => {
        arr = arr.filter(elem => elem[prop] == filters[prop]);
    })

    return arr;
}

export class CartsFsDAO{
    constructor(){}

    /**** Metodos ****/

    get(filter = {}, ...operations){
        invalidIdMid(filter["_id"]);
        
        let carts = [];

        if(fs.existsSync(path)) carts = JSON.parse(fs.readFileSync(path, 'utf-8'));
        
        return filterCarts(carts, filter);
    }

    create(){
        let carts = this.get();

        let _id = 1;
        if(carts.length > 0) _id = carts[carts.length-1]._id + 1;

        let newCart = {
			_id, 
			products: []
        }

        carts.push(newCart);
        fs.writeFileSync(path, JSON.stringify(carts, null, '\t'));
        
        return newCart;
    }

    add(cid, pid){
        invalidIdMid(pid);

		let carts = this.get();
        
        let idxCart = carts.findIndex(cart => cart._id === parseInt(cid));
		let productsSelected = carts[idxCart].products;
        
		let idxPid = productsSelected.findIndex(prod => prod.productId === parseInt(pid));
        if(idxPid === -1){
			let productAdded = {
				productId: parseInt(pid),
				quantity: 1 
			}

			productsSelected.push(productAdded);
			carts[idxCart].products = productsSelected; 
		} else {
			productsSelected[idxPid].quantity += 1;
		}

        fs.writeFileSync(path, JSON.stringify(carts, null, '\t'));

		return carts[idxCart];
	}
    
    update(cid, prods){
        invalidIdMid(cid);
        
        let productos = prods.products;
        
        for(const prod of productos){
            invalidIdMid(prod.productId);
        }
        
        let carts = this.get();
        
        let idxCart = carts.findIndex(cart => cart._id === parseInt(cid));
        (carts[idxCart]).products = productos;
        
        fs.writeFileSync(path, JSON.stringify(carts, null, '\t'));

        return carts[idxCart];
	}

    updateCant(cid, pid, field){
        invalidIdMid(cid);
        invalidIdMid(pid);
        
        let carts = this.get();
        
        let idxCart = carts.findIndex(cart => cart._id === parseInt(cid));
		let productsSelected = carts[idxCart].products;
        let idxPid = productsSelected.findIndex(prod => prod.productId === parseInt(pid));

        if(idxPid === -1){
            throw new Error(`El producto con PID ${pid} no existe en el carrito con CID ${cid}.`);
        }

        let quantityProp = Object.keys(field)[0]; 
        let quantityValue = Object.values(field)[0];
        productsSelected[idxPid][quantityProp] = quantityValue;

        fs.writeFileSync(path, JSON.stringify(carts, null, '\t'));

        return carts[idxCart];
    }
    
    delete(cid, pid){
        invalidIdMid(cid);
        invalidIdMid(pid);
        
        let carts = this.get();
        
        let idxCart = carts.findIndex(cart => cart._id === parseInt(cid));
		let productsSelected = carts[idxCart].products;
        let idxPid = productsSelected.findIndex(prod => prod.productId === parseInt(pid));

        if(idxPid === -1){
            throw new Error(`El producto con PID ${pid} no existe en el carrito con CID ${cid}.`);
        }
        
        let updatedProducts = productsSelected.filter(prod => prod !== productsSelected[idxPid]);
        carts[idxCart].products = updatedProducts;

        fs.writeFileSync(path, JSON.stringify(carts, null, '\t'));

        return updatedProducts;
    }

    deleteAll(cid){
        invalidIdMid(cid);
        
        let carts = this.get();
        
        let idxCart = carts.findIndex(cart => cart._id === parseInt(cid));
		carts[idxCart].products = [];
        
        fs.writeFileSync(path, JSON.stringify(carts, null, '\t'));
        
        return carts[idxCart].products;
    }
}
