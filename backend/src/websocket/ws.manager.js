const wsStream = require('./ws_stream');
const WebSocket = require('ws');

class WebSocketManager {
  constructor(wss) {
    this.wss = wss;
    this.aggTradeWebSocket = null;
  }

  startAggTradeStream(symbol) {
    if (!this.aggTradeWebSocket) {
      this.aggTradeWebSocket = wsStream.subscribeToAggTradeStream(symbol, (data) => {
        console.log('**[BACKEND LOG]** Données AggTrade reçues de Binance:', data);

        this.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            console.log('**[BACKEND LOG]** Envoi des données AggTrade au Frontend:', data);
            client.send(JSON.stringify(data));
          }
        });
      });
    }
  }

  stopAggTradeStream() {
    if (this.aggTradeWebSocket) {
      this.aggTradeWebSocket();
      this.aggTradeWebSocket = null;
    }
  }
}

module.exports = WebSocketManager;