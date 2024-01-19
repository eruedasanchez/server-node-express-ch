import path from 'path';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import passport from 'passport';
import moment from 'moment-timezone';
import __dirname from '../utils.js';
import { generateHash, validateHash, userRole, documentation, urlAdmin, TWO_DAYS, URL_ORIGIN } from '../utils.js';
import { Router} from 'express';
import { config } from '../config/config.js';
import { usersModel } from '../dao/models/users.model.js';
import { authorization } from './sessions.router.js';
import { cartsService } from '../services/carts.service.js';

export const router = Router();

/*------------------------------------*\
    #UPLOADS FILES WITH MULTER
\*------------------------------------*/

const configureMulter = folder => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.join(__dirname, `/tmp/uploads/${folder}`));
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        })
    });
};

const uploadProfiles = configureMulter('profiles');
const uploadProducts = configureMulter('products') ;
const uploadDocuments = configureMulter('documents');

/*---------------------*\
    #FUNCTIONS MAILING
\*---------------------*/

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

const sendEmail = async (jwtoken, to)  => {
    return transporter.sendMail({
        from: 'Ezequiel <ezequiel.ruedasanchez@gmail.com>',
        to: to,
        subject: 'Reset Password',
        html: `
        <h2>Solicitud de reestablecimeinto de contraseña</h2>
        <p>Para continuar con el proceso, haga click en el siguiente link:</p>
        <a style="color:white; background-color:blue" href="http://localhost:8080/confirmNewPassword?token=${jwtoken}">Reestablecer contraseña</a>
        <br>
        <br>
        <p>En caso de no haber realizado la solicitud, desestime este mensaje</p>
        `,
    });
}

const sendEmailUnsubscribedAccount = async to => {
    return transporter.sendMail({
        from: 'Ezequiel <ezequiel.ruedasanchez@gmail.com>',
        to: to,
        subject: 'Unsubscribed Account',
        html: `
        <h2>Su cuenta ha sido de baja por inactivad</h2>
        <p>Lo sentimos mucho. Si desea seguir utilizando nuestros servicios, haga click en el siguiente enlace para volver a suscribirse:</p>
        <a style="color:white; background-color:blue" href="http://localhost:8080/signup">Registrarme nuevamente</a>
        <br>
        <br>
        <p>Este es un mensaje meramente informativo. No responda este mensaje por favor.</p>
        `,
    });
}

/*------------------------*\
    #POST /RESETPASSWORD
\*------------------------*/

router.post('/resetPassword', async (req, res, next) => {

    let requestedEmail = req.body.email;

    if(!requestedEmail) return res.redirect('/resetPassword?error=Ingrese un email válido');
    
    let user = await usersModel.findOne({email:requestedEmail});
    
    if(!user){
        return res.redirect('/resetPassword?unregisteredEmail=El email ingresado no corresponde a un cliente registrado');
    }
    
    let jwtoken = jwt.sign({user}, config.SECRET, {expiresIn: '1h'});
    // let jwtoken = jwt.sign({user}, 'secretPass', {expiresIn: '1h'}); 
    await sendEmail(jwtoken, user.email);
    
    return res.redirect(`/resetPassword?successResetRequest=Solicitud de reestablecimiento exitosa. Enviamos un mail a ${requestedEmail} para que continue con el proceso de reestablecemiento`);
});

/*--------------------------*\
    #POST /CONFIRMPASSWORD
\*--------------------------*/

router.post('/confirmPassword', async (req, res) => {
    try {
        let {password, email} = req.body;
        
        let user = await usersModel.findOne({email:email});
        
        if(validateHash(user, password)){
            return res.redirect('/resetPassword?samePassword=La contraseña ingresada es igual a la actual. Por favor, realice una nueva solicitud.');
        }
        
        user.password = generateHash(password);
        await user.save();
        
        return res.redirect('/login?successNewPassword=La contraseña ha sido reestablecida con éxito');
    } catch (error) {
        console.error("Error al guardar la contraseña:", error);
        return res.redirect('/confirmNewPassword?error=Error al reestablecer la contraseña');
    }
});

/*------------------------*\
    #POST /:uid/PROFILES
\*------------------------*/

