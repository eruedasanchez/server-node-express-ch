import supertest from 'supertest';
import chai from 'chai';
import mongoose from 'mongoose';
import { before, describe, it } from 'mocha';
import { logger } from '../src/utilsWinston.js';
import { config } from '../src/config/config.js';
import { buildProductVersion, jwtoken, productTestData } from './dataTest.js';

try {
    // await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME});
    await mongoose.connect('mongodb+srv://ezequielruedasanchez:1I5FoZoRlSaz5TsX@cluster0.4vp9khz.mongodb.net/?retryWrites=true&w=majority', {dbName: 'ecommerce'});
    logger.info('MongoDB Atlas Conectada');
} catch (error) {
    logger.fatal(`Error al conectarse con MongoDB Atlas. Detalle: ${error.message}`);
}
// try {
//     await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME});
//     logger.info('MongoDB Atlas Conectada');
// } catch (error) {
//     logger.fatal(`Error al conectarse con MongoDB Atlas. Detalle: ${error.message}`);
// }

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Tests del proyecto Ecommerce", function(){
    this.timeout(6000); 

    describe("Listado de tests del módulo Products", function(){
        let coderCookie;

        before(async function(){
            coderCookie = jwtoken;
        })
        
        beforeEach(async function(){
            await mongoose.connection.collection('products').deleteMany({category:'mesas'});
        })

        afterEach(async function(){
            await mongoose.connection.collection('products').deleteMany({category:"mesas"});
        })

        it("El endpoint /api/products con método GET permite obtener los primeros 10 productos almacenados en la DB", async function(){
            let {body, ok, statusCode} = await requester.get("/api/products");
            
            expect(body.MongoDBProducts.status).is.eq('success');
            expect(statusCode).is.eq(200);
            expect(ok).to.be.true;
            expect(body.MongoDBProducts).to.has.property('payload');
            expect(Array.isArray(body.MongoDBProducts.payload)).to.be.equal(true);
            
            body.MongoDBProducts.payload.forEach(product => {
                expect(product).to.have.property("_id");
                expect(product._id.length).is.eq(24);
                expect(product).to.have.property("title");
                expect(typeof product.title).to.be.equal('string');
                expect(product).to.have.property("description");
                expect(typeof product.title).to.be.equal('string');
                expect(product).to.have.property("code");
                expect(typeof product.title).to.be.equal('string');
                expect(product).to.have.property("price");
                expect(product.price).is.gte(1);
                expect(product).to.have.property("status");
                expect(typeof product.status).to.be.equal('boolean');
                expect(product).to.have.property("stock");
                expect(product.stock).is.gte(1);
                expect(product).to.have.property("category");
                expect(typeof product.title).to.be.equal('string');
                expect(product).to.have.property("thumbnails");
                expect(Array.isArray(product.thumbnails)).to.be.equal(true);
                expect(product).to.have.property("owner");
            });


        })

        it("El endpoint /api/products/:pid con método GET permite obtener el producto en la DB con el pid pasado por params", async function(){
            const pid = productTestData.PID_TWO;
            const productProperties = productTestData.PRODUCT_PROPERTIES;

            let {body, ok, statusCode} = await requester.get(`/api/products/${pid}`);
            
            expect(body.status).is.eq('ok');
            expect(statusCode).is.eq(200);
            expect(ok).to.be.true;
            expect(Array.isArray(body.MongoDBProduct)).to.be.equal(true);
            expect(body.MongoDBProduct.length).to.be.equal(1);

            const productSelected = body.MongoDBProduct[0];
            
            for(const property of productProperties){
                expect(Object.keys(productSelected).includes(property)).to.be.equal(true);
            }
        })

        it("El endpoint /api/products/:pid con método GET arroja un error cuando el pid pasado por param no es de tipo ObjectId", async function(){
            const pid = productTestData.INVALID_PID;
            
            let {body, ok, statusCode, clientError, serverError, error} = await requester.get(`/api/products/${pid}`);
            
            expect(ok).to.be.false;
            expect(statusCode).is.eq(404);
            expect(clientError).to.be.true;
            expect(serverError).to.be.false;
            expect(error.path).is.eq(`/api/products/${pid}`);
            expect(error.method).is.eq('GET');
            expect(body).to.has.property('error');
            expect(body.error).is.eq('PID inválido');
            expect(body).to.has.property('detalle');
            expect(body.detalle).is.eq('El PID hola solicitado tiene un formato invalido');
        })

        it("El endpoint /api/products con método POST permite generar un producto nuevo en la DB", async function(){
            const productTest = productTestData.POST_PRODUCT;
            const productProperties = productTestData.PRODUCT_PROPERTIES;

            let {body, ok, statusCode, req} = await requester.post("/api/products").set('Cookie', `coderCookie=${coderCookie}`).send(productTest);
            
            expect(ok).to.be.true;
            expect(statusCode).is.eq(201);
            expect(req.path).is.eq('/api/products');
            expect(req.method).is.eq('POST');
            expect(body.status).is.eq('ok');
            
            const productAdded = body.newProduct;
            for(const property of productProperties){
                expect(Object.keys(productAdded).includes(property)).to.be.equal(true);
            }
        })

        it("El endpoint /api/products con método POST arroja un error cuando no se completa por body alguna propiedad", async function(){
            const productTest = productTestData.POST_PRODUCT_EMPTY_DESCRIPTION;
            
            let {body, ok, statusCode, error} = await requester.post("/api/products").set('Cookie', `coderCookie=${coderCookie}`).send(productTest);
            
            expect(ok).to.be.false;
            expect(statusCode).is.eq(404);
            expect(error.path).is.eq('/api/products');
            expect(error.method).is.eq('POST');
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Complete todos los campos');
            expect(body).to.has.property('detalle');
        })

        it("El endpoint /api/products/:pid con método PUT permite modificar un producto existente en la DB", async function(){
            const pid = productTestData.PID_FIVE;
            const productTest = await buildProductVersion('', 2);
            
            let {body, ok, statusCode, req} = await requester.put(`/api/products/${pid}`).set('Cookie', `coderCookie=${coderCookie}`).send(productTest);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('updatedProducts');
            expect(ok).to.be.true;
            expect(statusCode).is.eq(200);
            expect(req.path).is.eq(`/api/products/${productTestData.PID_FIVE}`);
            expect(req.method).is.eq('PUT');
        })
        
        it("El endpoint /api/products/:pid con método PUT no permite modificar un producto cuyo titulo este asignado a un producto de la DB", async function(){
            const pid = productTestData.PID_FIVE;
            const productTest = await buildProductVersion('title', 2);
            
            let {body, ok, statusCode, error} = await requester.put(`/api/products/${pid}`).set('Cookie', `coderCookie=${coderCookie}`).send(productTest);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Titulo inválido');
            expect(body).to.has.property('detail');
            expect(ok).to.be.false;
            expect(statusCode).is.eq(400);
            expect(error.path).is.eq(`/api/products/${pid}`);
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /api/products/:pid con método PUT no permite modificar un producto cuya descripción este asignada a un producto de la DB", async function(){
            const pid = productTestData.PID_FIVE;
            const productTest = await buildProductVersion('description', 2);
            
            let {body, ok, statusCode, error} = await requester.put(`/api/products/${pid}`).set('Cookie', `coderCookie=${coderCookie}`).send(productTest);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Descripción inválida');
            expect(body).to.has.property('detail');
            expect(ok).to.be.false;
            expect(statusCode).is.eq(400);
            expect(error.path).is.eq(`/api/products/${pid}`);
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /api/products/:pid con método PUT no permite modificar un producto cuyo código este asignado a un producto de la DB", async function(){
            const pid = productTestData.PID_FIVE;
            const productTest = await buildProductVersion('code', 2);
            
            let {body, ok, statusCode, error} = await requester.put(`/api/products/${pid}`).set('Cookie', `coderCookie=${coderCookie}`).send(productTest);
            
            expect(body).to.has.property('error');
            expect(body.error).is.eq('Codigo inválido');
            expect(body).to.has.property('detail');
            expect(ok).to.be.false;
            expect(statusCode).is.eq(400);
            expect(error.path).is.eq('/api/products/656e82d3aecef67c8207a314');
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /api/products/:pid con método PUT no permite modificar un producto a un usuario que no sea el propietario del mismo", async function(){
            const pid = productTestData.PID_ADMIN;
            const productTest = productTestData.POST_PRODUCT_ADMIN;
            
            let {body, ok, statusCode, error} = await requester.put(`/api/products/${pid}`).set('Cookie', `coderCookie=${coderCookie}`).send(productTest);

            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unauthorized');
            expect(body).to.has.property('detalle');
            expect(ok).to.be.false;
            expect(statusCode).is.eq(401);
            expect(error.path).is.eq('/api/products/656e5a832943f50a737deae9');
            expect(error.method).is.eq('PUT');
        })

        it("El endpoint /api/products/:pid con método DELETE permite eliminar un producto existente en la DB", async function(){
            const pid = productTestData.PID_DELETE;
            
            let {body, ok, statusCode, req} = await requester.delete(`/api/products/${pid}`).set('Cookie', `coderCookie=${coderCookie}`);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('deletedProduct');
            expect(ok).to.be.true;
            expect(statusCode).is.eq(200);
            expect(req.path).is.eq(`/api/products/${pid}`);
            expect(req.method).is.eq('DELETE');
        })

        it("El endpoint /api/products/:pid con método DELETE no permite eliminar un producto que no se tenga los permisos", async function(){
            const pid = productTestData.PID_ADMIN;
            
            let {body, ok, statusCode, error} = await requester.delete(`/api/products/${pid}`).set('Cookie', `coderCookie=${coderCookie}`);

            expect(body).to.has.property('error');
            expect(body.error).is.eq('Unauthorized');
            expect(body).to.has.property('detalle');
            expect(ok).to.be.false;
            expect(statusCode).is.eq(401);
            expect(error.path).is.eq(`/api/products/${pid}`);
            expect(error.method).is.eq('DELETE');
        })
    })
})