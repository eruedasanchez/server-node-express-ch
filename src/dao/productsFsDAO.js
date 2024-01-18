import fs from 'fs';
import __dirname from '../utils.js';

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
let path = __dirname + '/data/products.json';

const invalidPidMid = id => {
    if(letters.includes(id)){
        throw new Error('El pid ingresado tiene un formato invalido');
    } 

    if(parseInt(id) < 1){
        throw new Error("Solo se admiten PID's mayores o iguales a 1");
    }
}

const filterProds = (arr, filters) => {
    let filterProps = Object.keys(filters);

    filterProps.forEach(prop => {
        arr = arr.filter(elem => elem[prop] == filters[prop]);
    })

    return arr;
}

const findProds = (arr, filters) => {
    let prodsFound = [];
    let filterEntries = Object.entries(filters);

    for(let i=0; i < filterEntries.length; i++){
        let currentProp = filterEntries[i][0];
        let currentValue = filterEntries[i][1];

        if(currentProp === "_id") currentValue = parseInt(currentValue);
        
        for(let j=0; j < arr.length; j++){
            if(currentValue === arr[j][currentProp]){
                prodsFound.push(arr[j]);
            }
        }
    }

    return prodsFound;
}

export class ProductsFsDAO{
    constructor(){}

    /**** Metodos ****/

    get(filter = {}){
        invalidPidMid(filter["_id"]);
        
        let products = [];
        
        if(fs.existsSync(path)){
            products = JSON.parse(fs.readFileSync(path, 'utf-8'));
        }

        let filteredProducts = filterProds(products, filter); 
        
        return filteredProducts;
    }

    add(newProd){
        let products = this.get();
        let _id = 1;

        if(products.length > 0) _id = products[products.length - 1]._id + 1;
        
        let newProduct = {_id, ...newProd};
        products.push(newProduct);

        fs.writeFileSync(path, JSON.stringify(products, null, '\t'));

        return newProduct;
    }

    update(id, fields){
        invalidPidMid(id);
        
        let products = this.get();
        let idxSelected = products.findIndex(prod => prod._id === parseInt(id));
        
        for(const entry of Object.entries(fields)){
            products[idxSelected][entry[0]] = entry[1];
        }

        fs.writeFileSync(path, JSON.stringify(products, null, '\t'));

        return products[idxSelected];
    }

    findBy(filter = {}){
        let products = this.get();

        let findProducts = findProds(products, filter);
        
        return findProducts.length > 0;
    }

    delete(id){
        if(isNaN(id)) throw new Error('El pid ingresado tiene un formato invalido');

        if(parseInt(id) < 1) throw new Error("Solo se admiten PID's mayores o iguales a 1");

        let products = this.get();
        
        const idxRemove = products.findIndex(prod => prod._id === parseInt(id));
        let removedProd = products.splice(idxRemove, 1); 
        
        fs.writeFileSync(path, JSON.stringify(products, null, '\t'));

        return removedProd;
    }
}