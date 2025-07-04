// history.js - Module de gestion de l'historique des requêtes

import { STORAGE_KEYS, MAX_HISTORY_ITEMS } from './constants.js';

/**
 * Classe pour gérer l'historique des requêtes et réponses
 */
class HistoryManager {
  /**
   * Récupère l'historique complet des requêtes
   * @returns {Promise<Array>} Tableau d'objets d'historique
   */
  static async getHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.HISTORY], (result) => {
        const history = result[STORAGE_KEYS.HISTORY] || [];
        resolve(history);
      });
    });
  }

  /**
   * Ajoute une nouvelle entrée à l'historique
   * @param {Object} entry - Entrée d'historique à ajouter
   * @param {string} entry.query - Texte de la requête
   * @param {string} entry.prompt - Prompt utilisé
   * @param {string} entry.response - Réponse reçue
   * @param {string} entry.model - Modèle d'IA utilisé
   * @param {Date} entry.timestamp - Date et heure de la requête
   * @returns {Promise<void>}
   */
  static async addToHistory(entry) {
    // S'assurer que l'entrée a un timestamp
    if (!entry.timestamp) {
      entry.timestamp = new Date().toISOString();
    }

    const history = await this.getHistory();
    
    // Ajouter la nouvelle entrée au début
    history.unshift(entry);
    
    // Limiter la taille de l'historique
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    // Sauvegarder l'historique mis à jour
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: trimmedHistory }, resolve);
    });
  }

  /**
   * Efface tout l'historique
   * @returns {Promise<void>}
   */
  static async clearHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(STORAGE_KEYS.HISTORY, resolve);
    });
  }

  /**
   * Exporte l'historique au format JSON
   * @returns {Promise<string>} Chaîne JSON de l'historique
   */
  static async exportHistoryAsJSON() {
    const history = await this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Exporte l'historique au format CSV
   * @returns {Promise<string>} Chaîne CSV de l'historique
   */
  static async exportHistoryAsCSV() {
    const history = await this.getHistory();
    
    // Entêtes CSV
    const headers = ['Date', 'Modèle', 'Requête', 'Prompt', 'Réponse'];
    
    // Lignes de données
    const rows = history.map(entry => [
      new Date(entry.timestamp).toLocaleString(),
      entry.model,
      `"${entry.query.replace(/"/g, '""')}"`,
      `"${entry.prompt.replace(/"/g, '""')}"`,
      `"${entry.response.replace(/"/g, '""')}"`
    ]);
    
    // Combiner entêtes et lignes
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }

  /**
   * Recherche dans l'historique
   * @param {string} searchTerm - Terme de recherche
   * @returns {Promise<Array>} Résultats de recherche filtrés
   */
  static async searchHistory(searchTerm) {
    if (!searchTerm) return this.getHistory();
    
    const history = await this.getHistory();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return history.filter(entry => 
      entry.query.toLowerCase().includes(lowerSearchTerm) ||
      entry.prompt.toLowerCase().includes(lowerSearchTerm) ||
      entry.response.toLowerCase().includes(lowerSearchTerm)
    );
  }
}

export default HistoryManager;