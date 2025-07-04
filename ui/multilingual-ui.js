// multilingual-ui.js - Module pour gérer l'interface utilisateur multilingue

import { I18nManager } from '../utils/i18n.js';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';

/**
 * Classe pour gérer l'interface utilisateur multilingue
 */
class MultilingualUI {
  /**
   * Initialise l'interface multilingue
   */
  constructor() {
    this.i18n = new I18nManager();
    this.currentLanguage = null;
  }

  /**
   * Initialise l'interface utilisateur multilingue
   * @returns {Promise<void>}
   */
  async init() {
    // Initialiser le gestionnaire de traductions
    await this.i18n.init();
    this.currentLanguage = await this.i18n.getCurrentLanguage();
    
    // Mettre à jour l'interface avec la langue actuelle
    this.updateUI();
    
    // Ajouter les écouteurs d'événements pour le changement de langue
    this.setupLanguageSelector();
  }

  /**
   * Met à jour l'interface utilisateur avec la langue actuelle
   */
  updateUI() {
    // Mettre à jour tous les éléments avec l'attribut data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.i18n.translate(key);
    });
    
    // Mettre à jour les attributs placeholder avec l'attribut data-i18n-placeholder
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.setAttribute('placeholder', this.i18n.translate(key));
    });
    
    // Mettre à jour les attributs title avec l'attribut data-i18n-title
    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.setAttribute('title', this.i18n.translate(key));
    });
    
    // Mettre à jour les attributs aria-label avec l'attribut data-i18n-aria-label
    const ariaLabels = document.querySelectorAll('[data-i18n-aria-label]');
    ariaLabels.forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      element.setAttribute('aria-label', this.i18n.translate(key));
    });
  }

  /**
   * Configure le sélecteur de langue dans l'interface
   */
  setupLanguageSelector() {
    // Créer ou récupérer le sélecteur de langue
    let languageSelector = document.getElementById('language-selector');
    
    if (!languageSelector) {
      // Si le sélecteur n'existe pas, le créer
      languageSelector = document.createElement('select');
      languageSelector.id = 'language-selector';
      languageSelector.className = 'language-selector';
      
      // Ajouter le sélecteur à l'interface (à adapter selon la structure HTML)
      const container = document.querySelector('.settings-container') || document.body;
      container.appendChild(languageSelector);
    } else {
      // Vider le sélecteur existant
      languageSelector.innerHTML = '';
    }
    
    // Ajouter les options de langue
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, langInfo]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = langInfo.nativeName;
      option.selected = code === this.currentLanguage;
      languageSelector.appendChild(option);
    });
    
    // Ajouter l'écouteur d'événement pour le changement de langue
    languageSelector.addEventListener('change', async (event) => {
      const newLanguage = event.target.value;
      await this.changeLanguage(newLanguage);
    });
  }

  /**
   * Change la langue de l'interface
   * @param {string} languageCode - Code de la langue
   * @returns {Promise<void>}
   */
  async changeLanguage(languageCode) {
    if (languageCode === this.currentLanguage) return;
    
    // Changer la langue dans le gestionnaire de traductions
    await this.i18n.setCurrentLanguage(languageCode);
    this.currentLanguage = languageCode;
    
    // Mettre à jour l'interface
    this.updateUI();
    
    // Déclencher un événement personnalisé pour informer les autres composants
    const event = new CustomEvent('languageChanged', { detail: { language: languageCode } });
    document.dispatchEvent(event);
  }

  /**
   * Traduit une chaîne de caractères
   * @param {string} key - Clé de traduction
   * @param {Object} params - Paramètres de substitution
   * @returns {string} Chaîne traduite
   */
  translate(key, params = {}) {
    return this.i18n.translate(key, params);
  }

  /**
   * Crée un élément HTML avec une traduction
   * @param {string} tag - Tag HTML
   * @param {string} i18nKey - Clé de traduction
   * @param {Object} attributes - Attributs HTML
   * @returns {HTMLElement} Élément HTML créé
   */
  createTranslatedElement(tag, i18nKey, attributes = {}) {
    const element = document.createElement(tag);
    
    // Ajouter les attributs
    Object.entries(attributes).forEach(([attr, value]) => {
      element.setAttribute(attr, value);
    });
    
    // Ajouter la traduction
    element.setAttribute('data-i18n', i18nKey);
    element.textContent = this.translate(i18nKey);
    
    return element;
  }
}

// Exporter une instance singleton
const multilingualUI = new MultilingualUI();
export default multilingualUI;