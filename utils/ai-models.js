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
    
    // Vérifier si c'est un modèle prédéfini
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
        // Vérifier si c'est un modèle personnalisé
        if (model.startsWith('custom_')) {
          return this.getCustomModelApiKey(model);
        }
        return '';
    }
    
    return new Promise((resolve) => {
      chrome.storage.local.get([storageKey], (result) => {
        resolve(result[storageKey] || '');
      });
    });
  }

  /**
   * Récupère tous les modèles d'IA disponibles (prédéfinis et personnalisés)
   * @returns {Promise<Object>} Modèles disponibles
   */
  static async getAllModels() {
    // Récupérer les modèles prédéfinis
    const predefinedModels = {};
    Object.entries(AI_MODELS).forEach(([key, value]) => {
      if (key !== 'CUSTOM') { // Exclure le type CUSTOM
        predefinedModels[value] = {
          id: value,
          name: key.charAt(0) + key.slice(1).toLowerCase(),
          type: 'predefined'
        };
      }
    });
    
    // Récupérer les modèles personnalisés
    const customModels = await this.getCustomModels();
    const customModelsMap = {};
    
    customModels.forEach(model => {
      customModelsMap[model.id] = {
        ...model,
        type: 'custom'
      };
    });
    
    // Combiner les modèles
    return {
      ...predefinedModels,
      ...customModelsMap
    };
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
   * Récupère tous les modèles personnalisés
   * @returns {Promise<Array>} Liste des modèles personnalisés
   */
  static async getCustomModels() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.CUSTOM_MODELS], (result) => {
        resolve(result[STORAGE_KEYS.CUSTOM_MODELS] || []);
      });
    });
  }

  /**
   * Récupère un modèle personnalisé par son ID
   * @param {string} modelId - ID du modèle personnalisé
   * @returns {Promise<Object|null>} Modèle personnalisé ou null
   */
  static async getCustomModel(modelId) {
    const customModels = await this.getCustomModels();
    return customModels.find(model => model.id === modelId) || null;
  }

  /**
   * Récupère la clé API pour un modèle personnalisé
   * @param {string} modelId - ID du modèle personnalisé
   * @returns {Promise<string>} Clé API ou chaîne vide
   */
  static async getCustomModelApiKey(modelId) {
    const storageKey = `api_key_${modelId}`;
    return new Promise((resolve) => {
      chrome.storage.local.get([storageKey], (result) => {
        resolve(result[storageKey] || '');
      });
    });
  }

  /**
   * Ajoute ou met à jour un modèle personnalisé
   * @param {Object} model - Modèle personnalisé à ajouter ou mettre à jour
   * @returns {Promise<string>} ID du modèle ajouté ou mis à jour
   */
  static async saveCustomModel(model) {
    // Générer un ID si nécessaire
    if (!model.id) {
      model.id = `custom_${Date.now()}`;
    }
    
    // Récupérer les modèles existants
    const customModels = await this.getCustomModels();
    
    // Vérifier si le modèle existe déjà
    const existingIndex = customModels.findIndex(m => m.id === model.id);
    
    if (existingIndex >= 0) {
      // Mettre à jour le modèle existant
      customModels[existingIndex] = { ...customModels[existingIndex], ...model };
    } else {
      // Ajouter le nouveau modèle
      customModels.push(model);
    }
    
    // Sauvegarder les modèles
    await new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_MODELS]: customModels }, resolve);
    });
    
    return model.id;
  }

  /**
   * Supprime un modèle personnalisé
   * @param {string} modelId - ID du modèle à supprimer
   * @returns {Promise<boolean>} True si le modèle a été supprimé
   */
  static async deleteCustomModel(modelId) {
    // Récupérer les modèles existants
    const customModels = await this.getCustomModels();
    
    // Filtrer le modèle à supprimer
    const filteredModels = customModels.filter(model => model.id !== modelId);
    
    // Si aucun modèle n'a été supprimé
    if (filteredModels.length === customModels.length) {
      return false;
    }
    
    // Supprimer la clé API associée
    const apiKeyStorageKey = `api_key_${modelId}`;
    
    // Sauvegarder les modèles et supprimer la clé API
    await Promise.all([
      new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_MODELS]: filteredModels }, resolve);
      }),
      new Promise((resolve) => {
        chrome.storage.local.remove(apiKeyStorageKey, resolve);
      })
    ]);
    
    return true;
  }

  /**
   * Définit la clé API pour un modèle
   * @param {string} model - Modèle d'IA
   * @param {string} apiKey - Clé API
   * @returns {Promise<void>}
   */
  static async setApiKey(model, apiKey) {
    // Vérifier si c'est un modèle personnalisé
    if (model.startsWith('custom_')) {
      return this.setCustomModelApiKey(model, apiKey);
    }
    
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
        throw new Error(`Modèle non supporté: ${model}`);
    }
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [storageKey]: apiKey }, resolve);
    });
  }

  /**
   * Définit la clé API pour un modèle personnalisé
   * @param {string} modelId - ID du modèle personnalisé
   * @param {string} apiKey - Clé API
   * @returns {Promise<void>}
   */
  static async setCustomModelApiKey(modelId, apiKey) {
    const storageKey = `api_key_${modelId}`;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [storageKey]: apiKey }, resolve);
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
    
    // Vérifier si c'est un modèle personnalisé
    if (model.startsWith('custom_')) {
      const customModel = await this.getCustomModel(model);
      if (!customModel) {
        throw new Error(`Modèle personnalisé non trouvé: ${model}`);
      }
      return this.queryCustomModel(customModel, apiKey, fullPrompt);
    }
    
    // Appeler la méthode spécifique au modèle prédéfini
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
   * Envoie une requête à un modèle personnalisé
   * @param {Object} model - Modèle personnalisé
   * @param {string} apiKey - Clé API
   * @param {string} prompt - Prompt complet
   * @returns {Promise<string>} Réponse de l'API
   */
  static async queryCustomModel(model, apiKey, prompt) {
    const { endpoint, requestFormat, responseFormat } = model;
    
    if (!endpoint) {
      throw new Error('Endpoint non défini pour le modèle personnalisé');
    }
    
    // Construire les en-têtes
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Ajouter l'en-tête d'autorisation selon le format spécifié
    if (model.authFormat === 'bearer') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (model.authFormat === 'x-api-key') {
      headers['x-api-key'] = apiKey;
    } else if (model.authFormat === 'custom' && model.authHeaderName) {
      headers[model.authHeaderName] = apiKey;
    }
    
    // Construire le corps de la requête selon le format spécifié
    let body;
    
    if (requestFormat === 'openai') {
      body = JSON.stringify({
        model: model.modelName || 'default',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: model.temperature || 0.7,
        max_tokens: model.maxTokens || 1024
      });
    } else if (requestFormat === 'together') {
      body = JSON.stringify({
        model: model.modelName || 'default',
        prompt: prompt,
        temperature: model.temperature || 0.7,
        max_tokens: model.maxTokens || 1024
      });
    } else if (requestFormat === 'anthropic') {
      body = JSON.stringify({
        model: model.modelName || 'default',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: model.maxTokens || 1024
      });
    } else if (requestFormat === 'gemini') {
      body = JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: model.temperature || 0.7,
          maxOutputTokens: model.maxTokens || 1024
        }
      });
    } else if (requestFormat === 'custom' && model.requestTemplate) {
      // Utiliser un template personnalisé
      try {
        const template = JSON.parse(model.requestTemplate);
        // Remplacer les placeholders
        body = JSON.stringify(this.replaceTemplateValues(template, {
          prompt,
          temperature: model.temperature || 0.7,
          maxTokens: model.maxTokens || 1024,
          modelName: model.modelName || 'default'
        }));
      } catch (error) {
        throw new Error(`Erreur dans le template de requête: ${error.message}`);
      }
    } else {
      throw new Error(`Format de requête non supporté: ${requestFormat}`);
    }
    
    // Ajouter le paramètre API key à l'URL si nécessaire
    let url = endpoint;
    if (model.authFormat === 'url_param' && model.authParamName) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${model.authParamName}=${apiKey}`;
    }
    
    // Effectuer la requête
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${data.error?.message || JSON.stringify(data) || 'Erreur inconnue'}`);
    }
    
    // Extraire la réponse selon le format spécifié
    let result = '';
    
    if (responseFormat === 'openai') {
      result = data.choices?.[0]?.message?.content || '';
    } else if (responseFormat === 'together') {
      result = data.choices?.[0]?.text || '';
    } else if (responseFormat === 'anthropic') {
      result = data.content?.[0]?.text || '';
    } else if (responseFormat === 'gemini') {
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (responseFormat === 'custom' && model.responsePath) {
      // Utiliser un chemin personnalisé pour extraire la réponse
      try {
        result = this.getValueByPath(data, model.responsePath) || '';
      } catch (error) {
        throw new Error(`Erreur lors de l'extraction de la réponse: ${error.message}`);
      }
    } else {
      throw new Error(`Format de réponse non supporté: ${responseFormat}`);
    }
    
    return result.trim();
  }

  /**
   * Remplace les valeurs dans un template d'objet
   * @param {Object} template - Template d'objet
   * @param {Object} values - Valeurs à remplacer
   * @returns {Object} Template avec les valeurs remplacées
   */
  static replaceTemplateValues(template, values) {
    if (typeof template === 'string') {
      // Remplacer les placeholders dans les chaînes
      let result = template;
      for (const [key, value] of Object.entries(values)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }
      return result;
    } else if (Array.isArray(template)) {
      // Traiter les tableaux récursivement
      return template.map(item => this.replaceTemplateValues(item, values));
    } else if (typeof template === 'object' && template !== null) {
      // Traiter les objets récursivement
      const result = {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.replaceTemplateValues(value, values);
      }
      return result;
    }
    // Retourner les autres types tels quels
    return template;
  }

  /**
   * Récupère une valeur dans un objet en utilisant un chemin
   * @param {Object} obj - Objet à parcourir
   * @param {string} path - Chemin vers la valeur (ex: "choices.0.message.content")
   * @returns {*} Valeur trouvée ou undefined
   */
  static getValueByPath(obj, path) {
    return path.split('.').reduce((o, p) => o?.[p], obj);
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