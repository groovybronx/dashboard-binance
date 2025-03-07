const { Spot } = require('@binance/connector');
const config = require('../config/config');

const baseURLTestnet = 'https://testnet.binance.vision';
const wsURLTestnet = 'wss://testnet.binance.vision/ws';

const wsClient = new Spot(
  { apiKey: config.apiKey, apiSecret: config.apiSecret },
  { baseURL: baseURLTestnet, wsURL: wsURLTestnet }
);

module.exports = {
  subscribeToAggTradeStream: (symbol, callback) => {
    const ws = wsClient.aggTrades(symbol.toLowerCase(), {
      onMessage: (data) => callback(data),
      onOpen: () => console.log(`WebSocket ouvert pour ${symbol}`),
      onClose: () => console.log(`WebSocket fermé pour ${symbol}`),
      onError: (err) => console.error(`Erreur WebSocket pour ${symbol}:`, err)
    });

    return ws; // Retourne l'objet pour appeler .close() plus tard
  }
};