import passport from 'passport';
import local from 'passport-local';
import github from 'passport-github2';
import passportJWT from 'passport-jwt';
import MongoCartManager from '../dao/mongoDB-manager/MongoCartManager.js';
import { usersModel } from '../dao/models/users.model.js';
import { generateHash, validateHash, userRole, adminInfo } from '../utils.js';
import { config } from './config.js';

const mongoCartManager = new MongoCartManager();

const searchToken = req => {
    let token = null;
    
    if(req.cookies.coderCookie) token = req.cookies.coderCookie;
    
    return token;
}

export const initPassport = () => {
    passport.use('signup', new local.Strategy(
        {
            usernameField:'email', passReqToCallback:true
        }, 
        async (req, username, password, done) => {
            try {
                let {first_name, last_name, email, age, password} = req.body;
                
                if(!first_name || !last_name || !email || !age || !password){
                    return done(null, false, {message:'Todos los campos son obligatorios'}); 
                }

                let emailRegistered = await usersModel.findOne({email: username});

                if(emailRegistered) return done(null, false, {message:`El email ${username} ya se encuentra registrado en el sistema`});
                
                const newCart = await mongoCartManager.createCart();
                const cartId = newCart._id;
                
                let user = await usersModel.create({
                    first_name,
                    last_name,
                    email,
                    age,
                    password: generateHash(password),
                    role: (email === adminInfo.EMAIL && password === adminInfo.PASSWORD) ? userRole.ADMIN : userRole.USER,
                    cart: cartId 
                });
                
                return done(null, user); 
            } catch (error) {
                return done(error);
            }
        }
    ))

    passport.use('login', new local.Strategy(
        {
            usernameField: 'email'
        }, async (username, password, done) => {
            try {
                if(!username || !password) return done(null, false);
                
                let user = await usersModel.findOne({email:username});
                
                if(!user || !validateHash(user, password)){
                    return done(null, false, {message:'Credenciales incorrectas'});
                } 
                
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ))
    
    passport.use('github', new github.Strategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL
            // clientID: 'Iv1.f39cdb52aec8edcb',
            // clientSecret: '601b9221a2029df1b4a7a270c1cd8f21396888bc',
            // callbackURL: 'http://localhost:8080/api/sessions/callbackGithub'
        },
        async (token, tokenRefresh, profile, done) => {
            try {
                let rol = userRole.USER;
                let user = await usersModel.findOne({email:profile._json.email});  
                
                if(!user){
                    user = await usersModel.create({
                        first_name: profile._json.name,
                        email: profile._json.email,
                        rol: rol  
                    })
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ))
    
    passport.use('current', new passportJWT.Strategy(
        {
            jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([searchToken]), 
            secretOrKey: config.SECRET
        },
        (jwtContent, done) => {
            try {
                return done(null, jwtContent.user) 
            } catch (error) {
                return done(error);
            }
        }
    ))
} 
