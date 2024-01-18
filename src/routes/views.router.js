import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import __dirname, { userRole} from '../utils.js';
import { config } from '../config/config.js';
import { cartsService } from '../services/carts.service.js';
import { productsService } from '../services/products.service.js';
import { ticketsService } from '../services/tickets.service.js';
import { invalidObjectIdMid } from '../dao/cartsMongoDAO.js'; 
import { fakerES_MX as faker } from '@faker-js/faker';
import { usersModel } from '../dao/models/users.model.js';
import { authorization } from './sessions.router.js';
import { activeSessionMid, auth } from '../middlewares/viewsRouterMiddlewares.js';

export const router = express.Router();

/*----------------------*\
    #MOCKING FUNCTIONS
\*----------------------*/

const generateThumbnailsArr = idx => {
    let thumbnail, thumbnails = [];

    for(let i=0; i < 3; i++){
        thumbnail = `thumbnail-p${idx+1}-${i+1}`;
        thumbnails.push(thumbnail);
    }
    
    return thumbnails;
}

const generateMockProduct = idx => {
    let _id = faker.string.alphanumeric({length: 24});
    let title = faker.commerce.productName();
    let description = faker.commerce.productDescription();
    let code = faker.string.alphanumeric({length: 8});
    let price = faker.commerce.price({min: 100, max: 10000, dec: 0, symbol: '$' });
    let stock = faker.number.int({ min: 0, max: 100});
    let status = stock > 0 ? true : false;
    let category = faker.commerce.product();
    let thumbnails = generateThumbnailsArr(idx);

    let mockProduct = {
        _id,
        title,
        description,
        code,
        price,
        status,
        stock, 
        category,
        thumbnails
    };

    return mockProduct;
}

/*-------------------------------*\
    #PURCHASE CONFIRMATION EMAIL
\*-------------------------------*/

const transporter = nodemailer.createTransport({
    // service: config.NODEMAILER_SERVICE,
    // port: config.NODEMAILER_PORT,
    // auth: {
    //     user: config.TRANSPORT_USER,
    //     pass: config.TRANSPORT_PASS
    // }
    service: 'gmail',
    port: 587,
    auth: {
        user: 'ezequiel.ruedasanchez@gmail.com',
        pass: 'szmiutoluzhlmeps'
    }
})

const purchaseConfirmationEmail = async ticket => {
    const productDetails = ticket.productsWithStock.map(product => `
        <p>Nombre del producto: ${product.productId.title}</p>
        <p>Precio del producto: $${product.productId.price}</p>
        <p>Cantidad: ${product.quantity}</p>
        <p>Subtotal: $${product.productId.price * product.quantity}</p>
        <br>
    `).join('');
    
    return transporter.sendMail({
        from: 'Ezequiel <ezequiel.ruedasanchez@gmail.com>',
        to: ticket.purchaser,
        subject: 'Su compra ha sido procesada con exito',
        html: `
        <h2>Felicitaciones, su compra ha sido exitosa!</h2>
        <p>A continuación le dejamos el detalle de su compra:</p>
        <br>
        ${productDetails}
        <br>
        <h2>Total: $${ticket.amount}</h2>
        <br>                                                                         
        <p>Por cualquier consulta relacionada a su pedido, nos puede contactar al 11 23456789 teniendo consigo el código de su pedido: ${ticket.code}</p>
        <br>
        <p>Nos encontramos en Avenida Rivadavia 5473 de lunes a viernes de 9 a 18hs. Sabados de 9hs a 14hs.</p>
        <p>Recuerde no responder este mensaje</p>
        `,
    });
}

/*-----------------*\
    #VIEWS ROUTES
\*-----------------*/

router.get('/', activeSessionMid, (req,res) => {
    res.status(200).render('login');
})

router.get('/signup', activeSessionMid, (req,res) => {
    let errorDetail = false;
    
    if(req.query.error) errorDetail = req.query.error;
    
    res.status(200).render('signUp', {errorDetail});
})

router.get('/resetPassword', (req,res) => {
    let emptyFieldEmail = false, unregisteredClient = false, successResetPassRequest = false, tokenExpired = false, equalPassword = false ;
    
    let {error, unregisteredEmail, successResetRequest, expiredToken, samePassword} = req.query;
    
    if(error) emptyFieldEmail = error;

    if(unregisteredEmail) unregisteredClient = unregisteredEmail;

    if(successResetRequest) successResetPassRequest = successResetRequest;

    if(expiredToken) tokenExpired = expiredToken;

    if(samePassword) equalPassword = samePassword;
    
    res.status(200).render('resetPassword', {
        emptyFieldEmail,
        unregisteredClient,
        successResetPassRequest,
        tokenExpired,
        equalPassword
    });
})

