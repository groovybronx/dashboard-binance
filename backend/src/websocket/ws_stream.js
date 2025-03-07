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
    const closeStream = wsClient.aggTrades(symbol.toLowerCase(), {
      onMessage: (data) => callback(data),
      onOpen: () => {
        console.log('**[WS_STREAM LOG]** WebSocket to Binance OPEN for symbol:', symbol); // Add log in onOpen
      },
      onError: (err) => {
        console.error('**[WS_STREAM LOG]** WebSocket to Binance ERROR for symbol:', symbol, err); // Add log in onError
      }
    });
    return closeStream;
  }
};