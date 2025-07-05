/**
 * theme-switcher.js - Composant pour changer entre les thèmes clair et sombre
 */

import { ThemeManager } from '../utils/dark-mode.js';

class ThemeSwitcher {
  constructor(containerId = 'theme-switcher-container') {
    this.containerId = containerId;
    this.themeManager = new ThemeManager();
    this.container = null;
    this.switcherElement = null;
  }

  /**
   * Initialise le sélecteur de thème
   */
  async init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Créer ou trouver le conteneur
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.containerId;
      document.body.appendChild(this.container);
    }

    // Initialiser le gestionnaire de thème
    await this.themeManager.init();

    // Créer l'interface utilisateur
    this.render();

    // Ajouter les écouteurs d'événements
    this.addEventListeners();
  }

  /**
   * Crée l'interface utilisateur du sélecteur de thème
   */
  render() {
    const currentTheme = this.themeManager.getCurrentTheme();
    
    this.container.innerHTML = `
      <div class="theme-switcher">
        <div class="theme-switcher-label">Thème</div>
        <div class="theme-options">
          <label class="theme-option ${currentTheme === 'light' ? 'active' : ''}">
            <input type="radio" name="theme" value="light" ${currentTheme === 'light' ? 'checked' : ''}>
            <span class="theme-icon light-icon">☀️</span>
            <span class="theme-name">Clair</span>
          </label>
          <label class="theme-option ${currentTheme === 'dark' ? 'active' : ''}">
            <input type="radio" name="theme" value="dark" ${currentTheme === 'dark' ? 'checked' : ''}>
            <span class="theme-icon dark-icon">🌙</span>
            <span class="theme-name">Sombre</span>
          </label>
          <label class="theme-option ${currentTheme === 'system' ? 'active' : ''}">
            <input type="radio" name="theme" value="system" ${currentTheme === 'system' ? 'checked' : ''}>
            <span class="theme-icon system-icon">💻</span>
            <span class="theme-name">Système</span>
          </label>
        </div>
      </div>
    `;

    // Ajouter les styles CSS
    this.addStyles();
  }

  /**
   * Ajoute les styles CSS pour le sélecteur de thème
   */
  addStyles() {
    const styleId = 'theme-switcher-styles';
    
    // Vérifier si les styles existent déjà
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        .theme-switcher {
          display: flex;
          flex-direction: column;
          margin: 10px 0;
          padding: 10px;
          border-radius: 8px;
          background-color: var(--background-secondary, #f5f5f5);
        }
        
        .theme-switcher-label {
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--text-primary, #333);
        }
        
        .theme-options {
          display: flex;
          gap: 10px;
        }
        
        .theme-option {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          background-color: var(--background-tertiary, #e9e9e9);
        }
        
        .theme-option:hover {
          background-color: var(--accent-hover, #d0d0d0);
        }
        
        .theme-option.active {
          background-color: var(--accent-primary, #7c4dff);
          color: white;
        }
        
        .theme-option input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .theme-icon {
          margin-right: 6px;
          font-size: 16px;
        }
        
        .theme-name {
          font-size: 14px;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }

  /**
   * Ajoute les écouteurs d'événements pour le sélecteur de thème
   */
  addEventListeners() {
    const radioButtons = this.container.querySelectorAll('input[name="theme"]');
    
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (event) => {
        const newTheme = event.target.value;
        this.themeManager.setTheme(newTheme);
        
        // Mettre à jour l'interface utilisateur
        const options = this.container.querySelectorAll('.theme-option');
        options.forEach(option => {
          const input = option.querySelector('input');
          if (input.value === newTheme) {
            option.classList.add('active');
          } else {
            option.classList.remove('active');
          }
        });
      });
    });

    // Écouter les changements de thème externes
    this.themeManager.addObserver(() => {
      this.render();
    });
  }
}

export default ThemeSwitcher;