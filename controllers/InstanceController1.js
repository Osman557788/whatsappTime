const whatsappClient = require('../service/whatsappClient');
const clientsSession = require('../service/sessionClients');
const sendWhatsappMassageJob = require('../queue/sendWhatsappMassageJob');
const xlsx = require("xlsx");
const Instance = require("../models/instance");


const index = (req, res) => {
    res.send("hello mustafa");
};
  
const create = (req, res) => {
    
  const whatsapp = whatsappClient.creatWhatsappClient(req.params.instance , req.params.userId );

  

  const instance = req.params.instance ;
  
  whatsapp.on("ready", (session) => {

    const whatsappMassageQueue = sendWhatsappMassageJob.createSendMassageQueue( whatsapp , instance);

    if(!clientsSession.has(instance)){

      clientsSession.set(instance , whatsappMassageQueue );

    };

    console.log(`Client ${req.params.instance} is ready!`);

    console.log(whatsapp.info);

    
    app.post(`/sendWhatsAppMessage/${req.params.instance}`, (req, res) => {

      
      console.log(req.body);
        
      if(Array.isArray(req.body)){
          
        for (let i = 0; i < req.body.length; i++) {

          let nestedArray = req.body[i];

          console.log(nestedArray);

          let chatID = nestedArray.chatId.toString().replace(/\+/g, "") + "@c.us";

          if(nestedArray.type == 'text'){
          
              const text = nestedArray.text ;
  
              data = { chatId: chatID, text: text };
              console.log(data)
              whatsappMassageQueue.add("massage", data , { delay: i * 10000 });

          }

          if(nestedArray.type == 'media' ){

              const media = nestedArray.media ;
  
              data = { chatId: chatID , media: media };

              console.log(data)
  
              whatsappMassageQueue.add("massage", data , { delay: i * 10000 });

          } 
        }
      }

      res.send("massage sended !");

    });
      
  });

  whatsapp.initialize();

  res.send("hello ali ");

};

const createCampaign = (req, res) => {

  const instance = req.params.instance;

  if(clientsSession.has(instance)){

    const whatsappMassageQueue = clientsSession.get(instance);

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

          whatsappMassageQueue.add("massage", data , { delay: i * 10000 });

        }

        if(req.body.media ){

          console.log('image');
          
          const media = req.body.media ;

          for (let i = 0; i < media.length; i++) {

            console.log(media[i]);

            let image = media[i];


            data = { chatId: phoneNumber, media: image };

            whatsappMassageQueue.add("massage", data , { delay: i * 10000 });


          }
        }
        
      }
    }

    res.send("campgian created!");

  }; 
};

const sendWhatsAppMessage = (req, res) => {

  const instance = req.params.instance;

  if(clientsSession.has(instance)){

    const whatsappMassageQueue = clientsSession.get(instance);

    console.log(req.body);
        
    if(Array.isArray(req.body)){
        
      for (let i = 0; i < req.body.length; i++) {

        let nestedArray = req.body[i];

        console.log(nestedArray);

        let chatID = nestedArray.chatId.toString().replace(/\+/g, "") + "@c.us";

        if(nestedArray.type == 'text'){
        
            const text = nestedArray.text ;

            data = { chatId: chatID, text: text };
            console.log(data)
            whatsappMassageQueue.add("massage", data , { delay: i * 10000 });

        }

        if(nestedArray.type == 'media' ){

            const media = nestedArray.media ;

            data = { chatId: chatID , media: media };

            console.log(data)

            whatsappMassageQueue.add("massage", data , { delay: i * 10000 });

        } 
      }
    }

    res.send("massage sended !");

  };

};

const remove = (req, res) => {

};

module.exports = {
index,
create,
createCampaign,
sendWhatsAppMessage,
delete: remove // 'delete' is a reserved keyword, so use an alternative name like 'remove'
};
  