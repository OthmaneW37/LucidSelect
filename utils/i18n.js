// i18n.js - Module de gestion des traductions et du support multilingue

import { SUPPORTED_LANGUAGES, TRANSLATIONS, STORAGE_KEYS } from './constants.js';

/**
 * Classe pour gérer les traductions et le support multilingue
 */
class I18nManager {
  /**
   * Langue actuellement utilisée
   * @type {string}
   */
  static currentLanguage = SUPPORTED_LANGUAGES.FR;

  /**
   * Initialise le gestionnaire de langues
   * @returns {Promise<void>}
   */
  static async init() {
    // Charger la langue sauvegardée ou utiliser le français par défaut
    const savedLanguage = await this.getSavedLanguage();
    this.currentLanguage = savedLanguage || this.getBrowserLanguage() || SUPPORTED_LANGUAGES.FR;
  }

  /**
   * Récupère la langue sauvegardée dans le stockage local
   * @returns {Promise<string|null>} Code de langue ou null
   */
  static async getSavedLanguage() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.LANGUAGE], (result) => {
        resolve(result[STORAGE_KEYS.LANGUAGE] || null);
      });
    });
  }

  /**
   * Détecte la langue du navigateur
   * @returns {string|null} Code de langue supporté ou null
   */
  static getBrowserLanguage() {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    
    // Vérifier si la langue du navigateur est supportée
    const isSupported = Object.values(SUPPORTED_LANGUAGES).includes(browserLang);
    
    return isSupported ? browserLang : null;
  }

  /**
   * Définit la langue active
   * @param {string} languageCode - Code de langue à définir
   * @returns {Promise<boolean>} Succès du changement de langue
   */
  static async setLanguage(languageCode) {
    // Vérifier si la langue est supportée
    if (!Object.values(SUPPORTED_LANGUAGES).includes(languageCode)) {
      return false;
    }
    
    // Mettre à jour la langue courante
    this.currentLanguage = languageCode;
    
    // Sauvegarder la préférence
    await new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.LANGUAGE]: languageCode }, resolve);
    });
    
    // Mettre à jour l'interface
    this.updateInterface();
    
    return true;
  }

  /**
   * Traduit une clé dans la langue actuelle
   * @param {string} key - Clé de traduction
   * @returns {string} Texte traduit ou la clé elle-même si non trouvée
   */
  static translate(key) {
    // Récupérer les traductions pour la langue actuelle
    const translations = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS[SUPPORTED_LANGUAGES.FR];
    
    // Retourner la traduction ou la clé si non trouvée
    return translations[key] || key;
  }

  /**
   * Met à jour tous les éléments de l'interface avec les traductions
   */
  static updateInterface() {
    // Sélectionner tous les éléments avec l'attribut data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    // Mettre à jour le texte de chaque élément
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.translate(key);
    });
    
    // Mettre à jour les placeholders
    const inputElements = document.querySelectorAll('[data-i18n-placeholder]');
    inputElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.translate(key);
    });
    
    // Mettre à jour les titres (tooltips)
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.translate(key);
    });
  }

  /**
   * Récupère la liste des langues supportées avec leurs noms traduits
   * @returns {Array<Object>} Liste des langues {code, name}
   */
  static getSupportedLanguages() {
    return [
      { code: SUPPORTED_LANGUAGES.FR, name: 'Français' },
      { code: SUPPORTED_LANGUAGES.EN, name: 'English' },
      { code: SUPPORTED_LANGUAGES.ES, name: 'Español' },
      { code: SUPPORTED_LANGUAGES.DE, name: 'Deutsch' },
      { code: SUPPORTED_LANGUAGES.IT, name: 'Italiano' },
      { code: SUPPORTED_LANGUAGES.PT, name: 'Português' },
      { code: SUPPORTED_LANGUAGES.NL, name: 'Nederlands' },
      { code: SUPPORTED_LANGUAGES.RU, name: 'Русский' },
      { code: SUPPORTED_LANGUAGES.ZH, name: '中文' },
      { code: SUPPORTED_LANGUAGES.JA, name: '日本語' }
    ];
  }
}

export default I18nManager;