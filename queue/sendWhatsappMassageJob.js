const Queue = require('bull');


const whatsappMassageQueue = new Queue('emails',{  removeOnComplete: true,
    removeOnFail: true, });


whatsappMassageQueue.on('completed', (job) => {
    console.log(`Job ${job.data.chatId} has completed`);
})

whatsappMassageQueue.on('failed', (job, err) => {
    console.log(`Job ${job.data.chatId} has failed with ${err.message}`);
});



module.exports = whatsappMassageQueue;