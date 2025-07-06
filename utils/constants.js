// constants.js - Fichier de constantes pour LucidSelect

// Modèles d'IA supportés
export const AI_MODELS = {
  OPENAI: 'openai',
  TOGETHER: 'together',
  CLAUDE: 'claude',
  GEMINI: 'gemini',
  CUSTOM: 'custom' // Pour les modèles personnalisés ajoutés par l'utilisateur
};

// Endpoints des API
export const API_ENDPOINTS = {
  [AI_MODELS.OPENAI]: 'https://api.openai.com/v1/chat/completions',
  [AI_MODELS.TOGETHER]: 'https://api.together.xyz/v1/completions',
  [AI_MODELS.CLAUDE]: 'https://api.anthropic.com/v1/messages',
  [AI_MODELS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
};

// Langues supportées
export const SUPPORTED_LANGUAGES = {
  FR: 'fr',
  EN: 'en',
  ES: 'es',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  NL: 'nl',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja'
};

// Traductions
export const TRANSLATIONS = {
  [SUPPORTED_LANGUAGES.FR]: {
    answerQuestion: 'Répondre à la question sélectionnée',
    paraphrase: 'Paraphraser',
    summarize: 'Résumer',
    analyzeQCM: 'Analyser QCM/Quiz',
    askAboutSelection: 'Question à propos de la sélection',
    openChatGPT: 'Ouvrir un chat avec ChatGPT',
    saveApiKey: 'Sauvegarder',
    clearApiKey: 'Effacer',
    apiKeySaved: 'Clé API sauvegardée !',
    apiKeyCleared: 'Clé API effacée !',
    enterQuestion: 'Entrez votre question...',
    send: 'Envoyer',
    loading: 'Chargement...',
    error: 'Erreur: ',
    customPrompts: 'Prompts personnalisés',
    addCustomPrompt: 'Ajouter un prompt',
    editCustomPrompt: 'Modifier',
    deleteCustomPrompt: 'Supprimer',
    promptName: 'Nom du prompt',
    promptTemplate: 'Modèle de prompt',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    history: 'Historique',
    clearHistory: 'Effacer l\'historique',
    exportHistory: 'Exporter l\'historique',
    settings: 'Paramètres',
    language: 'Langue',
    aiModel: 'Modèle d\'IA',
    apiKeys: 'Clés API',
    // Modèles personnalisés
    add_custom_model: 'Ajouter un modèle personnalisé',
    edit_model: 'Modifier ce modèle',
    delete_model: 'Supprimer ce modèle',
    model_name: 'Nom du modèle',
    model_description: 'Description',
    model_features: 'Caractéristiques',
    api_endpoint: 'Point de terminaison API',
    api_key_label_name: 'Libellé de la clé API',
    request_template: 'Modèle de requête (JSON)',
    response_path: 'Chemin de la réponse',
    logo_url: 'URL du logo',
    edit_custom_model: 'Modifier le modèle personnalisé',
    confirm_delete: 'Confirmer la suppression',
    confirm_delete_message: 'Êtes-vous sûr de vouloir supprimer ce modèle personnalisé ?',
    delete: 'Supprimer',
    custom_model_added: 'Modèle personnalisé ajouté avec succès',
    custom_model_updated: 'Modèle personnalisé mis à jour avec succès',
    custom_model_deleted: 'Modèle personnalisé supprimé avec succès'
  },
  [SUPPORTED_LANGUAGES.EN]: {
    answerQuestion: 'Answer selected question',
    paraphrase: 'Paraphrase',
    summarize: 'Summarize',
    analyzeQCM: 'Analyze MCQ/Quiz',
    askAboutSelection: 'Ask about selection',
    openChatGPT: 'Open chat with ChatGPT',
    saveApiKey: 'Save',
    clearApiKey: 'Clear',
    apiKeySaved: 'API key saved!',
    apiKeyCleared: 'API key cleared!',
    enterQuestion: 'Enter your question...',
    send: 'Send',
    loading: 'Loading...',
    error: 'Error: ',
    customPrompts: 'Custom prompts',
    addCustomPrompt: 'Add prompt',
    editCustomPrompt: 'Edit',
    deleteCustomPrompt: 'Delete',
    promptName: 'Prompt name',
    promptTemplate: 'Prompt template',
    save: 'Save',
    cancel: 'Cancel',
    history: 'History',
    clearHistory: 'Clear history',
    exportHistory: 'Export history',
    settings: 'Settings',
    language: 'Language',
    aiModel: 'AI Model',
    apiKeys: 'API Keys',
    // Custom models
    add_custom_model: 'Add custom model',
    edit_model: 'Edit this model',
    delete_model: 'Delete this model',
    model_name: 'Model name',
    model_description: 'Description',
    model_features: 'Features',
    api_endpoint: 'API endpoint',
    api_key_label_name: 'API key label',
    request_template: 'Request template (JSON)',
    response_path: 'Response path',
    logo_url: 'Logo URL',
    edit_custom_model: 'Edit custom model',
    confirm_delete: 'Confirm deletion',
    confirm_delete_message: 'Are you sure you want to delete this custom model?',
    delete: 'Delete',
    custom_model_added: 'Custom model added successfully',
    custom_model_updated: 'Custom model updated successfully',
    custom_model_deleted: 'Custom model deleted successfully'
  }
  // Autres langues à ajouter
};

// Prompts prédéfinis
export const DEFAULT_PROMPTS = [
  {
    id: 'answer_question',
    name: 'Répondre à la question',
    template: 'Réponds à cette question'
  },
  {
    id: 'paraphrase',
    name: 'Paraphraser',
    template: 'Paraphrase ce texte'
  },
  {
    id: 'summarize',
    name: 'Résumer',
    template: 'Résume ce texte'
  },
  {
    id: 'analyze_qcm',
    name: 'Analyser QCM/Quiz',
    template: 'Ceci est un QCM ou un quiz. Identifie la ou les bonnes réponses parmi les options proposées. Explique brièvement ton raisonnement. Si tu n\'es pas sûr, indique-le clairement.'
  }
];

// Clés de stockage local
export const STORAGE_KEYS = {
  OPENAI_API_KEY: 'openai_api_key',
  TOGETHER_API_KEY: 'together_api_key',
  CLAUDE_API_KEY: 'claude_api_key',
  GEMINI_API_KEY: 'gemini_api_key',
  SELECTED_API: 'selected_api',
  LANGUAGE: 'language',
  CUSTOM_PROMPTS: 'custom_prompts',
  HISTORY: 'query_history',
  CUSTOM_MODELS: 'custom_models' // Pour stocker les modèles personnalisés
};

// Nombre maximum d'éléments d'historique à conserver
export const MAX_HISTORY_ITEMS = 100;

// Délai d'attente maximum pour les requêtes API (en ms)
export const API_TIMEOUT = 30000;

// Sélecteurs CSS pour l'injection dans ChatGPT
export const CHATGPT_SELECTORS = [
  'textarea[placeholder]', 
  'div[contenteditable="true"]',
  'div[role="textbox"]',
  'form textarea',
  '#prompt-textarea'
];