const Queue = require('bull');


function createSendMassageQueue(whatsappClient, instanceName) {

    const whatsappMassageQueue = new Queue(instanceName, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  
    whatsappMassageQueue.on("completed", (job) => {
      console.log(`Job ${job.data.chatId} has completed`);
    });
  
    whatsappMassageQueue.on("failed", (job, err) => {
      console.log(`Job ${job.data.chatId} has failed with ${err.message}`);
    });
  
    whatsappMassageQueue.process("massage", (job) => {
  
      if (job.data.media) {
        const media = MessageMedia.fromFilePath(
          `../storage/app/${job.data.media}`
        );
  
        whatsappClient.sendMessage(job.data.chatId, media);
      }
  
      if (job.data.text) {
        whatsappClient.sendMessage(job.data.chatId , job.data.text);
      }
  
  
    });
  
    return whatsappMassageQueue;
}


module.exports = {
    createSendMassageQueue:createSendMassageQueue
};