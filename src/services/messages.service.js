import { messagesDAO as DAO } from "../dao/factory.js";

class MessagesService{
    constructor(dao){
        this.dao = new dao(); 
    }

    async getChat(){
        return await this.dao.get();
    }

    async getChatByUser(user){
        return await this.dao.get({user});
    }

    async addToChat(msg){
        return await this.dao.add(msg);
    }
}

export const messagesService = new MessagesService(DAO);

