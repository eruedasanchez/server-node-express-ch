import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { cartsService } from "../services/carts.service.js";
import { productsService } from "../services/products.service.js";
import { ticketsService } from "../services/tickets.service.js";
import { userRole } from '../utils.js';
import { CustomError } from '../services/errors/customError.js';
import { errorTypes } from '../services/errors/enumsError.js';
import { unauthorizedErrorInfo } from "../services/errors/infoProductsErrors.js";

/*---------------------*\
    #CARTS CONTROLLER
\*---------------------*/

async function postCart(req, res) {
    try {
        let cartAdded = await cartsService.createCart();
        return res.status(201).json({status: 'ok', newCart:cartAdded})
    } catch (error) {
        req.logger.fatal(`Error al crear un carrito. Detalle: ${error.message}`);
        return res.status(400).json({error:'Error al crear un carrito', detail:error.message})
    }
}

async function getCartById(req, res) {
    try {
        let cid = req.params.cid;
        let cartSelected = await cartsService.getCartById(cid); 
        
        return res.status(200).json({status:'ok', MongoDBCart:cartSelected});                           
    } catch (error) {
        req.logger.fatal(`Error al obtener un carrito determinado. Detalle: ${error.message}`);
        return res.status(404).json({error:'Not found', detail:error.message});
    }
}

async function confirmPurchase(req, res) {
    try {
        let { cid } = req.params, { userEmail } = req.query;
        let cartUpdt, updateProd, updatedStock, productsWithoutStock = [], cartAmount = 0;

        let cartSelected = await cartsService.getCartById(cid);
        let productsSelected = cartSelected[0].products;

        for(const product of productsSelected){
            if(product.productId.stock >= product.quantity){
                cartUpdt = await cartsService.deleteProduct(cid, product.productId._id); 
                
                updatedStock = { stock: product.productId.stock - product.quantity };
                updateProd = await productsService.updateProduct(product.productId._id, updatedStock); 
                
                cartAmount += product.productId.price * product.quantity;  
            } else {
                productsWithoutStock.push(product.productId._id); 
            }
        }
        
        let ticket = {
            code: uuidv4().toString().split('-').join(''),
            purchase_datetime: moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYYTHH:mm:ss.SSS[Z]'),
            amount: cartAmount,
            purchaser: userEmail
        }

        let purchaseTicket = await ticketsService.generateTicket(ticket);
        
        return res.status(201).json({
            status: productsWithoutStock.length > 0 ? 'incomplete' : 'success',
            purchaseTicket: purchaseTicket,
            idsProductsWithoutStock: productsWithoutStock
        });       
    } catch (error) {
        req.logger.fatal(`Error al confirmar la compra. Detalle: ${error.message}`);
        return res.status(500).json({error:'Unexpected error', detail:error.message});
    }
}

async function postProductInCart(req,res) {
    try {
        let {cid, pid} = req.params, infoUserLoggedIn = req.user;
        let productSelected = await productsService.getProductById(pid);
        
        if(infoUserLoggedIn.role === userRole.PREMIUM && infoUserLoggedIn.email === productSelected[0].owner){
            throw CustomError.createError("Error de autorización", "Permisos inválidos", errorTypes.UNAUTHORIZED, unauthorizedErrorInfo('carrito'));
        }
        
        await cartsService.addProduct(cid, pid);
        
        return res.redirect(`/cartDetail?userFirstName=${infoUserLoggedIn.first_name}&userLastName=${infoUserLoggedIn.last_name}&userEmail=${infoUserLoggedIn.email}&userRole=${infoUserLoggedIn.role}&cartId=${cid}`);
    } catch (error) {
        req.logger.fatal(`Error al agregar un producto al carrito. Detalle: ${error.message}`);
        return res.status(error.code).json({error:error.name, detail:error.message});
    }
}

async function putCart(req,res) {
    try {
        let cid = req.params.cid, inputProducts = req.body;
        
        let newProducts = inputProducts.products;
        for(const prod of newProducts){
            if(!prod.productId || !prod.quantity){
                return res.status(404).json({error:'Not found', detail:`Cada producto del arreglo products ingresado por el body debe tener obligatoriamente los campos productId y quantity completos.`});
            }
            
            if(prod.quantity < 1){
                return res.status(400).json({error:'Bad Request', detail:`Solo se admiten cantidades positivas en cada uno de los productos ingresados.`});
            }
        }
        
        let updatedProds = await cartsService.updateProducts(cid, inputProducts);
        return res.status(201).json({status: 'ok', updatedProducts: updatedProds}); 
    } catch (error) {
        req.logger.fatal(`Error al modificar un carrito determinado. Detalle: ${error.message}`);
        return res.status(500).json({error:'Unexpected error', detail:error.message});
    }
}

async function putProdQuantityInCart(req,res) {
    try {
        let {cid, pid} = req.params, field = req.body;

        if(field.quantity < 1){
            return res.status(400).json({error:'Bad Request', detail:`El campo quantity solo admite cantidades positivas.`});
        }
        
        let cartUpdt = await cartsService.updateQuantity(cid, pid, field);
        return res.status(201).json({status: 'ok', quantityUpdated:cartUpdt});    
    } catch (error) {
        req.logger.fatal(`Error al modificar un producto en un carrito determinado. Detalle: ${error.message}`);
        return res.status(500).json({error:'Unexpected error', detail:error.message});
    }
}

async function deleteProductInCart(req,res) {
    try {
        let {cid, pid}  = req.params;
        
        let cartUpdt = await cartsService.deleteProduct(cid, pid);
        return res.status(200).json({status: 'ok', cartUpdated:cartUpdt});     
    } catch (error) {
        req.logger.fatal(`Error al eliminar un producto en un carrito determinado. Detalle: ${error.message}`);
        return res.status(404).json({error:'Unexpected error', detail:error.message});
    }
}

async function cleanCart(req, res) {
    try {
        let cid = req.params.cid;
    
        let productsDel = await cartsService.deleteAllProducts(cid);
        return res.status(200).json({status:'ok', cleanCart:productsDel});  
    } catch (error) {
        req.logger.fatal(`Error al eliminar todos los productos en un carrito determinado. Detalle: ${error.message}`);
        return res.status(404).json({error:'Unexpected error', detail:error.message});
    }
}

export default {
    postCart, 
    getCartById,
    confirmPurchase, 
    postProductInCart, 
    putCart, 
    putProdQuantityInCart, 
    deleteProductInCart,
    cleanCart
};