router.post('/:uid/profiles', passport.authenticate('current', { session: false }), uploadProfiles.single('profiles'), async (req, res) => {
    try {
        let userId = req.params.uid;
        let { originalname, path } = req.file;
        
        let user = await usersModel.findOne({_id:userId});

        let newDocument = {
            name: originalname,
			reference: path
        }

        user.documents.push(newDocument);
        user.save();
        
        return res.redirect(`/products?userId=${req.user._id}&userFirstName=${req.user.first_name}&userLastName=${req.user.last_name}&userEmail=${req.user.email}&userRole=${req.user.role}&cartId=${req.user.cart}&successProfile=${`Carga correcta del perfil`}`);
    } catch (error) {
        req.logger.fatal(`Error al cargar la documentación. Detalle: ${error.message}`);
        return res.status(400).json({ error: 'Unexpected', detalle: error.message });
    }
});

/*------------------------*\
    #POST /:uid/PRODUCTS
\*------------------------*/

router.post('/:uid/products', passport.authenticate('current', { session: false }), uploadProducts.array('products'), async (req, res) => {
    try {
        let userId = req.params.uid;
        const loadedProducts = req.files;
        
        let user = await usersModel.findOne({_id:userId});

        const newDocuments = loadedProducts.map(product => ({
            name: product.originalname,
            reference: product.path
        }));

        user.documents.push(...newDocuments);

        await user.save();
        
        return res.redirect(`/products?userId=${req.user._id}&userFirstName=${req.user.first_name}&userLastName=${req.user.last_name}&userEmail=${req.user.email}&userRole=${req.user.role}&cartId=${req.user.cart}&successProducts=${`Carga correcta de los productos`}`);
    } catch (error) {
        req.logger.fatal(`Error al cargar la documentación. Detalle: ${error.message}`);
        return res.status(400).json({ error: 'Unexpected', detalle: error.message });
    }
});

/*------------------------*\
    #POST /:uid/DOCUMENTS
\*------------------------*/

router.post('/:uid/documents', passport.authenticate('current', { session: false }), uploadDocuments.array('documents'), async (req, res) => {
    try {
        let userId = req.params.uid;
        const loadedProducts = req.files;
        
        let user = await usersModel.findOne({_id:userId});

        const newDocuments = loadedProducts.map(product => ({
            name: product.originalname,
            reference: product.path
        }));

        user.documents.push(...newDocuments);

        await user.save();
        
        return res.redirect(`/products?userId=${req.user._id}&userFirstName=${req.user.first_name}&userLastName=${req.user.last_name}&userEmail=${req.user.email}&userRole=${req.user.role}&cartId=${req.user.cart}&successDocuments=${`Carga correcta de los productos`}`);
    } catch (error) {
        req.logger.fatal(`Error al cargar la documentación. Detalle: ${error.message}`);
        return res.status(400).json({ error: 'Unexpected', detalle: error.message });
    }
});

/*----------------------*\
    #POST /PREMIUM/:UID
\*----------------------*/

router.post('/premium/:uid', async (req, res) => {
    try {
        let userId = req.params.uid;
        
        let user = await usersModel.findOne({_id:userId});
        
        if(user.role === userRole.USER && req.rawHeaders[URL_ORIGIN] != urlAdmin.PANEL && req.rawHeaders[URL_ORIGIN] != urlAdmin.ROLE_SUCCESS){
            const documentationLoaded = user.documents;
            
            let documentType, cantMandatoryDocumentation = 0;
            for(const document of documentationLoaded){
                documentType = document.reference.split('/')[documentation.FOLDER]; 
                
                if(documentType === documentation.PROFILE || documentType === documentation.DOCUMENT){  
                    cantMandatoryDocumentation++;
                }
            }

            if(cantMandatoryDocumentation === documentation.EMPTY){
                return res.redirect(`/products?userId=${user._id}&userFirstName=${user.first_name}&userLastName=${user.last_name}&userEmail=${user.email}&userRole=${user.role}&cartId=${user.cart}&unsuccessChangeRole=${`Error al cambiar de rol`}`);
            }
        }
        
        user.role === userRole.PREMIUM ? user.role = userRole.USER : user.role = userRole.PREMIUM;
        
        await user.save();

        if(req.rawHeaders[URL_ORIGIN] != urlAdmin.PANEL && req.rawHeaders[URL_ORIGIN] != urlAdmin.ROLE_SUCCESS){
            return res.redirect(`/products?userId=${user._id}&userFirstName=${user.first_name}&userLastName=${user.last_name}&userEmail=${user.email}&userRole=${user.role}&cartId=${user.cart}`);
        } else {
            return res.redirect('/adminPanel?successChangeRole=cambio-exitoso-de-rol');
        }
    } catch (error) {
        req.logger.fatal(`Error al modificar el rol del usuario. Detalle: ${error.message}`);
        return res.status(500).json({error:'Unexpected', detalle:error.message});
    }
});

