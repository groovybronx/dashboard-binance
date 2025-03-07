<template>
  <div>
    <h2>Données Aggregated Trades (BTCUSDT)</h2>
    <div v-if="data">
      <p>Symbole: {{ data.s }}</p>
      <p>Prix: {{ data.p }}</p>
      <p>Quantité: {{ data.q }}</p>
      <p>Timestamp (Trade): {{ new Date(data.T).toLocaleTimeString() }}</p> 
      <p>Vendeur est Market Maker: {{ data.m ? 'Oui' : 'Non' }}</p>
      <pre v-if="$root.$data.debugMode">{{ data }}</pre> 
    </div>
    <div v-else>
      <p>En attente de données AggTrade en temps réel...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataDisplay',
  props: {
    data: {
      type: Object , // Ou Array selon le type de données que vous recevrez
      default: null,
    },
  },
  // Dans les prochaines étapes, nous ajouterons la logique pour recevoir et mettre à jour les données ici
}
</script>

<style scoped>
/* Styles CSS si nécessaire */
</style>
