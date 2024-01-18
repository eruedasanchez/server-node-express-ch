// import path from 'path';
// import dotenv from 'dotenv';
// import __dirname from '../utils.js';
// import { Command, Option } from 'commander';

// let program = new Command();

// program
//     .addOption(new Option("-p, --persistence <persistence>", "Modo para la persistencia de archivos").choices(["fs","mongodb"]).default("mongodb"))
//     .parse()
    
// let persistenceChoosen = program.opts().persistence;

// dotenv.config({
//     override:true, 
//     path: persistenceChoosen === "mongodb" ? path.join(__dirname, '.env.mongodb') : path.join(__dirname, '.env.fs')
// })

export const config = {
    PORT: process.env.PORT,
    // SECRET: process.env.SECRET,
    // MONGO_URL: process.env.MONGO_URL,
    // DB_NAME: process.env.DB_NAME,
    // SESSION_TTL: process.env.SESSION_TTL,
    // SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,
    // NODEMAILER_SERVICE: process.env.NODEMAILER_SERVICE,
    // NODEMAILER_PORT: process.env.NODEMAILER_PORT,
    // TRANSPORT_USER: process.env.TRANSPORT_USER,
    // TRANSPORT_PASS: process.env.TRANSPORT_PASS,
    // PERSISTENCE: process.env.PERSISTENCE,
    // MODE: process.env.MODE || 'development',
    // GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    // GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    // GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    // ACCESS_TOKEN: process.env.ACCESS_TOKEN
}
