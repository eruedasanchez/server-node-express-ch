import { config } from '../config/config.js';

let productsDAO, cartsDAO;
let messagesDAO = await import('./messagesMongoDAO.js');
messagesDAO = messagesDAO.MessagesMongoDAO;
let ticketsDAO = await import('./ticketsMongoDAO.js');
ticketsDAO = ticketsDAO.TicketsMongoDAO;

switch (config.PERSISTENCE) {
    case "FS":
        productsDAO = await import('./productsFsDAO.js');
        cartsDAO = await import('./cartsFsDAO.js');
        productsDAO = productsDAO.ProductsFsDAO;
        cartsDAO = cartsDAO.CartsFsDAO;    
        break;

    case "MONGODB":
        productsDAO = await import('./productsMongoDAO.js');
        cartsDAO = await import('./cartsMongoDAO.js');
        productsDAO = productsDAO.ProductsMongoDAO;
        cartsDAO = cartsDAO.CartsMongoDAO;
        break;
    
    default:
        throw new Error("Persistencia invalida");
}

export { productsDAO, cartsDAO, messagesDAO, ticketsDAO };