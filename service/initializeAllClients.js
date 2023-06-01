const whatsappClient = require('./whatsappClient');
const sendWhatsappMassageJob = require('../queue/sendWhatsappMassageJob');
const xlsx = require("xlsx");
const Instance = require("../models/instance");

function initializeAllClients(app){

    Instance.findAll({
        where: {
        authenticated: true,
        },
    })
    .then((instances) => {
        instances.forEach((instance) => {
    
            const whatsapp = whatsappClient.creatWhatsappClient(instance.name , instance.user_id );
    
            const whatsappMassageQueue = sendWhatsappMassageJob.createSendMassageQueue( whatsapp , instance.name );
            
            whatsapp.on("ready", (session) => {

                console.log(`Client ${instance.name} is ready!`);

                console.log(whatsapp.info);
        
            
                app.post(`/createCampaign/${instance.name}`, (req, res) => {
            
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
                
                                console.log(media);
                    
                                data = { chatId: phoneNumber, media: media };
                    
                                whatsappMassageQueue.add("massage", JSON.stringify(data) , { delay: i * 10000 });
                    
                            }
                      
                        }
                    }
            
                    res.send("campgian created!");
            
                });

                app.post(`/sendWhatsAppMessage/${req.params.instance}`, (req, res) => {
  
        
                    console.log(req.body);
                      
                    if(Array.isArray(req.body)){
            
                        for (let i = 0; i < req.body.length; i++) {
              
                            let nestedArray = req.body[i];
              
                            let phoneNumber = nestedArray.chatID;

                            console.log(phoneNumber);

                            let chatID = phoneNumber.replace(/\+/g, "") + "@c.us";
              
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
            
        });
    })
    .catch((error) => {
        // Handle any errors
    });

}


module.exports = {
    initializeAllClients:initializeAllClients
};

