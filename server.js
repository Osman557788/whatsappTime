const express = require("express");
const WebSocket = require('ws');
const Queue = require('bull');
// const qrcode = require("qrcode");
const qrcode = require('qrcode-terminal');
const fs = require("fs");
const xlsx = require("xlsx");
const { Client, LocalAuth } = require("whatsapp-web.js");

const wss = new WebSocket.Server({ port: 8080 });

websocktClients = [];


wss.on('connection', (ws, req) => {

    console.log('WebSocket connected');
    websocktClients.push(ws);
    
});

const app = express();

app.get("/:instance", (req, res) => {

    const whatsappClient = creatClietn(req)

    const whatsappMassageQueue = createQueue(whatsappClient)

    console.log("done");

    whatsappClient.on("ready", (session) => {

        console.log("Client is ready!");
        const workbook = xlsx.readFile("example.xlsx");
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const range = xlsx.utils.decode_range(sheet["!ref"]);
        const text = "رمضان كريم كل عام وانتم بخير";

        for (let i = range.s.r; i <= range.e.r; i++) {

            console.log('for loop');

            const cell = sheet[xlsx.utils.encode_cell({ r: i, c: 1 })];

            if (cell) {
                console.log(cell.v);

                var phoneNumber = cell.v.toString().replace(/\+/g, "") + "@c.us";
                if(i == range.e.r){
                    data = { chatId: phoneNumber, text: text , destroy: true }
                }else{
                    data = { chatId: phoneNumber, text: text , destroy: false }
                }

                whatsappMassageQueue.add(
                    'emails',
                    data ,
                    { delay: i * 1000  }
                );
            }
        }
    });

    whatsappClient.initialize();

    // function restartClient() {
    //     whatsappClient.destroy();
    //     whatsappClient = new Client();
    //     whatsappClient.initialize();
    // }
    res.send("Hello World!");
});


app.listen(3000, () => {
    console.log("App listening on port 3000!");
});


function creatClietn(req){

    const client = new Client({
        puppeteer: {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']},
        authStrategy: new LocalAuth({  clientId: req.params.instance }),
    });

    client.on("message", (message) => {
        console.log(message.body);
    });
   
    client.on("authenticated", (message) => {
        console.log(`authentication`) ;
    });
    client.on("auth_failure", (message) => {
        console.log(`auth_failure `) ;
    });
    
    client.on("disconnected", (message) => {
        console.log(`disconnected`) ;
    });

    client.on('qr', qr => {
        console.log("qr");
        qrcode.generate(qr, {small: true});
    });
    

    // client.on("qr", async (qr) => {
    //     // Generate QR code as a data URI
    //     const qrCodeDataURI = await qrcode.toDataURL(qr);

    //     // Extract base64-encoded data from data URI
    //     const base64Data = qrCodeDataURI.split(",")[1];

    //     // Convert base64 data to a buffer
    //     const buffer = Buffer.from(base64Data, "base64");

    //     // Save buffer to a file
    //     fs.writeFile("../public/whatsappQrcode/qrcode.png", buffer, (err) => {
    //         if (err) throw err;
    //         console.log("QR code saved to qrcode.png");
    //     });

    //     websockt();

    // });

    return client ;
}

function websockt(){

    const data = { type: 'qrcode', imageSrc: 'http://localhost:8000/whatsappQrcode/qrcode.png' };

    const jsonData = JSON.stringify(data);

    websocktClients.forEach((client) => {

        client.send(jsonData);
    });
}

function createQueue(whatsappClient){

    const whatsappMassageQueue = new Queue('emails',{  removeOnComplete: true,
        removeOnFail: true, });
    
    
    whatsappMassageQueue.on('completed', (job) => {
        console.log(`Job ${job.data.chatId} has completed`);
    })
    
    whatsappMassageQueue.on('failed', (job, err) => {
        console.log(`Job ${job.data.chatId} has failed with ${err.message}`);
    });

    whatsappMassageQueue.process('emails',(job)=> {

        console.log('job start'); 
        
        console.log(job.data.chatId); 

        // if(job.data.destroy){

        //     // whatsappClient.destroy();

        //     console.log("client closed");

        //     // setTimeout(async () => {
        //     //     await whatsappClient.destroy();
        //     //     console.log("client closed");
        //     // }, 1000);
        // }

        return whatsappClient.sendMessage(job.data.chatId, job.data.text); 
    });

    return whatsappMassageQueue ;
}


