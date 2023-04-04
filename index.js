const { Client, LocalAuth } = require('whatsapp-web.js');

// require('dotenv').config();


const qrcode = require('qrcode-terminal');

const client = new Client({

    authStrategy: new LocalAuth({ clientId: "client-one" }) 
});

client.on('ready', (session) => {

    

    console.log("Client is ready!");

    const number = "201150142991";

    const text = "Hey this massage from whatsapp  markting  online chate ";

    const chatId = number + "@c.us";

    const asyncFunction1 = () => {
        return new Promise(resolve => {

            for (let i = 0; i < 10; i++) {
                console.log(i);
                setTimeout(() => {
                    client.sendMessage(chatId, text);
                    console.log(' 1 massage sent ');
                    resolve();
                }, 1000000 * i+1);
            }    
        });
    };

    Promise.all([asyncFunction1()])

    .then(() => {})
    .catch(error => console.error(error));      

});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('message', message => {
	console.log(message.body);
});

    
client.initialize();



    

