import supertest from "supertest";
import chai from 'chai';
import mongoose from "mongoose";
import { before, describe, it } from "mocha";
import { logger } from "../src/utilsWinston.js";
import { config } from "../src/config/config.js";
import { cartsModel } from "../src/dao/models/carts.model.js";
import { jwtoken, cartTestData, productTestData } from "./dataTest.js";

try {
    await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME});
    logger.info('MongoDB Atlas Conectada');
} catch (error) {
    logger.fatal(`Error al conectarse con MongoDB Atlas. Detalle: ${error.message}`);
}

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Tests del proyecto Ecommerce", function(){
    this.timeout(6000); 

    describe("Listado de tests del módulo Carts", function(){
        let cidTest, coderCookie;
        
        before(async function(){
            coderCookie = jwtoken;
        })
        
        afterEach(async function(){
            await cartsModel.deleteOne({_id:cidTest});
        })

        it("El endpoint /api/carts con método POST crea un carrito nuevo vacio en la DB", async function(){
            let {body, ok, statusCode, clientError, serverError, req} = await requester.post("/api/carts");

            cidTest = body.newCart._id;
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('newCart');
            expect(body.newCart).to.has.property('products');
            expect(Array.isArray(body.newCart.products)).to.be.true;
            expect(body.newCart.products.length).is.eq(0);
            expect(body.newCart).to.has.property('_id');
            expect(typeof body.newCart._id).is.eq('string');
            expect(body.newCart._id.length).to.equal(24);
            expect(ok).to.be.true;
            expect(statusCode).is.eq(201);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq('/api/carts');
            expect(req.method).is.eq('POST');
        })

        it("El endpoint /api/carts/:cid con método GET obtiene el carrito en la DB con el cid pasado por params", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const productProperties = productTestData.PRODUCT_PROPERTIES;
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.get(`/api/carts/${cid}`);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('MongoDBCart');
            expect(Array.isArray(body.MongoDBCart)).to.be.true;
            expect(statusCode).is.eq(200);
            expect(ok).to.be.true;
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}`);
            expect(req.method).is.eq('GET');
            
            const productsInCart = (body.MongoDBCart[0]).products;
            
            for(const product of productsInCart){
                expect(product).to.has.property('productId');
                expect(product).to.has.property('quantity');
                expect(product.quantity).to.be.gte(1);

                const productId = product.productId;
                for(const property of Object.keys(productId)){
                    expect(productProperties.includes(property)).to.be.equal(true);
                    
                    if(property === '_id') expect(productId._id.length).to.be.eq(24);
                    if(property === 'price') expect(productId.price).to.be.gte(1);
                    if(property === 'status') expect(typeof productId.status).to.be.eq('boolean');
                    if(property === 'stock') expect(productId.stock).to.be.gte(1); 
                    if(property === 'thumbnails') expect(Array.isArray(productId.thumbnails)).to.be.true;
                }
            }
        })

        it("El endpoint /api/carts/:cid con método GET arroja un error cuando se pasa un cid inválido por params", async function(){
            const cid = productTestData.INVALID_PID;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.get(`/api/carts/${cid}`);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Not found');
            expect(body).to.has.property('detail');
            expect(statusCode).is.eq(404);
            expect(ok).to.be.false;
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}`);
            expect(error.method).is.eq('GET');
        })

        it("El endpoint /api/carts/:pid con método PUT modifica un producto existente en la DB", async function(){
            const cid = cartTestData.CID_ERUEDA;
            const cartTest = {
                products: [
                    {
                        productId: "656e5a832943f50a737deae9",
                        quantity: 4
                    },
                    {
                        productId: "656e82d3aecef67c8207a314",
                        quantity: 3
                    },
                    {
                        productId: "656e82e7aecef67c8207a319",
                        quantity: 2
                    }
                ]
            };
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.put(`/api/carts/${cid}`).send(cartTest);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('updatedProducts');
            expect(ok).to.be.true;
            expect(statusCode).is.eq(201);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}`);
            expect(req.method).is.eq('PUT');
        })

        it("El endpoint /api/carts/:cid con método PUT arroja un error cuando se pasa un cid inválido por params", async function(){
            const cid = productTestData.INVALID_PID;
            const cartTest = {
                products: [
                    {
                        productId: "656e5a832943f50a737deae9",
                        quantity: 4
                    },
                    {
                        productId: "656e82d3aecef67c8207a314",
                        quantity: 3
                    },
                    {
                        productId: "656e82e7aecef67c8207a319",
                        quantity: 2
                    }
                ]
            };
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.put(`/api/carts/${cid}`).send(cartTest);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(statusCode).is.eq(500);
            expect(ok).to.be.false;
            expect(clientError).to.be.false;
            expect(serverError).to.be.true;
            expect(error.path).is.eq(`/api/carts/${cid}`);
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /api/carts/:cid con método DELETE elimina todos los productos del carrito con cid pasado por params", async function(){
            const cid = cartTestData.CID_ERUEDA;
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.delete(`/api/carts/${cid}`);

            // console.log("resultado de la request:", await requester.delete(`/api/carts/${cid}`));
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('cleanCart');
            expect(ok).to.be.true;
            expect(statusCode).is.eq(200);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}`);
            expect(req.method).is.eq('DELETE');
        })

        it("El endpoint /api/carts/:cid con método DELETE arroja un error cuando se pasa un cid inválido por params", async function(){
            const cid = productTestData.INVALID_PID;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.delete(`/api/carts/${cid}`);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(statusCode).is.eq(404);
            expect(ok).to.be.false;
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}`);
            expect(error.method).is.eq('DELETE');
        })

        it("El endpoint /:cid/product/:pid con método PUT modifica la cantidad del producto en el carrito con cid pasado por params", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.PID_EIGHT;

            const updatedQuantity = { quantity: 3 };
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.put(`/api/carts/${cid}/product/${pid}`).send(updatedQuantity);

            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('quantityUpdated');
            expect(body.quantityUpdated).to.has.property('_id');
            expect(body.quantityUpdated).to.has.property('products');
            expect(Array.isArray(body.quantityUpdated.products)).to.be.true;

            const productsInCart = body.quantityUpdated.products;

            for(const product of productsInCart){
                expect(product).to.has.property('productId');
                expect((product.productId).substring(0,2)).is.eq('65');
                expect(product).to.has.property('quantity');
                expect(product.quantity).is.gte(1);
            }
            
            expect(body.quantityUpdated).to.has.property('__v');
            expect(body.quantityUpdated.__v).is.gte(0);
            expect(ok).to.be.true;
            expect(statusCode).is.eq(201);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(req.method).is.eq('PUT');
        })

        it("El endpoint /:cid/product/:pid con método PUT arroja un error cuando se modifica la cantidad de un producto que no existe en el carrito", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.PID_ADMIN;
            const updatedQuantity = { quantity: 23 };
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.put(`/api/carts/${cid}/product/${pid}`).send(updatedQuantity);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(body.detail).is.eq(`El producto con PID ${pid} no existe en el carrito con CID ${cid}.`);
            expect(ok).to.be.false;
            expect(statusCode).is.eq(500);
            expect(clientError).to.be.false;
            expect(serverError).to.be.true;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /:cid/product/:pid con método PUT arroja un error cuando se pasa un cid inválido por params", async function(){
            const cid = productTestData.INVALID_PID;
            const pid = productTestData.PID_EIGHT;
            const updatedQuantity = { quantity: 18 };

            let {body, ok, statusCode, clientError, serverError, error} = await requester.put(`/api/carts/${cid}/product/${pid}`).send(updatedQuantity);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(statusCode).is.eq(500);
            expect(ok).to.be.false;
            expect(clientError).to.be.false;
            expect(serverError).to.be.true;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /:cid/product/:pid con método PUT arroja un error cuando se pasa un pid inválido por params", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.INVALID_PID;
            const updatedQuantity = { quantity: 38 };

            let {body, ok, statusCode, clientError, serverError, error} = await requester.put(`/api/carts/${cid}/product/${pid}`).send(updatedQuantity);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(statusCode).is.eq(500);
            expect(ok).to.be.false;
            expect(clientError).to.be.false;
            expect(serverError).to.be.true;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /:cid/product/:pid con método PUT arroja un error cuando tanto el pid como el cid pasados por params son inválidos", async function(){
            const cid = productTestData.INVALID_PID;
            const pid = productTestData.INVALID_PID;
            const updatedQuantity = { quantity: 8 };

            let {body, ok, statusCode, clientError, serverError, error} = await requester.put(`/api/carts/${cid}/product/${pid}`).send(updatedQuantity);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(statusCode).is.eq(500);
            expect(ok).to.be.false;
            expect(clientError).to.be.false;
            expect(serverError).to.be.true;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /:cid/product/:pid con método DELETE elimina el producto con pid del carrito con cid pasado por params", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.PID_EIGHT;
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.delete(`/api/carts/${cid}/product/${pid}`);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('cartUpdated');
            expect(ok).to.be.true;
            expect(statusCode).is.eq(200);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(req.method).is.eq('DELETE');
        })

        it("El endpoint /:cid/product/:pid con método DELETE arroja un error cuando se elimina un producto que no existe en el carrito", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.PID_ADMIN;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.delete(`/api/carts/${cid}/product/${pid}`);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(body.detail).is.eq(`El producto con PID ${pid} no existe en el carrito con CID ${cid}.`);
            expect(ok).to.be.false;
            expect(statusCode).is.eq(404);
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('DELETE');
        })

        it("El endpoint /:cid/product/:pid con método DELETE arroja un error cuando se pasa un cid inválido por params", async function(){
            const cid = productTestData.INVALID_PID;
            const pid = productTestData.PID_ADMIN;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.delete(`/api/carts/${cid}/product/${pid}`);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(body.detail).is.eq(`Id ${cid} ingresado tiene un formato invalido`);
            expect(ok).to.be.false;
            expect(statusCode).is.eq(404);
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('DELETE');
        })

        it("El endpoint /:cid/product/:pid con método DELETE arroja un error cuando se pasa un pid inválido por params", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.INVALID_PID;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.delete(`/api/carts/${cid}/product/${pid}`);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(body.detail).is.eq(`Id ${pid} ingresado tiene un formato invalido`);
            expect(ok).to.be.false;
            expect(statusCode).is.eq(404);
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('DELETE');
        })

        it("El endpoint /:cid/product/:pid con método DELETE arroja un error cuando tanto el pid como el cid pasados por params son inválidos", async function(){
            const cid = productTestData.INVALID_PID;
            const pid = productTestData.INVALID_PID;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.delete(`/api/carts/${cid}/product/${pid}`);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unexpected error');
            expect(body).to.has.property('detail');
            expect(body.detail).is.eq(`Id ${cid} ingresado tiene un formato invalido`);
            expect(ok).to.be.false;
            expect(statusCode).is.eq(404);
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('DELETE');
        })

        it("El endpoint /:cid/product/:pid con método POST incrementa en uno la cantidad del producto con pid en el carrito con cid pasado por params", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.PID_EIGHT;
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', `coderCookie=${coderCookie}`);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('cartSelected');
            expect(body.cartSelected).to.has.property('_id');
            expect(body.cartSelected).to.has.property('products');

            const productsInCart = body.cartSelected.products;
            expect(Array.isArray(productsInCart)).to.be.true;

            for(const product of productsInCart){
                expect(product).to.has.property('productId');
                expect(product.productId.substring(0,2)).is.eq('65');
                expect(product).to.has.property('quantity');
                expect(product.quantity).is.gte(1);
            }
            
            expect(ok).to.be.true;
            expect(statusCode).is.eq(201);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(req.method).is.eq('POST');
        })
        
        it("El endpoint /:cid/product/:pid con método POST arroja un error cuando se pasa un cid inválido por params", async function(){
            const cid = productTestData.INVALID_PID;
            const pid = productTestData.PID_EIGHT;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', `coderCookie=${coderCookie}`);
            
            // console.log("request:", await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', `coderCookie=${coderCookie}`));
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Error de datos');
            expect(body).to.has.property('detail');
            expect(body.detail).is.eq(`El CID ${cid} solicitado tiene un formato invalido`);
            expect(ok).to.be.false;
            expect(statusCode).is.eq(400);
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('POST');
        })
        
        it("El endpoint /:cid/product/:pid con método POST arroja un error cuando el dueño del producto que se quiere crear es el usuario que realiza la operación", async function(){
            const cid = cartTestData.CID_JLOPEZ;
            const pid = productTestData.PID_FIVE;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', `coderCookie=${coderCookie}`);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Error de autorización');
            expect(body).to.has.property('detail');
            expect(body.detail).is.eq('No posee los permisos para modificar el carrito seleccionado');
            expect(ok).to.be.false;
            expect(statusCode).is.eq(401);
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/carts/${cid}/product/${pid}`);
            expect(error.method).is.eq('POST');
        })

        it("El endpoint /:cid/purchase con método POST retorna un ticket con los detalles de la compra realizada cuando es satisfactoria", async function(){
            const cid = cartTestData.CID_JSATISFACTORIA;
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.post(`/api/carts/${cid}/purchase`);

            // console.log("request:", await requester.post(`/api/carts/${cid}/purchase`));
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('success');
            expect(body).to.has.property('purchaseTicket');
            expect(body.purchaseTicket).to.has.property('amount');
            expect(body).to.has.property('idsProductsWithoutStock');
            expect(Array.isArray(body.idsProductsWithoutStock)).to.be.true;
            expect(body.idsProductsWithoutStock.length).is.eq(0);
            expect(ok).to.be.true;
            expect(statusCode).is.eq(201);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}/purchase`);
            expect(req.method).is.eq('POST');
        })

        it("El endpoint /:cid/purchase con método POST retorna un ticket con los detalles de la compra realizada cuando es insatisfactoria", async function(){
            const cid = cartTestData.CID_RINSATISFACTORIA;
            
            let {body, ok, statusCode, clientError, serverError, req} = await requester.post(`/api/carts/${cid}/purchase`);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('incomplete');
            expect(body).to.has.property('purchaseTicket');
            expect(body.purchaseTicket).to.has.property('amount');
            expect(body.purchaseTicket.amount).is.eq(0);
            expect(body).to.has.property('idsProductsWithoutStock');
            expect(Array.isArray(body.idsProductsWithoutStock)).to.be.true;
            expect(body.idsProductsWithoutStock.length).is.gte(1);
            expect(ok).to.be.true;
            expect(statusCode).is.eq(201);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq(`/api/carts/${cid}/purchase`);
            expect(req.method).is.eq('POST');
        })
    })
})
