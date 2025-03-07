const { Spot } = require('@binance/connector');
const config = require('../config/config');

// Configuration pour le TESTNET (URL de base du testnet)
const baseURLTestnet = 'https://testnet.binance.vision'; // URL de base REST du testnet

const client = new Spot(config.apiKey, config.apiSecret, { baseURL: baseURLTestnet }); // Option baseURL ajoutée

module.exports = {
  getServerTime: async () => {
    try {
      const response = await client.time();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du temps serveur (Testnet):', error);
      throw error;
    }
  },
  // ... (vos autres fonctions REST)
};