import { messagesModel } from "../models/messages.model.js";

class MongoChatManager{
    
    /**** Metodos ****/
    
    async getChat(){
        return await messagesModel.find();
    }

    async getChatByUser(user) {
        return await messagesModel.findOne({user});
    }

    async addToChat(msg){
        await messagesModel.create({
            user: msg.user,
            message: msg.message
        });
    }
}

export default MongoChatManager;
