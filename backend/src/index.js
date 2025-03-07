const express = require('express');
const restApi = require('./api/rest');
const wsStream = require('./websocket/ws_stream'); // Modification du nom d'import
const websocketServer = require('./websocket/websocket_server'); // Importez le serveur WebSocket

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/serverTime', async (req, res) => {
  try {
    const serverTime = await restApi.getServerTime();
    res.json({ serverTime });
  } catch (error) {
    res.status(500).json({ error: 'Impossible de récupérer le temps serveur' });
  }
});

// Démarrage du WebSocket Server (attaché au serveur HTTP Express)
const wss = websocketServer(app.listen(port, () => { // Démarrage du serveur HTTP et attachement du WS
  console.log(`Serveur backend actif sur http://localhost:${port}`);
  console.log('WebSocket Server Backend démarré');
}));

// Gestion du WebSocket AggTrade (modifié pour envoyer les données au WebSocket Server)
let aggTradeWebSocket = null;

app.get('/ws/start', (req, res) => {
  const symbol = 'BTCUSDT';

  if (!aggTradeWebSocket) {
    aggTradeWebSocket = wsStream.subscribeToAggTradeStream(symbol, (data) => {
      console.log('**[BACKEND LOG]** Données AggTrade reçues de Binance:', data); // LOG IMPORTANT - RECEPTION DE BINANCE

      // **NOUVEAU : Envoyer les données à TOUS les clients frontend connectés via WebSocket**
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          console.log('**[BACKEND LOG]** Envoi des données AggTrade au Frontend:', data); // LOG IMPORTANT - ENVOI AU FRONTEND
          client.send(JSON.stringify(data));
        } else {
          console.log('**[BACKEND LOG]** Client WebSocket non prêt pour l\'envoi.'); // Log si le client n'est pas prêt
        }
      });
    });
  }

  res.json({
    message: `Stream AggTrade démarré pour ${symbol}`,
    symbol: symbol
  });
});

app.get('/ws/stop', (req, res) => {
  if (aggTradeWebSocket) {
    aggTradeWebSocket(); // Appel de la fonction de fermeture
    aggTradeWebSocket = null;
  }
  res.json({ message: 'Stream arrêté' });
});
  
  
