const express = require('express');
const router = express.Router();
const controller = require('./controllers/InstanceController');

router.get('/', controller['index']);
router.get('/createClient/:instance/:userId', controller['create']);
router.put('/:id', controller['update']);
router.delete('/:id', controller['delete']);

module.exports = router;