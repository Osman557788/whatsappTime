const express = require('express');
const router = express.Router();
const controller = require('./controllers/InstanceController1');

router.get('/', controller['index']);
router.get('/createClient/:instance/:userId', controller['create']);
router.post('/createCampaign/:instance', controller['createCampaign']);
router.post('/sendWhatsAppMessage/:instance', controller['sendWhatsAppMessage']);
router.put('/:id', controller['update']);
router.delete('/:id', controller['delete']);

module.exports = router;