import mongoose  from 'mongoose';
import nodemailer from 'nodemailer';
import { productsService } from '../services/products.service.js';
import { sorting, userRole } from '../utils.js';
import { config } from '../config/config.js';
import { CustomError } from '../services/errors/customError.js';
import { errorTypes } from '../services/errors/enumsError.js';
import { 
    generateProductErrorInfo, 
    invalidPidError, 
    invalidSortError, 
    negativeQueryError, 
    overflowError, 
    unauthorizedErrorInfo
} from '../services/errors/infoProductsErrors.js';

const ASC = sorting.ASC, DESC = sorting.DESC;

/*-----------------------------*\
    #FUNCTIONS RESET PASSWORD
\*-----------------------------*/

const transporter = nodemailer.createTransport({
    service: config.NODEMAILER_SERVICE,
    port: config.NODEMAILER_PORT,
    auth: {
        user: config.TRANSPORT_USER,
        pass: config.TRANSPORT_PASS
    }
})

const sendEmailDeletedProduct = async (to, name) => {
    return transporter.sendMail({
        from: 'Ezequiel <ezequiel.ruedasanchez@gmail.com>',
        to: to,
        subject: 'Producto eliminado del sistema',
        html: `
        <h2>Su producto "${name}" ha sido eliminado de la Base de Datos</h2>
        <p>Recuerde que para cargar cualquier tipo de producto en el sistema debe ser un usuario premium.</p>
        <br>
        <br>
        <p>En caso de no haber realizado la eliminación del producto, desestime este mensaje</p>
        `,
    });
}

/*-------------------------*\
    #FUNCTIONS ENDPOINTS
\*-------------------------*/

export const filterByCategory = (products, query) => {
    let filteredProducts;
    
    if(isNaN(query)){
        filteredProducts = products.filter(prod => prod.category === query);
    } else {
        filteredProducts = products.filter(prod => prod.stock >= query); 
    }

    return filteredProducts;
}

export const sortProducts = (products, order) => {
    let productsSorted = products.sort((prod1, prod2) => prod1.price - prod2.price);                 
    
    if(order === DESC) productsSorted = products.sort((prod1, prod2) => prod2.price - prod1.price);

    return productsSorted;
}

export const formatResults = (productsData, prodsRes)  => {
    return {
        status: 'success',
        payload: prodsRes,
        totalPages: productsData.totalPages, 
        prevPage: productsData.prevPage, 
        nextPage: productsData.nextPage,
        page: productsData.page,
        hasPrevPage: productsData.hasPrevPage, 
        hasNextPage: productsData.hasNextPage,
        prevLink: productsData.hasPrevPage ? `http://localhost:8080/products?page=${productsData.prevPage}` : null,
        nextLink: productsData.hasNextPage ? `http://localhost:8080/products?page=${productsData.nextPage}` : null   
    }
}

/*-----------------------*\
    #PRODUCTS CONTROLLER
\*-----------------------*/

async function getProducts(req, res) {
    try {
        let {limit, page, query, sort}  = req.query;
            
        if(!isNaN(query) && query < 0) throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());

        if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
            throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
        }
        
        let productsData = await productsService.getProductsPaginate(limit, page);
            
        if(limit < 1 || limit > productsData.totalDocs){
            throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
        }
            
        if(page < 1 || page > productsData.totalPages){
            throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
        }
            
        let filteredProducts = filterByCategory(productsData.docs, query);
        let productsSorted = sortProducts(filteredProducts, sort);
        let products = formatResults(productsData, productsSorted);
            
        return res.status(200).json({MongoDBProdsSortedAscPrice:products});
    } catch (error) {
        req.logger.fatal(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detalle:error.message});
    }
}

async function getProductById(req, res) {
    try {
        let pid = req.params.pid;

        if(!mongoose.Types.ObjectId.isValid(pid)){
            throw CustomError.createError("Error de datos", "PID inválido", errorTypes.NOT_FOUND, invalidPidError(pid));
        }
        
        let productSelected = await productsService.getProductById(pid);
        
        return res.status(200).json({status:'ok', MongoDBProduct:productSelected});                          
    } catch (error) {
        req.logger.fatal(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detalle:error.message});
    }
}

async function postProduct(req, res){
    try {
        let owner; 
        let newProd = req.body;
        
        for(const value of Object.values(newProd)){
            if(!value){
                throw CustomError.createError("Faltan datos", "Complete todos los campos", errorTypes.NOT_FOUND, generateProductErrorInfo(newProd));
            }
        }
        
        req.user.role === userRole.PREMIUM ? owner = req.user.email : owner = userRole.ADMIN;
        
        let newProdFinal = {...newProd, owner:owner};
        
        let productAdded = await productsService.addProduct(newProdFinal); 
        
        return res.status(201).json({status: 'ok', newProduct:productAdded});
    } catch (error) {
        req.logger.fatal(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detalle:error.message});
    }
}

async function putProduct(req, res){
    try {
        let pid = req.params.pid, infoUserLoggedIn = req.user, fields = req.body;
        
        for(const value of Object.values(fields)){
            if(!value) throw CustomError.createError("Faltan datos", "Complete todos los campos", errorTypes.BAD_REQUEST, generateProductErrorInfo(fields));
        }
        
        let productSelected = await productsService.getProductById(pid);
        
        if(infoUserLoggedIn.role === userRole.PREMIUM && infoUserLoggedIn.email !== productSelected[0].owner){
            throw CustomError.createError("Error al modificar un producto", "Unauthorized", errorTypes.UNAUTHORIZED, unauthorizedErrorInfo());
        }
        
        let updatedProds = await productsService.updateProduct(pid, fields);
        
        return res.status(200).json({status: 'ok', updatedProducts: updatedProds});
    } catch (error) {
        req.logger.fatal(`Error al modificar un producto. Detalle: ${error.message}`);
        return res.status(error.code).json({error:error.description, detalle:error.message});
    }
}

async function deleteProduct(req,res){
    try {
        let pid = req.params.pid, infoUserLoggedIn = req.user;
        
        let productSelected = await productsService.getProductById(pid);
        
        if(infoUserLoggedIn.role === userRole.PREMIUM){
            if(infoUserLoggedIn.email !== productSelected[0].owner){
                throw CustomError.createError("Error al eliminar un producto", "Unauthorized", errorTypes.UNAUTHORIZED, unauthorizedErrorInfo());
            } else {
                let productName = productSelected[0].title;
                await sendEmailDeletedProduct(infoUserLoggedIn.email, productName);
            }
        }
        
        let delProduct = await productsService.deleteProduct(pid);
        
        return res.status(200).json({status: 'ok', deletedProduct: delProduct});
    } catch (error) {
        req.logger.fatal(`Error al eliminar un producto. Detalle: ${error.message}`);
        return res.status(error.code).json({error:error.description, detalle:error.message});
    }
}

export default {
    getProducts, 
    getProductById, 
    postProduct, 
    putProduct, 
    deleteProduct
};
