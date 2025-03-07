const express = require('express');
const restApi = require('./api/rest');
const wsStream = require('./websocket/ws_stream');
const websocketServer = require('./websocket/websocket_server');
const WebSocket = require('ws'); // Importez WebSocket pour gérer les états de connexion

const app = express();
const port = process.env.PORT || 3000;

// Démarrage du serveur HTTP
const server = app.listen(port, () => {
  console.log(`Serveur backend actif sur http://localhost:${port}`);
});

// Démarrage du serveur WebSocket
const wss = websocketServer(server);

// Route pour récupérer le temps serveur
app.get('/api/serverTime', async (req, res) => {
  try {
    const serverTime = await restApi.getServerTime();
    res.json({ serverTime });
  } catch (error) {
    res.status(500).json({ error: 'Impossible de récupérer le temps serveur' });
  }
});

// Gestion du WebSocket AggTrade
let aggTradeWebSocket = null;

app.get('/ws/start', (req, res) => {
  const symbol = 'BTCUSDT';

  if (!aggTradeWebSocket) {
    aggTradeWebSocket = wsStream.subscribeToAggTradeStream(symbol, (data) => {
      console.log('**[BACKEND LOG]** Données AggTrade reçues de Binance:', data);

      // Envoyer les données à TOUS les clients frontend connectés via WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) { // Vérifier que la connexion est ouverte
          console.log('**[BACKEND LOG]** Envoi des données AggTrade au Frontend:', data);
          client.send(JSON.stringify(data)); // Convertir les données en JSON et les envoyer
        } else {
          console.log('**[BACKEND LOG]** Client WebSocket non prêt pour l\'envoi.');
        }
      });
    });
  }

  res.json({
    message: `Stream AggTrade démarré pour ${symbol}`,
    symbol: symbol,
  });
});

app.get('/ws/stop', (req, res) => {
  if (aggTradeWebSocket) {
    aggTradeWebSocket(); // Appeler la fonction de fermeture retournée par wsStream.subscribeToAggTradeStream
    aggTradeWebSocket = null;
  }
  res.json({ message: 'Stream AggTrade arrêté' });
});