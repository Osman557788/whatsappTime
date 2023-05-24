const express = require("express");

const bodyParser = require('body-parser');

const app = express();


const router = require('./router');

app.use(bodyParser.json());

app.use('/instance', router); // Mount the router at the '/api' base path


app.listen(3000, () => {
    console.log("App listening on port 3000!");
});



// function creatClietn(req){

//     console.log(req.params.instance);

//     const client = new Client({
//         authStrategy: new LocalAuth({ clientId:req.params.instance }),
//     });

//     client.on("message", (message) => {
//         console.log(message.body);
//     });
   
//     client.on("authenticated", (message) => {
//         console.log(`authentication`) ;
//     });
//     client.on("auth_failure", (message) => {
//         console.log(`auth_failure `) ;
//     });
    
//     client.on("disconnected", (message) => {
//         console.log(`disconnected`) ;
//     });

//     client.on("qr", async (qr) => {
//         // Generate QR code as a data URI
//         const qrCodeDataURI = await qrcode.toDataURL(qr);

//         // Extract base64-encoded data from data URI
//         const base64Data = qrCodeDataURI.split(",")[1];

//         // Convert base64 data to a buffer
//         const buffer = Buffer.from(base64Data, "base64");

//         // Save buffer to a file
//         fs.writeFile("../public/whatsappQrcode/qrcode.png", buffer, (err) => {
//             if (err) throw err;
//             console.log("QR code saved to qrcode.png");
//         });

//         websockt();

//     });

//     return client ;
// }

// function websockt(){

//     const data = { type: 'qrcode', imageSrc: 'http://localhost:8000/whatsappQrcode/qrcode.png' };

//     const jsonData = JSON.stringify(data);

//     websocktClients.forEach((client) => {

//         client.send(jsonData);
//     });
// }

// function createQueue(whatsappClient){

//     const whatsappMassageQueue = new Queue('emails',{  removeOnComplete: true,
//         removeOnFail: true, });
    
    
//     whatsappMassageQueue.on('completed', (job) => {
//         console.log(`Job ${job.data.chatId} has completed`);
//     })
    
//     whatsappMassageQueue.on('failed', (job, err) => {
//         console.log(`Job ${job.data.chatId} has failed with ${err.message}`);
//     });

//     whatsappMassageQueue.process('emails',(job)=> {

//         console.log('job start'); 
//         console.log(job.data.chatId); 

//         // if(job.data.destroy){

//         //     // whatsappClient.destroy();

//         //     console.log("client closed");

//         //     // setTimeout(async () => {
//         //     //     await whatsappClient.destroy();
//         //     //     console.log("client closed");
//         //     // }, 1000);
//         // }

//         return whatsappClient.sendMessage(job.data.chatId, job.data.text); 
//     });

//     return whatsappMassageQueue ;
// }