router.get('/confirmNewPassword', auth, (req,res) => {
    let userEmail = req.user.email;
    
    res.status(200).render('confirmNewPassword', { userEmail });
})

router.get('/login', activeSessionMid, (req,res) => {
    let errorDetail = false, userEmail = false, logoutSuccess = false, newPasswordSuccess = false;

    let {error, createdUser, message, successNewPassword} = req.query;
    
    if(error) errorDetail = error;
    
    if(createdUser) userEmail = createdUser;

    if(message) logoutSuccess = message;

    if(successNewPassword) newPasswordSuccess = successNewPassword;
    
    res.status(200).render('login', {
        errorDetail,
        userEmail, 
        logoutSuccess,
        newPasswordSuccess
    });
})

router.get('/products', passport.authenticate('current', {session:false}), async (req,res) => {
    let profileSuccessfullyLoad = false, productsSuccessfullyLoad = false, documentsSuccessfullyLoad = false, mandatoryDocumentEmpty = false, cartEmpty = false;
    let {limit, page, userId, userFirstName, userLastName, userEmail, userRole, cartId, successProfile, successProducts, successDocuments, unsuccessChangeRole, emptyCart} = req.query;
    
    if(!limit) limit = 10;
    if(!page) page = 1;

    if(successProfile) profileSuccessfullyLoad = successProfile;

    if(successProducts) productsSuccessfullyLoad = successProducts;

    if(successDocuments) documentsSuccessfullyLoad = successDocuments;

    if(unsuccessChangeRole) mandatoryDocumentEmpty = unsuccessChangeRole;

    if(emptyCart) cartEmpty = emptyCart;
    
    const products = await productsService.getProductsPaginate(limit, page);

    let {totalPages, hasPrevPage, hasNextPage, prevPage, nextPage} = products;
    
    res.setHeader('Content-Type','text/html');
    res.status(200).render('products', {
        header: 'MongoDB Products',
        products: products.docs,
        totalPages: totalPages, 
        hasPrevPage: hasPrevPage, 
        hasNextPage: hasNextPage , 
        prevPage: prevPage, 
        nextPage: nextPage,
        userId: userId,
        userFirstName: userFirstName, 
        userLastName: userLastName, 
        userEmail: userEmail, 
        userRole: userRole,
        cartId: cartId,
        profileSuccessfullyLoad: profileSuccessfullyLoad,
        productsSuccessfullyLoad: productsSuccessfullyLoad, 
        documentsSuccessfullyLoad: documentsSuccessfullyLoad,
        mandatoryDocumentEmpty: mandatoryDocumentEmpty,
        cartEmpty: cartEmpty
    });
});

router.get('/carts/:cid', async (req, res) => {
    try {
        let cid = req.params.cid;
        invalidObjectIdMid(cid);
        
        let cartSelected = await cartsService.getCartByIdLean(cid); 
        
        res.setHeader('Content-Type','text/html');
        res.status(200).render('cartid', {
            header: 'MongoDB CartId',
            cartId: cartSelected._id,
            cartIdProducts: cartSelected.products,
        });
    } catch (error) {
        req.logger.fatal(`Error al obtener un carrito determinado. Detalle: ${error.message}`);
        res.status(500).json({error:'Unexpected error', detail:error.message});
    }
})

router.get('/realtimeproducts', (req, res) => {
    res.setHeader('Content-Type','text/html');
    res.status(200).render('realTimeProducts');
});

router.get('/mockingproducts', async (req,res) => {
    let product, mockingProducts = [];

    for(let mp = 0; mp < 100; mp++){
        product = generateMockProduct(mp);
        mockingProducts.push(product); 
    }
    
    res.setHeader('Content-Type','text/html');
    res.status(200).render('mockingProducts', {
        header: 'Mocking Products',
        mockingProducts: mockingProducts,
    });
});

