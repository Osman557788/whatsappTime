const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {

  const channel = new URL(req.url, 'http://localhost:8080').searchParams.get('channel');

  console.log(`WebSocket connected to channel ${channel}`);  

  ws.on('close', (message) => {
    console.log(`connection closed`);
  });
  

});
