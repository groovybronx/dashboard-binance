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
      aggTradeData: null, // Pour stocker les données AggTrade reçues du WebSocket
      websocket: null // Instance WebSocket Frontend -> Backend
    }
  },
  mounted() {
    this.checkServerTime();
    this.startWebsockets();
    this.setupWebSocketConnection(); // Établir la connexion WebSocket Frontend -> Backend
  },
  methods: {
    async checkServerTime() {
      try {
        const response = await axios.get('/api/serverTime');        if (response.status === 200) {
                  console.log('Connexion à l\'API REST réussie');
                } else {
                  console.error('Erreur de connexion à l\'API REST: Statut', response.status);
                }
        
        this.connectionStatuses.restStatus = 'Connecté';
      } catch (error) {
        console.error('Erreur de connexion à l\'API REST:', error);
        this.connectionStatuses.restStatus = 'Erreur';
      }
    },
    startWebsockets() {
      axios.get('/ws/start') // Démarre le stream Binance côté backend
        .then(response => {
          console.log(response.data.message);
          this.connectionStatuses.wsApiStatus = 'Démarré (Backend Stream)'; // Adapter statut
          this.connectionStatuses.wsStreamStatus = 'Connecté (Backend Stream)'; // Adapter statut
        })
        .catch(error => {
          console.error('Erreur démarrage WebSockets:', error);
          this.connectionStatuses.wsApiStatus = 'Erreur démarrage';
          this.connectionStatuses.wsStreamStatus = 'Erreur démarrage';
        });
    },
    setupWebSocketConnection() {
      // Adresse WebSocket du backend (à adapter si votre backend est sur un autre port ou hôte)
      const websocketURL = 'ws://localhost:3000'; // Même port que le serveur HTTP Express

      this.websocket = new WebSocket(websocketURL); // Création de l'instance WebSocket

      this.websocket.onopen = () => {
        console.log('WebSocket Frontend connecté au Backend Server');
        this.connectionStatuses.wsApiStatus = 'Connecté (Frontend <-> Backend)'; // Adapter statut
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data); // Parser les données JSON reçues du backend
        console.log('Données WebSocket reçues du Backend:', data); // Log dans la console du frontend (pour vérifier)
        this.aggTradeData = data; // Mettre à jour les données AggTrade pour l'affichage dans DataDisplay
      };

      this.websocket.onclose = () => {
        console.log('WebSocket Frontend déconnecté du Backend Server');
        this.connectionStatuses.wsApiStatus = 'Déconnecté (Frontend <-> Backend)'; // Adapter statut
        this.websocket = null; // Réinitialiser l'instance WebSocket
      };

      this.websocket.onerror = (error) => {
        console.error('Erreur WebSocket Frontend:', error);
        this.connectionStatuses.wsApiStatus = 'Erreur (Frontend <-> Backend)'; // Adapter statut
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
