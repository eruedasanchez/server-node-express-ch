import winston from 'winston';
import { config } from './config/config.js';

const customLevels = {
    personalizeLevels: { fatal:0, error:1, warning:2, info:3, http:4, debug:5 },
    personalizeColors: { fatal:"bold cyan redBG", error:"bold white magentaBG", warning:"bold white yellowBG", info:"bold white blueBG", http:"bold white cyanBG", debug:"bold white greenBG" } 
}

export const logger = winston.createLogger({
    levels: customLevels.personalizeLevels, 
    transports: [
        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
})

const transportDevConsole = new winston.transports.Console({
    level: 'debug',
    format: winston.format.combine(
        winston.format.colorize({colors: customLevels.personalizeColors}),
        winston.format.simple()
    )
})

const transportProdConsole = new winston.transports.Console({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize({colors: customLevels.personalizeColors}),
        winston.format.simple()
    )
})

if(config.MODE !== 'production'){
    logger.add(transportDevConsole);
} else {
    logger.add(transportProdConsole);
} 

export const middLog = (req, res, next) => {
    req.logger = logger;
    next();
}

