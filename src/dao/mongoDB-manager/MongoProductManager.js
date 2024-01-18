import { productsModel } from "../models/products.model.js";

class MongoProductManager{
    
    /**** Metodos ****/

    addProduct(newProd){
        return productsModel.create(newProd);
    }

    getProductsPaginate(lim, pag){
        return productsModel.paginate({}, {limit:lim, lean:true, page:pag});
    }
    
    getProducts(){
        return productsModel.find();
    }

    getLimitedProducts(lim){
        return productsModel.find().limit(lim);
    }
    
    getProductById(id){
        return productsModel.findById(id);
    }

    updateProduct(id, fields){
        return productsModel.updateOne({_id:id}, fields);
    }
    
    findByTitle(ttl){
        return productsModel.findOne({title:{$eq:ttl}});
    }

    findByDescription(des){
        return productsModel.findOne({description:{$eq:des}});
    }

    findByCode(cod){
        return productsModel.findOne({code:{$eq:cod}});
    }
    
    deleteProduct(id){
        return productsModel.deleteOne({_id:id});
    }
}

export default MongoProductManager;



