const express = require('express');
const Queue = require('bull');

const { Client, LocalAuth } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');


const app = express();

app.get('/', (req, res) => {

    console.log('done');

    const client = new Client({

        authStrategy: new LocalAuth({ clientId: "client-one" }) 
    });


    client.on('ready', (session) => {

        console.log("Client is ready!");
    
        const number = "201150142991";
    
        const text = "Hey this massage from whatsapp  markting  online chate ";
    
        const chatId = number + "@c.us";
    
        
        for (let i = 0; i < 10; i++) {

            console.log(i);
            client.sendMessage(chatId, text);
            console.log(' 1 massage sent ');
            
        }         
    
    });

    client.on('message', message => {
        console.log(message.body);
    });

    client.on('message', message => { 

        message.reply('osman');
        
    });

    client.initialize();
    
    res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});