const socket = io();  

const ENTER = 'Enter';
let userEmail = '';
let divMensajes = document.getElementById('mensajes');
let inputMensajes = document.getElementById('mensaje');

inputMensajes.addEventListener('keyup', event => {
    if(event.key === ENTER){
        if(event.target.value.trim() !== ''){
            socket.emit('newMessage', {user:userEmail, message:event.target.value.trim()}); 
            event.target.value = '';
            inputMensajes.focus();                                                                     
        }
    }
})

Swal.fire({
    title:"Bienvenido al chat!",
    input:"email",
    text:"Por favor, ingrese su email",
    inputValidator: (value) => {
        return (!value || !value.includes('@')) && "Debe ingresar un email valido...!!!"
    },
    allowOutsideClick:false
}).then(result => {
    userEmail = result.value;
    document.title = userEmail; 
    
    socket.emit('userEmail', userEmail);
    
    socket.on('historialChat', chatHistory => {
        let txt = '';
        chatHistory.forEach(msg => {
            txt += `<p class="mensaje"><strong>${msg.user}</strong>:<i>${msg.message}</i></p><br>`;
        });

        divMensajes.innerHTML = txt;
        divMensajes.scrollTop = divMensajes.scrollHeight;
    });
    
    socket.on('newUserConnectedAlert', userEmail => { 
        Swal.fire({
            text:`${userEmail} se ha conectado...!!!`,
            toast:true,
            position:"top-right"
        })
    })
    
    socket.on('showMessage', message => {
        let txt = '';
        txt += `<p class="mensaje"><strong>${message.user}</strong>:<i>${message.message}</i></p><br>`;

        divMensajes.innerHTML += txt;
        divMensajes.scrollTop = divMensajes.scrollHeight;
    })
    
    socket.on('disconnectedUserAlert', user => {
        Swal.fire({
            text:`${user.userEmail} ha abandonado el chat`,
            toast:true,
            position:"top-right"
        })
    })
})