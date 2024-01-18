import fs from 'fs';

class CartManager{
    
    constructor(path){
        this.path = path;
    } 
    
    /**** Metodos ****/

    createCart(){
        let carts = this.getCarts();

        let carritoId = 1;
        if(carts.length > 0) carritoId = carts[carts.length-1].cartId + 1;

        let newCart = {
			cartId: carritoId, 
			products: []
        }
        
        carts.push(newCart);
        
        return fs.writeFileSync(this.path, JSON.stringify(carts, null, '\t'));
    }
    
    getCarts(){
        if(!fs.existsSync(this.path)) return [];
        
		let viewCarts = JSON.parse(fs.readFileSync(this.path, 'utf-8')); 
        return viewCarts;
    }
    
    getCartById(cid){
        let carts = this.getCarts();
        
        let foundCart = carts.find((cart) => cart.cartId === cid);
        return foundCart;
    }

	addProduct(cid, pid){
		let carts = this.getCarts();
    
		let idxCart = carts.findIndex(cart => cart.cartId === cid);
		let productsSelected = carts[idxCart].products;
		
		let idxPid = productsSelected.findIndex(prod => prod.productId === pid);
		if(idxPid === -1){
			let newProductAdded = {
				productId: pid,
				quantity: 1 
			}
			productsSelected.push(newProductAdded);
			carts[idxCart].products = productsSelected; 
		} else {
			productsSelected[idxPid].quantity += 1;
		}

		return fs.writeFileSync(this.path, JSON.stringify(carts, null, '\t'));
	}
}

export default CartManager;
