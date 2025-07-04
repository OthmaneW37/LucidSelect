// custom-prompts.js - Module de gestion des prompts personnalisés

import { STORAGE_KEYS, DEFAULT_PROMPTS } from './constants.js';

/**
 * Classe pour gérer les prompts personnalisés
 */
class CustomPromptManager {
  /**
   * Récupère tous les prompts (par défaut et personnalisés)
   * @returns {Promise<Array>} Tableau de tous les prompts
   */
  static async getAllPrompts() {
    const customPrompts = await this.getCustomPrompts();
    return [...DEFAULT_PROMPTS, ...customPrompts];
  }

  /**
   * Récupère uniquement les prompts personnalisés
   * @returns {Promise<Array>} Tableau des prompts personnalisés
   */
  static async getCustomPrompts() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.CUSTOM_PROMPTS], (result) => {
        const customPrompts = result[STORAGE_KEYS.CUSTOM_PROMPTS] || [];
        resolve(customPrompts);
      });
    });
  }

  /**
   * Ajoute un nouveau prompt personnalisé
   * @param {Object} prompt - Prompt à ajouter
   * @param {string} prompt.name - Nom du prompt
   * @param {string} prompt.template - Modèle de texte du prompt
   * @returns {Promise<string>} ID du nouveau prompt
   */
  static async addCustomPrompt(prompt) {
    const customPrompts = await this.getCustomPrompts();
    
    // Générer un ID unique
    const id = 'custom_' + Date.now();
    
    // Créer le nouveau prompt
    const newPrompt = {
      id,
      name: prompt.name,
      template: prompt.template
    };
    
    // Ajouter à la liste
    customPrompts.push(newPrompt);
    
    // Sauvegarder la liste mise à jour
    await new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_PROMPTS]: customPrompts }, resolve);
    });
    
    return id;
  }

  /**
   * Met à jour un prompt personnalisé existant
   * @param {string} id - ID du prompt à mettre à jour
   * @param {Object} updatedPrompt - Nouvelles valeurs du prompt
   * @returns {Promise<boolean>} Succès de la mise à jour
   */
  static async updateCustomPrompt(id, updatedPrompt) {
    const customPrompts = await this.getCustomPrompts();
    
    // Trouver l'index du prompt à mettre à jour
    const index = customPrompts.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    // Mettre à jour le prompt
    customPrompts[index] = {
      ...customPrompts[index],
      name: updatedPrompt.name || customPrompts[index].name,
      template: updatedPrompt.template || customPrompts[index].template
    };
    
    // Sauvegarder la liste mise à jour
    await new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_PROMPTS]: customPrompts }, resolve);
    });
    
    return true;
  }

  /**
   * Supprime un prompt personnalisé
   * @param {string} id - ID du prompt à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteCustomPrompt(id) {
    const customPrompts = await this.getCustomPrompts();
    
    // Filtrer pour exclure le prompt à supprimer
    const updatedPrompts = customPrompts.filter(p => p.id !== id);
    
    // Vérifier si un prompt a été supprimé
    if (updatedPrompts.length === customPrompts.length) return false;
    
    // Sauvegarder la liste mise à jour
    await new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_PROMPTS]: updatedPrompts }, resolve);
    });
    
    return true;
  }

  /**
   * Récupère un prompt par son ID
   * @param {string} id - ID du prompt à récupérer
   * @returns {Promise<Object|null>} Le prompt trouvé ou null
   */
  static async getPromptById(id) {
    // Vérifier d'abord dans les prompts par défaut
    const defaultPrompt = DEFAULT_PROMPTS.find(p => p.id === id);
    if (defaultPrompt) return defaultPrompt;
    
    // Sinon chercher dans les prompts personnalisés
    const customPrompts = await this.getCustomPrompts();
    return customPrompts.find(p => p.id === id) || null;
  }
}

export default CustomPromptManager;