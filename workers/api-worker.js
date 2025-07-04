// api-worker.js - Web Worker pour traiter les requêtes API en arrière-plan

/**
 * Effectue une requête fetch avec un timeout
 * @param {string} url - URL de la requête
 * @param {Object} options - Options fetch
 * @param {number} timeout - Délai avant timeout en ms
 * @returns {Promise<Response>} Réponse fetch
 */
async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
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
 * @returns {Promise<Object>} Réponse de l'API
 */
async function queryWithBackoff(queryFn, maxRetries = 3, baseDelay = 1000) {
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

/**
 * Traite les requêtes OpenAI
 * @param {Object} data - Données de la requête
 * @returns {Promise<Object>} Réponse traitée
 */
async function processOpenAIRequest(data) {
  const { apiKey, prompt, endpoint } = data;
  
  const response = await fetchWithTimeout(endpoint, {
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
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Erreur OpenAI: ${responseData.error?.message || 'Erreur inconnue'}`);
  }
  
  return {
    text: responseData.choices[0].message.content.trim(),
    model: 'gpt-3.5-turbo'
  };
}

/**
 * Traite les requêtes Together.ai
 * @param {Object} data - Données de la requête
 * @returns {Promise<Object>} Réponse traitée
 */
async function processTogetherRequest(data) {
  const { apiKey, prompt, endpoint } = data;
  
  const response = await fetchWithTimeout(endpoint, {
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
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Erreur Together.ai: ${responseData.error?.message || 'Erreur inconnue'}`);
  }
  
  return {
    text: responseData.choices[0].text.trim(),
    model: 'Mixtral-8x7B'
  };
}

/**
 * Traite les requêtes Claude (Anthropic)
 * @param {Object} data - Données de la requête
 * @returns {Promise<Object>} Réponse traitée
 */
async function processClaudeRequest(data) {
  const { apiKey, prompt, endpoint } = data;
  
  const response = await fetchWithTimeout(endpoint, {
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
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Erreur Claude: ${responseData.error?.message || 'Erreur inconnue'}`);
  }
  
  return {
    text: responseData.content[0].text,
    model: 'claude-2'
  };
}

/**
 * Traite les requêtes Gemini (Google)
 * @param {Object} data - Données de la requête
 * @returns {Promise<Object>} Réponse traitée
 */
async function processGeminiRequest(data) {
  const { apiKey, prompt, endpoint } = data;
  
  const response = await fetchWithTimeout(`${endpoint}?key=${apiKey}`, {
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
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Erreur Gemini: ${responseData.error?.message || 'Erreur inconnue'}`);
  }
  
  return {
    text: responseData.candidates[0].content.parts[0].text,
    model: 'gemini-pro'
  };
}

// Écouter les messages du script principal
self.onmessage = async (event) => {
  try {
    const { type, data } = event.data;
    let result;
    
    // Traiter la requête en fonction du type de modèle
    switch (type) {
      case 'openai':
        result = await queryWithBackoff(() => processOpenAIRequest(data));
        break;
      case 'together':
        result = await queryWithBackoff(() => processTogetherRequest(data));
        break;
      case 'claude':
        result = await queryWithBackoff(() => processClaudeRequest(data));
        break;
      case 'gemini':
        result = await queryWithBackoff(() => processGeminiRequest(data));
        break;
      default:
        throw new Error(`Type de modèle non supporté: ${type}`);
    }
    
    // Envoyer le résultat au script principal
    self.postMessage({
      success: true,
      result
    });
  } catch (error) {
    // Envoyer l'erreur au script principal
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};