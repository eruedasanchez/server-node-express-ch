import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const TWO_DAYS = 2;
export const URL_ORIGIN = 33;

export const urlAdmin = {
    PANEL: 'http://localhost:8080/adminPanel',
    ROLE_SUCCESS: 'http://localhost:8080/adminPanel?successChangeRole=cambio-exitoso-de-rol'
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const validateHash = (user, password) => bcrypt.compareSync(password, user.password);

export const userRole = {
    USER: 'user',
    PREMIUM: 'premium',
    ADMIN: 'admin'
};

export const adminInfo = {
    FIRST_NAME:'adminCoder', 
    LAST_NAME:'House', 
    EMAIL: 'adminCoder@coder.com', 
    AGE: 25, 
    PASSWORD: 'adminCod3r123'
};

export const sorting = {
    ASC: 'asc',
    DESC: 'desc',
};

export const ops = {
    POPULATE:'populate', 
    LEAN: 'lean'
};

export const documentation = {
    EMPTY: 0,
    FOLDER: 10, 
    PROFILE: 'profiles',
    DOCUMENT: 'documents'
};

