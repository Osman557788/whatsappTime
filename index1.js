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

        const emailQueue = new Queue('emails');

        const sendEmail = () => {
    
            console.log(i);
            setTimeout(() => {
                client.sendMessage(chatId, text);
                console.log(' 1 massage sent ');
                resolve();
            }, 1000000 * i+1);
            console.log('dones');
        };


        emailQueue.process((job) => {
            const { email } = job.data;
            return sendEmail(email);
        });

        console.log("Client is ready!");
    
        const number = "201150142991";
    
        const text = "Hey this massage from whatsapp  markting  online chate ";
    
        const chatId = number + "@c.us";
        
        for (let i = 0; i < 10; i++) {

            const email = `user${i}@example.com`;
            emailQueue.add({ email }); 
        }

        emailQueue
        .on('completed', (job) => {
        console.log(`Job ${job.id} has completed`);
        })
        .on('failed', (job, err) => {
        console.log(`Job ${job.id} has failed with ${err.message}`);
        });
    
        emailQueue.empty().then(() => {
        console.log('Queue is empty');
        process.exit(0);
        });
    
      emailQueue.process((job) => {
        const { email } = job.data;
        return sendEmail(email);
        });
           
    
    });

  res.send('Hello World!');


});



app.listen(3000, () => {
  console.log('App listening on port 3000!');
});