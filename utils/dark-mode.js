/**
 * dark-mode.js - Gestion du thème sombre pour LucidSelect
 * 
 * Ce module permet de gérer le thème sombre de l'extension, en détectant
 * les préférences système et en permettant à l'utilisateur de choisir
 * manuellement son thème préféré.
 */

class DarkModeManager {
  constructor() {
    this.STORAGE_KEY = 'lucidselect_theme';
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system'
    };
    this.currentTheme = null;
    this.observers = [];
  }

  /**
   * Initialise le gestionnaire de thème
   * @returns {Promise<string>} Le thème actuel
   */
  async initialize() {
    // Récupérer le thème sauvegardé ou utiliser la valeur par défaut
    try {
      const result = await new Promise(resolve => {
        chrome.storage.sync.get({ theme: this.THEMES.SYSTEM }, result => {
          resolve(result);
        });
      });
      
      this.currentTheme = result.theme;
    } catch (error) {
      console.error('Erreur lors de la récupération du thème:', error);
      this.currentTheme = this.THEMES.SYSTEM;
    }

    // Appliquer le thème initial
    this.applyTheme();

    // Écouter les changements de préférence système
    this.setupSystemPreferenceListener();

    return this.currentTheme;
  }

  /**
   * Configure l'écouteur pour les changements de préférence système
   */
  setupSystemPreferenceListener() {
    // Utiliser matchMedia pour détecter la préférence de thème sombre
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Fonction de callback pour les changements
    const handleSystemThemeChange = e => {
      if (this.currentTheme === this.THEMES.SYSTEM) {
        this.applyTheme();
      }
    };

    // Ajouter l'écouteur d'événements
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback pour les anciens navigateurs
      darkModeMediaQuery.addListener(handleSystemThemeChange);
    }
  }

  /**
   * Définit le thème actuel et l'applique
   * @param {string} theme - Le thème à définir (light, dark, system)
   * @returns {Promise<void>}
   */
  async setTheme(theme) {
    if (!Object.values(this.THEMES).includes(theme)) {
      throw new Error(`Thème invalide: ${theme}. Utilisez light, dark ou system.`);
    }

    this.currentTheme = theme;
    
    // Sauvegarder le thème dans le stockage
    try {
      await new Promise(resolve => {
        chrome.storage.sync.set({ theme }, resolve);
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }

    // Appliquer le thème
    this.applyTheme();
    
    // Notifier les observateurs
    this.notifyObservers();
  }

  /**
   * Récupère le thème actuel
   * @returns {string} Le thème actuel
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Détermine si le thème sombre doit être appliqué
   * @returns {boolean} true si le thème sombre doit être appliqué
   */
  isDarkModeActive() {
    if (this.currentTheme === this.THEMES.DARK) {
      return true;
    }
    
    if (this.currentTheme === this.THEMES.SYSTEM) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false;
  }

  /**
   * Applique le thème actuel au document
   */
  applyTheme() {
    const isDark = this.isDarkModeActive();
    
    // Appliquer la classe au document
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Mettre à jour l'attribut data-theme pour le CSS
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  /**
   * Bascule entre les thèmes clair et sombre
   * @returns {Promise<string>} Le nouveau thème
   */
  async toggleTheme() {
    const newTheme = this.isDarkModeActive() ? this.THEMES.LIGHT : this.THEMES.DARK;
    await this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Ajoute un observateur pour les changements de thème
   * @param {Function} callback - Fonction à appeler lors d'un changement de thème
   */
  addObserver(callback) {
    if (typeof callback === 'function' && !this.observers.includes(callback)) {
      this.observers.push(callback);
    }
  }

  /**
   * Supprime un observateur
   * @param {Function} callback - L'observateur à supprimer
   */
  removeObserver(callback) {
    const index = this.observers.indexOf(callback);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notifie tous les observateurs d'un changement de thème
   */
  notifyObservers() {
    const themeData = {
      theme: this.currentTheme,
      isDark: this.isDarkModeActive()
    };
    
    this.observers.forEach(callback => {
      try {
        callback(themeData);
      } catch (error) {
        console.error('Erreur dans un observateur de thème:', error);
      }
    });
  }
}

// Exporter une instance singleton
const darkModeManager = new DarkModeManager();

export default darkModeManager;