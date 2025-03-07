<template>
  <div id="app">
    <h1>Dashboard Binance</h1>
    <ConnectionStatus
      :restStatus="connectionStatuses.restStatus"
      :wsApiStatus="connectionStatuses.wsApiStatus"
      :wsStreamStatus="connectionStatuses.wsStreamStatus"
    />
    <DataDisplay :data="aggTradeData" />
  </div>
</template>

<script>
import DataDisplay from './components/DataDisplay.vue';
import ConnectionStatus from './components/ConnectionStatus.vue';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    DataDisplay,
    ConnectionStatus
  },
  data() {
    return {
      connectionStatuses: {
        restStatus: 'En cours...',
        wsApiStatus: 'Non connecté',
        wsStreamStatus: 'Non connecté'
      },
      aggTradeData: null,
      websocket: null
    }
  },
  mounted() {
    this.checkServerTime();
    this.startWebsockets();
    this.setupWebSocketConnection();
  },
  methods: {
    async checkServerTime() {
      try {
        await axios.get('/api/serverTime');
        this.connectionStatuses.restStatus = 'Connecté';
      } catch (error) {
        console.error('Erreur de connexion à l\'API REST:', error);
        this.connectionStatuses.restStatus = 'Erreur';
      }
    },
    startWebsockets() {
      axios.get('/ws/start')
        .then(response => {
          console.log(response.data.message);
          this.connectionStatuses.wsApiStatus = 'Démarré (Backend Stream)';
          this.connectionStatuses.wsStreamStatus = 'Connecté (Backend Stream)';
        })
        .catch(error => {
          console.error('Erreur démarrage WebSockets:', error);
          this.connectionStatuses.wsApiStatus = 'Erreur démarrage';
          this.connectionStatuses.wsStreamStatus = 'Erreur démarrage';
        });
    },
    setupWebSocketConnection() {
      const websocketURL = 'ws://localhost:3000';

      this.websocket = new WebSocket(websocketURL);

      this.websocket.onopen = () => {
        console.log('**[FRONTEND LOG]** WebSocket Frontend connecté au Backend Server'); // LOG IMPORTANT - CONNEXION OUVERTE
        this.connectionStatuses.wsApiStatus = 'Connecté (Frontend <-> Backend)';
      };

      this.websocket.onmessage = (event) => {
        console.log('**[FRONTEND LOG]** Données WebSocket brutes reçues du Backend:', event.data); // LOG IMPORTANT - RECEPTION BRUTE

        try {
          const data = JSON.parse(event.data);
          console.log('**[FRONTEND LOG]** Données WebSocket parsées (JSON):', data); // LOG IMPORTANT - DONNEES PARSEES
          this.aggTradeData = data;
        } catch (error) {
          console.error('**[FRONTEND LOG]** Erreur lors du parsing JSON des données WebSocket:', error); // LOG IMPORTANT - ERREUR DE PARSING
          console.error('Données brutes non parsables:', event.data); // Afficher les données brutes qui posent problème
        }
      };

      this.websocket.onclose = () => {
        console.log('WebSocket Frontend déconnecté du Backend Server');
        this.connectionStatuses.wsApiStatus = 'Déconnecté (Frontend <-> Backend)';
        this.websocket = null;
      };

      this.websocket.onerror = (error) => {
        console.error('**[FRONTEND LOG]** Erreur WebSocket Frontend:', error); // LOG IMPORTANT - ERREUR WS FRONTEND
        this.connectionStatuses.wsApiStatus = 'Erreur (Frontend <-> Backend)';
      };
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3d49;
  margin-top: 60px;
}
</style>