router.get('/loggerTest', (req, res) => {
    req.logger.log("fatal", "Prueba log - nivel fatal");
    req.logger.log("error", "Prueba log - nivel error");
    req.logger.log("warning", "Prueba log - nivel warning");
    req.logger.log("info", "Prueba log - nivel info");
    req.logger.log("http", "Prueba log - nivel http");
    req.logger.log("debug", "Prueba log - nivel debug");

    res.setHeader('Content-Type','text/html');
    res.status(200).render('loggerTest');
});

router.get('/adminPanel', passport.authenticate('current', {session:false}), authorization([userRole.ADMIN]), async (req, res) => {
    let changeRoleSuccessfully = false;
    let {successChangeRole} = req.query;
    
    let usersDB = await usersModel.find().lean();

    if(successChangeRole) changeRoleSuccessfully = successChangeRole;
    
    res.setHeader('Content-Type','text/html');
    res.status(200).render('adminPanel', {
        header: 'Panel de administración',
        users: usersDB,
        changeRoleSuccessfully: changeRoleSuccessfully,
    });
});

router.get('/orderDetail/:cid/purchase', passport.authenticate('current', {session:false}), authorization([userRole.PREMIUM, userRole.USER]), async (req,res) => {
    let { cid } = req.params;
    let {userFirstName, userLastName, userEmail, userRole, cartId } = req.query;
    let cartAmount = 0, orderSuccessfully = false;
    let productsWithoutStock = [], productsWithStock = [];

    let cartSelected = await cartsService.getCartByIdLean(cid);
    let productsSelected = cartSelected[0].products;
    
    for(const product of productsSelected){
        if(product.productId.stock >= product.quantity){
            product.subtotal = product.productId.price * product.quantity;
            cartAmount += product.subtotal;  

            productsWithStock.push(product);
        } else {
            productsWithoutStock.push(product); 
        }
    }
    
    if(productsWithoutStock.length === 0) orderSuccessfully = true;
    
    res.setHeader('Content-Type','text/html');
    res.status(200).render('orderDetail', {
        header: 'Checkout',
        cartAmount: cartAmount,
        userFirstName: userFirstName, 
        userLastName: userLastName, 
        userEmail: userEmail, 
        userRole: userRole, 
        cartId: cartId,
        orderSuccessfully: orderSuccessfully,
        productsWithStock: productsWithStock,
        productsWithoutStock: productsWithoutStock
    });
});

router.get('/successPurchase', async (req,res) => {
    let { cartId, userEmail } = req.query;
    let cid = new mongoose.Types.ObjectId(cartId);
    
    let cartUpdt, updateProd, updatedStock;
    let productsWithStock = [], cartAmount = 0;

    let cartSelected = await cartsService.getCartByIdLean(cid);
    let productsSelected = cartSelected[0].products;

    for(const product of productsSelected){
        if(product.productId.stock >= product.quantity){
            productsWithStock.push(product);
            cartAmount += product.quantity * product.productId.price;  
            
            cartUpdt = await cartsService.deleteProduct(cid, product.productId._id); 
            updatedStock = { stock: product.productId.stock - product.quantity };
            updateProd = await productsService.updateProduct(product.productId._id, updatedStock); 
        } 
    }
    
    let ticket = {
        code: uuidv4().toString().split('-').join(''),
        purchase_datetime: moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYYTHH:mm:ss.SSS[Z]'),
        amount: cartAmount,
        purchaser: userEmail,
        productsWithStock: productsWithStock
    }
    
    await ticketsService.generateTicket(ticket);
    await purchaseConfirmationEmail(ticket);
    
    res.setHeader('Content-Type','text/html');
    res.status(200).render('successPurchase', {
        header: 'Compra exitosa',
        userEmail: userEmail, 
    });
});

router.get('/cartDetail', passport.authenticate('current', {session:false}), authorization([userRole.PREMIUM, userRole.USER]), async (req,res) => {
    let {userFirstName, userLastName, userEmail, userRole, cartId } = req.query;
    
    let cartSelected = await cartsService.getCartByIdLean(cartId);
    let productsSelected = cartSelected[0].products;
    
    res.setHeader('Content-Type','text/html');
    res.status(200).render('cartDetail', {
        header: 'Detalle del carrito',
        productsSelected: productsSelected,
        userFirstName: userFirstName, 
        userLastName: userLastName, 
        userEmail: userEmail, 
        userRole: userRole, 
        cartId: cartId,
        cartStatus: productsSelected.length === 0 ? 'empty' : 'loaded'
    });
});








