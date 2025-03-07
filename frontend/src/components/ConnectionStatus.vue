<template>
  <div>
    <h2>Statut des Connexions</h2>
    <p>
      API REST:
      <span :class="{ connected: restConnected, disconnected: !restConnected }">{{
        restStatus
      }}</span>
    </p>
    <p>
      WebSocket API:
      <span :class="{ connected: wsApiConnected, disconnected: !wsApiConnected }">{{
        wsApiStatus
      }}</span>
    </p>
    <p>
      WebSocket Stream:
      <span :class="{ connected: wsStreamConnected, disconnected: !wsStreamConnected }">{{
        wsStreamStatus
      }}</span>
    </p>
  </div>
</template>

<script>
import axios from 'axios' // Importez axios

export default {
  name: 'ConnectionStatus',
  data() {
    return {
      restConnected: false,
      wsApiConnected: false,
      wsStreamConnected: false,
      restStatus: 'Non connecté',
      wsApiStatus: 'Non connecté',
      wsStreamStatus: 'Non connecté',
    }
  },
  mounted() {
    this.checkRestConnection() // Appeler la fonction de vérification à la montée du composant
  },
  methods: {
    checkRestConnection() {
      this.updateRestStatus(false, 'En cours...') // Initialiser le statut à "En cours..."
      axios
        .get('/api/serverTime') // Appel à l'API REST du backend
        .then((response) => {
          if (response.status === 200) {
            this.updateRestStatus(true, 'Connecté') // Mise à jour si la réponse est OK
          } else {
            this.updateRestStatus(false, 'Erreur (statut ' + response.status + ')') // Erreur si statut différent de 200
          }
        })
        .catch((error) => {
          console.error("Erreur de connexion à l'API REST:", error)
          this.updateRestStatus(false, 'Erreur') // Erreur en cas de problème de requête
        })
    },
    updateRestStatus(isConnected, message) {
      this.restConnected = isConnected
      this.restStatus = message
    },
    updateWsApiStatus(isConnected, message) {
      this.wsApiConnected = isConnected
      this.wsApiStatus = message
    },
    updateWsStreamStatus(isConnected, message) {
      this.wsStreamConnected = isConnected
      this.wsStreamStatus = message
    },
  },
}
</script>

<style scoped>
.connected {
  color: green;
}
.disconnected {
  color: red;
}
/* Styles CSS si nécessaire */
</style>
