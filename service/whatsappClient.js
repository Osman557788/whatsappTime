
const { Client, LocalAuth , MessageMedia} = require("whatsapp-web.js");
const qrcode = require("qrcode");
const fs = require("fs");
const Instance = require("../models/instance");
const websocketClients = require("./websocketServer");


function creatWhatsappClient(instanceName,userId) {

    const client = new Client({
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
  
      qrMaxRetries:3, 
  
      takeoverTimeoutMs:15000,
  
      authStrategy: new LocalAuth({ clientId: instanceName }),

    });
  
    client.on("message", (message) => {
      console.log(message.body);
    });
  
    client.on("authenticated", (message) => {
      Instance.findOrCreate({
        where: { name: instanceName }, // search for a user with name 'John Doe'
        defaults: { 
          status: true,
          user_id:userId ,
          authenticated: true,
          number: "01250142991",
  
        } // if user not found, create a new user with age 30
      }).then(([instance, created]) => {
        if (created) {
      
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
  
      const authData = {
        type: "authenticated",
        InstanceName: instanceName,
      };
  
      sendToWebsocktClient(instanceName,JSON.stringify(authData));
  
    });
  
  
    client.on("disconnected", (message) => {
  
      Instance.findOne({ where: { name:instanceName } })
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
  
      const directoryPath = `./.wwebjs_auth/session-${instanceName}`
  
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
      fs.writeFile(`../public/whatsappQrcode/${instanceName}.png`,buffer,(err) => {
  
        if (err) throw err;
  
        console.log("QR code saved to qrcode.png");
  
      });
  
      var QrCodeImage = `whatsappQrcode/${instanceName}.png`;
  
      const data = {
        type: "qrcode",
        InstanceName: instanceName,
        imageSrc: QrCodeImage,
      };
  
      sendToWebsocktClient(instanceName,JSON.stringify(data));
  
    });
  
    return client;
}

function sendToWebsocktClient(clientId, data) {
  // Find the client connection in the clients map
  const socktClient = websocketClients.get(clientId);

  if (socktClient) {
    // Send the data to the specific client
    socktClient.send(data);
  }
}

module.exports = {
    creatWhatsappClient: creatWhatsappClient
};