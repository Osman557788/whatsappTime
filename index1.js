const express = require("express");

const initializeAllClients = require("./service/initializeAllClients");

const bodyParser = require('body-parser');

const app = express();


const router = require('./router1');

app.use(bodyParser.json());

app.use('/instance', router); // Mount the router at the '/api' base path


app.listen(3000, () => {
    console.log("App listening on port 3000!");
});


initializeAllClients.initializeAllClients(app);



