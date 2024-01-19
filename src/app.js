import __dirname from './utils.js';
import path from 'path';
import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import session from 'express-session';
import ConnectMongo from 'connect-mongo';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'socket.io';
import { router as productsRouter } from './routes/products.router.js';
import { router as cartsRouter } from './routes/carts.router.js';
import { router as viewsRouter } from './routes/views.router.js';
import { router as sessionsRouter } from './routes/sessions.router.js';
import { router as usersRouter } from './routes/users.router.js';
import { router as mercadoPagoRouter } from './routes/mercadoPago.router.js';
import { initChat, router as chatRouter } from './routes/chat.router.js';
import { initPassport } from './config/passport.config.js';
import { config } from './config/config.js';
import { errorHandler } from './services/errors/errorsHandler.js';
import { middLog, logger } from './utilsWinston.js';

const PORT = config.PORT || 8080;
// const PERSISTENCE = config.PERSISTENCE;
// test
const PERSISTENCE = "MONGODB";
logger.info(`Persistencia en ${PERSISTENCE} iniciada`);

const app = express();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Documentación e-commerce',
            version: '1.0.0',
            description: 'Descripción de la documentación del proyecto e-commerce'
        }
    },
    apis: [path.join(__dirname, 'docs', '*.yaml')]
}

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(middLog);
app.use(cors());

app.engine('handlebars', handlebars.engine()); 
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));

app.use(cookieParser());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/chat', chatRouter);

app.use(session({
    secret: config.SESSION_SECRET_KEY,
    // secret: 'claveSecreta',
    resave: true,
    saveUninitialized: true,
    store: ConnectMongo.create({
        mongoUrl: `${config.MONGO_URL}&dbName=${config.DB_NAME}`,
        ttl: config.SESSION_TTL
        // mongoUrl: 'mongodb+srv://ezequielruedasanchez:1I5FoZoRlSaz5TsX@cluster0.4vp9khz.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce',
        // ttl: 300
    })
}))

initPassport();
app.use(passport.initialize());
app.use(passport.session()); 

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/mercadoPago', mercadoPagoRouter);
app.use('/', viewsRouter);
app.use(errorHandler);

const serverExpress = app.listen(PORT, () => {
    logger.info(`Server escuchando en puerto ${PORT}`);
});

export const serverSocket = new Server(serverExpress);

initChat(serverSocket);

try {
    await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME});
    // await mongoose.connect('mongodb+srv://ezequielruedasanchez:1I5FoZoRlSaz5TsX@cluster0.4vp9khz.mongodb.net/?retryWrites=true&w=majority', {dbName: 'ecommerce'});
    logger.info('MongoDB Atlas Conectada');
} catch (error) {
    logger.fatal(`Error al conectarse con MongoDB Atlas. Detalle: ${error.message}`);
}

// Ultimo commit Final-project+RuedaSanchez 

