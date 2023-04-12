const express = require("express");
const WebSocket = require("ws");
const Queue = require("bull");
const Instance = require("./models/instance");
const bodyParser = require('body-parser');

const qrcode = require("qrcode");


const fs = require("fs");
const xlsx = require("xlsx");
const { Client, LocalAuth } = require("whatsapp-web.js");

const wss = new WebSocket.Server({ port: 8080 });

websocktClients = [];

wss.on("connection", (ws, req) => {
  console.log("WebSocket connected");
  websocktClients.push(ws);
});

const app = express();

app.use(bodyParser.json())

app.get("/createClient/:instance", (req, res) => {

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
      const text = req.body.text ;

      for (let i = range.s.r; i <= range.e.r; i++) {

        console.log("for loop");

        const cell = sheet[xlsx.utils.encode_cell({ r: i, c: 1 })];

        if (cell) {
          console.log(cell.v);

          var phoneNumber = cell.v.toString().replace(/\+/g, "") + "@c.us";
          if (i == range.e.r) {
            data = { chatId: phoneNumber, text: text, destroy: true };
          } else {
            data = { chatId: phoneNumber, text: text, destroy: false };
          }

          whatsappMassageQueue.add("emails", data, { delay: i * 1000 });
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
    authStrategy: new LocalAuth({ clientId: req.params.instance }),
  });

  client.on("message", (message) => {
    console.log(message.body);
  });

  client.on("authenticated", (message) => {
    
    console.log(`authentication`);

    Instance.create({
      name: req.params.instance,
      status: true,
      user_id: 2 ,
      authenticated: true,
      number: "01250142991",
    }).then((user) => {

    });

    websockt({ type: "authenticated" });
  });

  client.on("auth_failure", (message) => {
    console.log(`auth_failure `);
  });

  client.on("disconnected", (message) => {
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

    console.log("job start");

    console.log(job.data.chatId);
    
    return whatsappClient.sendMessage(job.data.chatId, job.data.text);

  });

  return whatsappMassageQueue;
}
