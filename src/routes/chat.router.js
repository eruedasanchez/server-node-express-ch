import express from 'express';
import passport from 'passport';
import messagesController from '../controllers/messagesController.js';
import { messagesService } from '../services/messages.service.js';
import { authorization } from './sessions.router.js';
import { userRole } from '../utils.js';

export const router = express.Router();

/*----------------*\
    #CHAT ROUTES
\*----------------*/

router.get('/', passport.authenticate('current', {session:false}), authorization(userRole.USER), messagesController.renderChat);

let usersList = [];

export const initChat = serverSocketChat => {
    serverSocketChat.on('connection', socket => {
        console.log(`Se ha conectado un cliente con ID ${socket.id} al chat`);
        
        socket.on('userEmail', async userEmail => {
            usersList.push({
                id: socket.id,
                userEmail: userEmail
            })
            
            let chatHistory = await messagesService.getChat();
            socket.emit('historialChat', chatHistory);                       
            
            socket.broadcast.emit('newUserConnectedAlert', userEmail);      
        })

        socket.on('newMessage', message => {
            messagesService.addToChat(message);
            serverSocketChat.emit('showMessage', message);                
        })
        
        socket.on('disconnect',() => {
            let index = usersList.findIndex(user => user.id === socket.id);
            let currentUser = usersList[index];
            serverSocketChat.emit('disconnectedUserAlert', currentUser);          
            usersList = usersList.filter(user => user !== currentUser);
        })
    })
}

