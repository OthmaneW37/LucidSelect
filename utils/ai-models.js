// ai-models.js - Module de gestion des différents modèles d'IA

import { AI_MODELS, API_ENDPOINTS, STORAGE_KEYS, API_TIMEOUT } from './constants.js';

/**
 * Classe pour gérer les appels aux différentes API d'IA
 */
class AIModelManager {
  /**
   * Récupère la clé API pour un modèle spécifique
   * @param {string} model - Modèle d'IA (voir AI_MODELS)
   * @returns {Promise<string>} Clé API ou chaîne vide
   */
  static async getApiKey(model) {
    let storageKey;
    
    switch (model) {
      case AI_MODELS.OPENAI:
        storageKey = STORAGE_KEYS.OPENAI_API_KEY;
        break;
      case AI_MODELS.TOGETHER:
        storageKey = STORAGE_KEYS.TOGETHER_API_KEY;
        break;
      case AI_MODELS.CLAUDE:
        storageKey = STORAGE_KEYS.CLAUDE_API_KEY;
        break;
      case AI_MODELS.GEMINI:
        storageKey = STORAGE_KEYS.GEMINI_API_KEY;
        break;
      default:
        return '';
    }
    
    return new Promise((resolve) => {
      chrome.storage.local.get([storageKey], (result) => {
        resolve(result[storageKey] || '');
      });
    });
  }

  /**
   * Récupère le modèle d'IA actuellement sélectionné
   * @returns {Promise<string>} Modèle sélectionné
   */
  static async getSelectedModel() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.SELECTED_API], (result) => {
        resolve(result[STORAGE_KEYS.SELECTED_API] || AI_MODELS.OPENAI);
      });
    });
  }

  /**
   * Définit le modèle d'IA à utiliser
   * @param {string} model - Modèle d'IA à définir comme actif
   * @returns {Promise<void>}
   */
  static async setSelectedModel(model) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.SELECTED_API]: model }, resolve);
    });
  }

  /**
   * Envoie une requête à l'API du modèle sélectionné
   * @param {string} prompt - Prompt à envoyer
   * @param {string} userText - Texte sélectionné par l'utilisateur
   * @param {string} [specificModel] - Modèle spécifique à utiliser (sinon utilise le modèle sélectionné)
   * @returns {Promise<string>} Réponse de l'API
   */
  static async query(prompt, userText, specificModel = null) {
    const model = specificModel || await this.getSelectedModel();
    const apiKey = await this.getApiKey(model);
    
    if (!apiKey) {
      throw new Error(`Clé API non configurée pour ${model}`);
    }
    
    // Construire le message complet
    const fullPrompt = `${prompt}:\n\n${userText}`;
    
    // Appeler la méthode spécifique au modèle
    switch (model) {
      case AI_MODELS.OPENAI:
        return this.queryOpenAI(apiKey, fullPrompt);
      case AI_MODELS.TOGETHER:
        return this.queryTogether(apiKey, fullPrompt);
      case AI_MODELS.CLAUDE:
        return this.queryClaude(apiKey, fullPrompt);
      case AI_MODELS.GEMINI:
        return this.queryGemini(apiKey, fullPrompt);
      default:
        throw new Error(`Modèle non supporté: ${model}`);
    }
  }

  /**
   * Envoie une requête à l'API OpenAI
   * @param {string} apiKey - Clé API OpenAI
   * @param {string} prompt - Prompt complet
   * @returns {Promise<string>} Réponse de l'API
   */
  static async queryOpenAI(apiKey, prompt) {
    const endpoint = API_ENDPOINTS[AI_MODELS.OPENAI];
    
    const response = await this.fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${data.error?.message || 'Erreur inconnue'}`);
    }
    
    return data.choices[0].message.content.trim();
  }

  /**
   * Envoie une requête à l'API Together.ai
   * @param {string} apiKey - Clé API Together.ai
   * @param {string} prompt - Prompt complet
   * @returns {Promise<string>} Réponse de l'API
   */
  static async queryTogether(apiKey, prompt) {
    const endpoint = API_ENDPOINTS[AI_MODELS.TOGETHER];
    
    const response = await this.fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        prompt: `<s>[INST] ${prompt} [/INST]`,
        temperature: 0.7,
        max_tokens: 1024
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur Together.ai: ${data.error?.message || 'Erreur inconnue'}`);
    }
    
    return data.choices[0].text.trim();
  }

  /**
   * Envoie une requête à l'API Claude (Anthropic)
   * @param {string} apiKey - Clé API Claude
   * @param {string} prompt - Prompt complet
   * @returns {Promise<string>} Réponse de l'API
   */
  static async queryClaude(apiKey, prompt) {
    const endpoint = API_ENDPOINTS[AI_MODELS.CLAUDE];
    
    const response = await this.fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-2',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur Claude: ${data.error?.message || 'Erreur inconnue'}`);
    }
    
    return data.content[0].text;
  }

  /**
   * Envoie une requête à l'API Gemini (Google)
   * @param {string} apiKey - Clé API Gemini
   * @param {string} prompt - Prompt complet
   * @returns {Promise<string>} Réponse de l'API
   */
  static async queryGemini(apiKey, prompt) {
    const endpoint = `${API_ENDPOINTS[AI_MODELS.GEMINI]}?key=${apiKey}`;
    
    const response = await this.fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur Gemini: ${data.error?.message || 'Erreur inconnue'}`);
    }
    
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Effectue une requête fetch avec un timeout
   * @param {string} url - URL de la requête
   * @param {Object} options - Options fetch
   * @returns {Promise<Response>} Réponse fetch
   */
  static async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Effectue une requête avec backoff exponentiel en cas d'erreur 429
   * @param {Function} queryFn - Fonction de requête à exécuter
   * @param {number} maxRetries - Nombre maximum de tentatives
   * @param {number} baseDelay - Délai de base entre les tentatives (ms)
   * @returns {Promise<string>} Réponse de l'API
   */
  static async queryWithBackoff(queryFn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await queryFn();
      } catch (error) {
        lastError = error;
        
        // Si ce n'est pas une erreur 429 (Too Many Requests), ne pas réessayer
        if (!error.message.includes('429')) {
          throw error;
        }
        
        // Calculer le délai avec backoff exponentiel
        const delay = baseDelay * Math.pow(2, attempt);
        
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Si toutes les tentatives ont échoué
    throw lastError;
  }
}

export default AIModelManager;