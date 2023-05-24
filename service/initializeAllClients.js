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

