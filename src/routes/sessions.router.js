import passport from 'passport';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import { Router} from 'express';
import { config } from '../config/config.js';
import { DtoUsers } from '../DTO/dtousers.js';
import { userRole } from '../utils.js';
import { usersModel } from '../dao/models/users.model.js';

export const router = Router();

/*------------------------------*\
    #AUTHORIZATION MIDDLEWARE
\*------------------------------*/

export const authorization = roles => {
    return async(req, res, next) => {
        if(!req.user) return res.status(401).send({status:'error', message:'Unauthorized'});
    
        if(!roles.includes(req.user.role)) return res.status(403).send({status:'error', message:'No permissions'});
        
        next();
    }
}

/*------------------------*\
    #CONNECT WITH GITHUB
\*------------------------*/

router.get('/github', passport.authenticate('github',{}), (req, res) => {})

router.get('/callbackGithub', passport.authenticate('github', {failureRedirect:'errorGithub'}), (req, res) => {
    try {
        req.session.users = req.user;
        res.redirect(`/products?userFirstName=${req.user.first_name}&userEmail=${req.user.email}&userRole=${req.user.rol}`);
    } catch (error) {
        res.status(500).json({error:'Unexpected error', detail:error.message});
    }
})

router.get('/errorGithub', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        error:'Error en Github'
    });
})

/*-----------------*\
    #POST /SIGNUP
\*-----------------*/

router.post('/signup', function(req, res, next) {
    passport.authenticate('signup', async function(err, user, info, status) {
        if (err) return next(err);
        
        if (!user) {
            return res.redirect(`/signup?error=${info.message ? info.message : info.toString()}`);
        }
        
        req.user = user;
        return next();      
    })(req, res, next);
}, (req, res) => {
    res.status(200).redirect(`/login?createdUser=Usuario:${req.user.first_name} registrado correctamente. Username:${req.user.email}`);
});

/*-----------------*\
    #POST /LOGIN
\*-----------------*/

router.post('/login', function(req, res, next) {
    passport.authenticate('login', function(err, user, info, status) {
        if (err) return next(err);
        
        if (!user) return res.redirect(`/login?error=${info.message ? info.message : info.toString()}`);

        user.last_connection = moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYYTHH:mm:ss.SSS[Z]');
        user.save();
        
        req.user = user;
        return next(); 
    })(req, res, next);
}, (req, res) => {
    let user = req.user;
    let token = jwt.sign({user}, config.SECRET, {expiresIn: '1h'});
    
    res.cookie('coderCookie', token, {
        maxAge: 1000 * 60 * 60, 
        httpOnly: true           
    })
    
    res.redirect(`/products?userId=${req.user._id}&userFirstName=${req.user.first_name}&userLastName=${req.user.last_name}&userEmail=${req.user.email}&userRole=${req.user.role}&cartId=${req.user.cart}`);
});

/*----------------*\
    #GET /LOGOUT
\*----------------*/

router.get('/logout', passport.authenticate('current', { session: false }), async (req, res) => {
    try {
        let userLoggedIn = req.user;

        if(req.isAuthenticated){
            let updatedConnection = moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYYTHH:mm:ss.SSS[Z]');
            await usersModel.findByIdAndUpdate(userLoggedIn._id, { last_connection: updatedConnection });
        }
        
        res.clearCookie('coderCookie');
        return res.redirect('/login?message=logout correcto!');
    } catch (error) {
        return res.status(500).json({error:'Unexpected error', detail:error.message});
    }
})

/*----------------*\
    #GET /CURRENT
\*----------------*/

router.get('/current', passport.authenticate('current', {session:false}), authorization([userRole.USER, userRole.PREMIUM]), (req, res) => {
    try {
        let userLoggedIn = req.user;
        userLoggedIn = new DtoUsers(userLoggedIn);
        
        return res.status(200).json({status:'ok', infoUserLoggedIn:userLoggedIn});                      
    } catch (error) {
        return res.status(500).json({error:'Unexpected error', detail:error.message});
    }
})