/*----------*\
    #GET /
\*----------*/

router.get('/', async (req, res) => {
    try {
        let usersDB = await usersModel.find();
        
        let registeredUsers = usersDB.map(user => {
            return {
                first_name: user.first_name,
                email: user.email,
                role: user.role
            }
        })
        
        return res.status(200).json({status:'ok', registeredUsers:registeredUsers});
    } catch (error) {
        req.logger.fatal(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detalle:error.message});
    }
});

/*-------------*\
    #DELETE /
\*-------------*/

router.delete('/', async (req, res) => {
    try {
        let usersDB = await usersModel.find();
        
        for (const user of usersDB) {
            if(user.last_connection){
                const lastConnectionParsed = moment.tz(user.last_connection, 'DD-MM-YYYYTHH:mm:ss.SSSZ', 'America/Argentina/Buenos_Aires');
                const differenceInDays = moment().tz('America/Argentina/Buenos_Aires').diff(lastConnectionParsed, 'days');
                
                if(differenceInDays > TWO_DAYS){
                    await sendEmailUnsubscribedAccount(user.email);
                    await usersModel.deleteOne({_id: user._id});
                }
            }             
        }

        usersDB = await usersModel.find();
        return res.status(200).json({status: 'ok', usersDBUpdated: usersDB});
    } catch (error) {
        req.logger.fatal(`Error al realizar la limpieza de usuarios. Detalle: ${error.message}`);
        return res.status(error.code).json({error:error.description, detalle:error.message});
    }
});

/*----------------------*\
    #POST /DELETE/:UID
\*----------------------*/

router.post('/delete/:uid', async (req, res) => {
    try {
        let userId = req.params.uid;
        
        await usersModel.deleteOne({_id: userId});
        
        return res.redirect('/adminPanel?successDeletedUser=usuario-eliminado-exitosamente');
    } catch (error) {
        req.logger.fatal(`Error al eliminar el usuario. Detalle: ${error.message}`);
        return res.status(500).json({error:'Unexpected', detalle:error.message});
    }
});

/*-------------------------*\
    #POST /CARTSTATUS/:cid
\*-------------------------*/

router.post('/cartStatus/:cid', passport.authenticate('current', {session:false}), authorization([userRole.USER, userRole.PREMIUM]), async (req, res) => {
    try {
        let cartId = req.params.cid; 
        let infoUserLoggedIn = req.user;
        
        let cartSelected = await cartsService.getCartByIdLean(cartId);
        let productsSelected = cartSelected[0].products;

        let cartLoaded = productsSelected.length > 0;
        
        if(cartLoaded){
            return res.redirect(`/orderDetail/${cartId}/purchase?userFirstName=${infoUserLoggedIn.first_name}&userLastName=${infoUserLoggedIn.last_name}&userEmail=${infoUserLoggedIn.email}&userRole=${infoUserLoggedIn.role}&cartId=${cartId}`);
        } else {
            return res.redirect(`/products?userFirstName=${infoUserLoggedIn.first_name}&userLastName=${infoUserLoggedIn.last_name}&userEmail=${infoUserLoggedIn.email}&userRole=${infoUserLoggedIn.role}&cartId=${cartId}&emptyCart=${`Carrito vacio`}`);
        }
    } catch (error) {
        req.logger.fatal(`Error al chequear el estado del carrito. Detalle: ${error.message}`);
        return res.status(500).json({error:'Unexpected', detalle:error.message});
    }
});

