import fs from 'fs';

class ProductManager{
    
    constructor(path){
        this.path = path;
    } 
    
    /**** Metodos ****/

    addProduct(title, description, code, price, status, stock, category, thumbnails){
        let products = this.getProducts();

        let idProduct = 1;
        if(products.length > 0) idProduct = products[products.length-1].id + 1;

        let newProduct = {
            id: idProduct,
            title: title, 
            description: description, 
            code: code,
            price: price,
            status: status,
            stock: stock,
            category: category, 
            thumbnails: thumbnails
        }
        
        products.push(newProduct);
        
        return fs.writeFileSync(this.path, JSON.stringify(products, null, '\t'));
    }
    
    getProducts(){
        if(!fs.existsSync(this.path)){
            console.error(`El archivo ${this.path} no existe.`);
            return [];
        } 
        
        let viewProducts = JSON.parse(fs.readFileSync(this.path, 'utf-8')); 
        return viewProducts;
    }
    
    getProductById(id){
        let products = this.getProducts();
        
        let foundProduct = products.find((prod) => prod.id === id);
        return foundProduct;
    }

    updateProduct(id, fields){
        let products = this.getProducts();
        let idxSelectedProduct = products.findIndex(prod => prod.id === id);
        
        for(const entry of Object.entries(fields)){
            products[idxSelectedProduct][entry[0]] = entry[1];
        }

        return fs.writeFileSync(this.path, JSON.stringify(products, null, '\t'));
    }
    
    deleteProduct(id){
        let products = this.getProducts();
        
        const idxRemoveProduct = products.findIndex(prod => prod.id === id);
        products.splice(idxRemoveProduct,1);
        
        return fs.writeFileSync(this.path, JSON.stringify(products, null, '\t'));;
        
    }
}

export default ProductManager;
