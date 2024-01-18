import { ticketsModel } from './models/tickets.model.js';

export class TicketsMongoDAO{
    constructor(){}

    /**** Metodos ****/
    
    async generate(newTicket){
        return await ticketsModel.create(newTicket);
    }
}

