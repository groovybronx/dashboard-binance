const express = require('express');
const restApi = require('./api/rest');
const wsStream = require('./websocket/ws_stream'); // Modification du nom d'import

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

// Gestion du WebSocket AggTrade
let aggTradeWebSocket = null;

app.get('/ws/start', (req, res) => {
  const symbol = 'BTCUSDT';
  
  if (!aggTradeWebSocket) {
    aggTradeWebSocket = wsStream.subscribeToAggTradeStream(symbol, (data) => {
      console.log('Nouveau trade:', data);
      
      // **NOUVEAU : Envoyer les données à TOUS les clients frontend connectés via WebSocket**
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) { // Vérifier que la connexion est ouverte
          console.log('**[BACKEND LOG]** Envoi des données AggTrade au Frontend:', data); // LOG IMPORTANT - ENVOI AU FRONTEND
          client.send(JSON.stringify(data)); // Convertir les données en JSON et les envoyer
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
    aggTradeWebSocket.close(); // Fermeture propre du stream
    aggTradeWebSocket = null;
  }
  
  res.json({ 
    message: 'Stream AggTrade arrêté',
    status: 'success'
  });
});

app.listen(port, () => {
  console.log(`Serveur backend actif sur http://localhost:${port}`);
});