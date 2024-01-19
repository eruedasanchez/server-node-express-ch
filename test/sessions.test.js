import supertest from "supertest";
import chai from 'chai';
import mongoose from "mongoose";
import { before, describe, it } from "mocha";
import { logger } from "../src/utilsWinston.js";
import { config } from "../src/config/config.js";
import { jwtoken, user } from "./dataTest.js";
import { generateHash, validateHash } from "../src/utils.js";

try {
    await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME});
    // await mongoose.connect('mongodb+srv://ezequielruedasanchez:1I5FoZoRlSaz5TsX@cluster0.4vp9khz.mongodb.net/?retryWrites=true&w=majority', {dbName: 'ecommerce'});
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

    describe("Listado de tests del módulo Sessions", function(){
        let coderCookie;
        
        before(async function(){
            coderCookie = jwtoken;
        })
        
        it("El endpoint /api/sessions/current con método GET retorna la información del usuario que actualmente se encuentra loggeado", async function(){
            let {body, ok, statusCode, clientError, serverError, req} = await requester.get("/api/sessions/current").set('Cookie', `coderCookie=${coderCookie}`);
            
            expect(body).to.has.property('status');
            expect(body.status).is.eq('ok');
            expect(body).to.has.property('infoUserLoggedIn');
            expect(body.infoUserLoggedIn).to.has.property('first_name');
            expect(body.infoUserLoggedIn).to.has.property('last_name');
            expect(body.infoUserLoggedIn).to.has.property('email');
            expect(body.infoUserLoggedIn).to.has.property('role');
            expect(body.infoUserLoggedIn.role).not.is.eq('admin');
            expect(ok).to.be.true;
            expect(statusCode).is.eq(200);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq('/api/sessions/current');
            expect(req.method).is.eq('GET');
        })

        it("El endpoint /api/sessions/logout con método GET redirecciona al usuario a la pagina de login con un mensaje", async function(){
            let {ok, statusCode, clientError, serverError, req, res} = await requester.get("/api/sessions/logout").set('Cookie', `coderCookie=${coderCookie}`);
            
            expect(ok).to.be.false;
            expect(statusCode).is.eq(302);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq('/api/sessions/logout');
            expect(req.method).is.eq('GET');
            expect(res).to.has.property('statusMessage');
            expect(res.statusMessage).is.eq('Found');
            expect(res).to.has.property('text');
            expect(res.text).is.eq('Found. Redirecting to /login?message=logout%20correcto!');
        })

        it("El endpoint /api/sessions/login con método POST redirecciona al usuario a la vista de productos previo chequeo de contraseñas", async function(){
            const userTest = { 
                email: 'ezequiel.ruedasanchez@gmail.com',
                password: generateHash(user.password)
            };

            let passwordMatches = validateHash(userTest, user.password);
            expect(passwordMatches).is.true;
            
            let {ok, statusCode, clientError, serverError, req, res} = await requester.post("/api/sessions/login").send(user);
            
            expect(ok).to.be.false;
            expect(statusCode).is.eq(302);
            expect(clientError).to.be.false;
            expect(serverError).to.be.false;
            expect(req.path).is.eq('/api/sessions/login');
            expect(req.method).is.eq('POST');
            expect(res).to.has.property('statusMessage');
            expect(res.statusMessage).is.eq('Found');
            expect(res).to.has.property('text');
        })
    })
})