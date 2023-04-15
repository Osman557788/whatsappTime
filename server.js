const express = require("express");
const WebSocket = require("ws");
const Queue = require("bull");
const Instance = require("./models/instance");
const bodyParser = require('body-parser');

const qrcode = require("qrcode");


const fs = require("fs");
const xlsx = require("xlsx");
const { Client, LocalAuth , MessageMedia} = require("whatsapp-web.js");

const wss = new WebSocket.Server({ port: 8080 });

websocktClients = [];

wss.on("connection", (ws, req) => {
  console.log("WebSocket connected");
  websocktClients.push(ws);
});

const app = express();

app.use(bodyParser.json())

app.get("/createClient/:instance/:userId", (req, res) => {

  const whatsappClient = creatClietn(req);

  const whatsappMassageQueue = createQueue(whatsappClient);

  console.log("done");

  whatsappClient.on("ready", (session) => {

    console.log(`Client ${req.params.instance} is ready!`);

    app.post(`/createCampaign/${req.params.instance}`, (req, res) => {

      const workbook = xlsx.readFile(`../storage/app/${req.body.excelfile}`);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const range = xlsx.utils.decode_range(sheet["!ref"]);
      

      for (let i = range.s.r; i <= range.e.r; i++) {


        console.log("for loop");


        const cell = sheet[xlsx.utils.encode_cell({ r: i, c: 1 })];

        if (cell) {

          var phoneNumber = cell.v.toString().replace(/\+/g, "") + "@c.us";

          if(req.body.text ){

            const text = req.body.text ;

            data = { chatId: phoneNumber, text: text };

            whatsappMassageQueue.add("emails", data, { delay: i * 1000 });

          }

          if(req.body.media ){

            const media = req.body.media ;

            data = { chatId: phoneNumber, media: media };

            whatsappMassageQueue.add("emails", data, { delay: i * 1000 });

          }

          if(req.body.video ){

            const video = req.body.video ;

            data = { chatId: phoneNumber, video: video };

            whatsappMassageQueue.add("emails", data, { delay: i * 1000 });

          }

          // whatsappMassageQueue.add("emails", data, { delay: i * 1000 });
        }
      }

      res.send("campgian created!");

    });
  });

  whatsappClient.initialize();

  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("App listening on port 3000!");
});

function creatClietn(req) {

  const client = new Client({
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },

    qrMaxRetries:3, 

    takeoverTimeoutMs:15000,

    authStrategy: new LocalAuth({ clientId: req.params.instance }),
  });

  client.on("message", (message) => {
    console.log(message.body);
  });

  client.on("authenticated", (message) => {


    Instance.findOrCreate({
      where: { name: req.params.instance }, // search for a user with name 'John Doe'
      defaults: { 
        status: true,
        user_id:req.params.userId ,
        authenticated: true,
        number: "01250142991",

      } // if user not found, create a new user with age 30
    }).then(([instance, created]) => {
      if (created) {
        // user was created
        console.log('New user created:', instance.toJSON());
      } else {
        // user was found and updated
        instance.authenticated = true;

        instance.save().then(() => {

          console.log('User updated:', instance.toJSON());

        });
      }
    }).catch((error) => {
      console.log('Error occurred:', error);
    });
    
    console.log(`authentication`);

    console.log(client.info);

    // Instance.create({
    //   name: req.params.instance,
    //   status: true,
    //   user_id: req.params.userId ,
    //   authenticated: true,
    //   number: "01250142991",
    // }).then((user) => {

    // });

    websockt({ type: "authenticated" });

  });

  client.on("auth_failure", (message) => {

    Instance.findOne({ where: { name:req.params.instance } })
    .then(instance => {
      if (instance) {
        // if user exists, update the record
        return instance.update({authenticated:true});

      }
    })
    .then(updatedInstance => {
      console.log(updatedInstance);
    })
    .catch(error => {
      console.error(error);
    });

    client.destroy();

    const directoryPath = `./.wwebjs_auth/session-${req.params.instance}`;

    deleteSession(directoryPath)


    console.log(`auth_failure `);

  });

  client.on("disconnected", (message) => {

    Instance.findOne({ where: { name:req.params.instance } })
    .then(instance => {
      if (instance) {
        // if user exists, update the record
        return instance.update({authenticated:false});

      }
    })
    .then(updatedInstance => {
      console.log(updatedInstance);
    })
    .catch(error => {
      console.error(error);
    });

    client.destroy();

    const directoryPath = `./.wwebjs_auth/session-${req.params.instance}`

    deleteSession(directoryPath)

    

    console.log(`disconnected`);

  });

  client.on("change_state", (message) => {
    
    console.log(`change_state`);

    clietn.resetState();

  });

  client.on("qr", async (qr) => {
    // Generate QR code as a data URI
    const qrCodeDataURI = await qrcode.toDataURL(qr);

    // Extract base64-encoded data from data URI
    const base64Data = qrCodeDataURI.split(",")[1];

    // Convert base64 data to a buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Save buffer to a file
    fs.writeFile(`../public/whatsappQrcode/${req.params.instance}.png`,buffer,(err) => {

      if (err) throw err;

      console.log("QR code saved to qrcode.png");

    });

    var QrCodeImage = `whatsappQrcode/${req.params.instance}.png`;

    const data = {
      type: "qrcode",
      InstanceName: req.params.instance,
      imageSrc: QrCodeImage,
    };

    websockt(data);

  });

  return client;
}

function websockt(data) {

  const jsonData = JSON.stringify(data);

  websocktClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  });

}

function createQueue(whatsappClient) {

  const whatsappMassageQueue = new Queue("emails", {
    removeOnComplete: true,
    removeOnFail: true,
  });

  whatsappMassageQueue.on("completed", (job) => {
    console.log(`Job ${job.data.chatId} has completed`);
  });

  whatsappMassageQueue.on("failed", (job, err) => {
    console.log(`Job ${job.data.chatId} has failed with ${err.message}`);
  });

  whatsappMassageQueue.process("emails", (job) => {

    if(job.data.media){

      const media = new MessageMedia( `../storage/app/${job.data.media}` , base64Image);

      whatsappClient.sendMessage(job.data.chatId, media );

    }
    
    if(job.data.text){

      whatsappClient.sendMessage(job.data.chatId, text );

    }

    console.log(job.data.media);
    
    

  });

  return whatsappMassageQueue;
}

function  deleteSession(directoryPath){

  setTimeout(() => {
  
    // Delete directory
    fs.rmdir(directoryPath, { recursive: true }, (err) => {
      if (err) {
        console.error(`Error deleting directory: ${err}`);
      } else {
        console.log('Directory deleted successfully');
      }
    });
  }, 3000); // Wait 5 seconds before deleting the directory

}
