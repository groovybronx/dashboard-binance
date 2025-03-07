const { Spot } = require('@binance/connector');
const config = require('../config/config');
const WebSocket = require('ws'); // Importez la librairie ws



const baseURLTestnet = 'https://testnet.binance.vision'; // URL de base REST du testnet

const client = new Spot(config.apiKey, config.apiSecret, { baseURL: baseURLTestnet }); // Option baseURL ajoutée

module.exports = {
  subscribeToDepth: (symbol, callback) => {
    const ws = new WebSocket('wss://stream.binance.com/ws'); // Connexion WebSocket brute

    ws.onopen = () => {
      console.log(`WebSocket API: Connexion ouverte pour Depth Stream sur ${symbol}`);
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [
          `${symbol.toLowerCase()}@depth`
        ],
        id: 1
      }));
    };

    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.e === 'depthUpdate') { // Vérifiez le type de message pour Depth Update
         callback(message); // Appelez le callback avec les données de profondeur
      } else if (message.result !== null || message.error) { // Gérer les confirmations de subscription et erreurs
        console.log("WebSocket API Message:", message); // Log les messages initiaux et erreurs
      }
    };

    ws.onerror = error => {
      console.error(`WebSocket API Error pour Depth Stream sur ${symbol}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket API: Connexion fermée pour Depth Stream sur ${symbol}`);
    };

    return ws; // Retournez l'instance WebSocket pour pouvoir la fermer plus tard si nécessaire
  },
  // Ajoutez d'autres fonctions pour souscrire à d'autres endpoints WebSocket API
};