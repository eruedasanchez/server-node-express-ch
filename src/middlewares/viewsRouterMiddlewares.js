import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

/*------------------------------------------------------------------*\
    #MIDDLEWARES GET '/', '/login', '/signup', /confirmNewPassword
\*------------------------------------------------------------------*/

export const activeSessionMid = (req, res, next) => {
    if(req.session.users){
        let {first_name, last_name, email, rol} = req.session.users;
        return res.redirect(`/products?userFirstName=${first_name}&userLastName=${last_name}&userEmail=${email}&userRole=${rol}`);
    } 
    next();
}

export const auth = async (req, res, next) => {
    let token = req.query.token;
    try {
        // let infoUser = jwt.verify(token, config.SECRET);
        let infoUser = jwt.verify(token, 'secretPass');
        req.user = infoUser.user;
        next();
    } catch (error) {
        return res.redirect('/resetPassword?expiredToken=El link se encuentra vencido. Por favor, envíe nuevamente la solicitud');
    }
}