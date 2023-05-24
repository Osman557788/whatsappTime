const WebSocket = require('ws');
const fs = require('fs');
const url = require("url");

const wss = new WebSocket.Server({ port: 8080 });

// Maintain a map of connected clients
const websocktClients = new Map();


wss.on("connection", (ws, req) => {
  const queryParams = url.parse(req.url, true).query;
  const clientId = queryParams.clientId;
  console.log(`WebSocket connected ${clientId}`);
  websocktClients.set(clientId, ws);

  ws.on('close', () => {
    // Remove the client connection from the clients map
    websocktClients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });

});


module.exports = websocktClients;