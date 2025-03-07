const WebSocket = require('ws');

const WebSocketServer = WebSocket.Server;

module.exports = (server) => { // Prend le serveur HTTP Express en argument
  const wss = new WebSocketServer({ server }); // Attache le serveur WebSocket au serveur HTTP

  wss.on('connection', ws => {
    console.log('Client Frontend connecté au WebSocket Server');

    ws.on('message', message => {
      console.log('Message reçu du Frontend:', message); // Optionnel: si le frontend envoie des messages
      // Ici, vous pourriez gérer les messages reçus du frontend si nécessaire
    });

    ws.on('close', () => {
      console.log('Client Frontend déconnecté du WebSocket Server');
    });

    ws.on('error', error => {
      console.error('Erreur WebSocket côté serveur:', error);
    });
  });

  console.log('WebSocket Server Backend démarré');
  return wss; // Retourne l'instance du serveur WebSocket si vous en avez besoin ailleurs
};