import { productsDAO as DAO } from "../dao/factory.js";

class ProductsService {
    constructor(dao){
        this.dao = new dao(); 
    }
    
    async getProducts(){
        return await this.dao.get();
    }

    async getProductById(id){
        return await this.dao.get({_id:id});
    }

    async getProductsPaginate(lim, pag){
        return await this.dao.paginate(lim, pag);
    }

    async getLimitedProducts(lim){
        return await this.dao.limit(lim);
    }
    
    async addProduct(newProd){
        return await this.dao.add(newProd);
    }
    
    async updateProduct(id, fields){
        return await this.dao.update(id, fields);
    }

    async findByTitle(ttl){
        return await this.dao.findBy({title:ttl});
    }
    
    async findByDescription(des){
        return await this.dao.findBy({description:des});
    }
    
    async findByCode(cod){
        return await this.dao.findBy({code:cod});
    }
    
    async deleteProduct(id){
        return await this.dao.delete(id);
    }
}

export const productsService = new ProductsService(DAO);
