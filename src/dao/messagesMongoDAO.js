import { messagesModel } from "./models/messages.model.js";

export class MessagesMongoDAO{
    constructor(){}
    
    /**** Metodos ****/

    async get(filter = {}){
        return await messagesModel.find(filter);
    }
    
    async add(msg){
        return await messagesModel.create({
            user: msg.user,
            message: msg.message
        });
    }
}

