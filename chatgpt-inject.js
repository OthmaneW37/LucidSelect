/**
 * chatgpt-inject.js - Script pour injecter le texte sélectionné dans le champ de saisie de ChatGPT
 * Version optimisée avec support pour Web Workers et compatibilité améliorée
 */

// Configuration et constantes
const DEBUG = false; // Mettre à true pour activer les logs détaillés
const MAX_ATTEMPTS = 25; // Nombre maximum de tentatives pour trouver le champ de saisie
const ATTEMPT_INTERVAL = 400; // Intervalle entre les tentatives (ms)

// Fonction de log conditionnelle
function log(...args) {
  if (DEBUG) {
    console.log('LucidSelect:', ...args);
  }
}

/**
 * Récupère et décode le texte depuis l'URL
 * Utilise plusieurs méthodes de décodage en cascade
 */
function getTextFromURL() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const text = urlParams.get('text');
    const mode = urlParams.get('mode') || 'default'; // Mode optionnel pour traitement spécifique
    
    log('Paramètre URL brut:', text);
    log('Mode:', mode);
    
    if (!text) {
      log('Aucun paramètre "text" trouvé dans l\'URL');
      return { text: null, mode };
    }
    
    // Priorité au décodage Base64 (méthode principale)
    try {
      const decodedBase64 = atob(text);
      log('Texte décodé (Base64):', decodedBase64);
      return { text: decodedBase64, mode };
    } catch (e) {
      log('Erreur avec décodage Base64:', e);
      
      // Méthode de secours 1: decodeURIComponent standard
      try {
        const decodedURI = decodeURIComponent(text);
        log('Texte décodé (URI):', decodedURI);
        return { text: decodedURI, mode };
      } catch (e2) {
        log('Erreur avec decodeURIComponent:', e2);
        
        // Méthode de secours 2: utiliser le texte brut
        log('Utilisation du texte brut:', text);
        return { text, mode };
      }
    }
  } catch (error) {
    console.error('LucidSelect: Erreur lors de la récupération du texte:', error);
    return { text: null, mode: 'default' };
  }
}

/**
 * Fonction principale pour insérer le texte dans le champ de saisie de ChatGPT
 * Gère différents modes d'insertion et types d'interfaces
 */
function insertTextIntoInput() {
  const { text, mode } = getTextFromURL();
  if (!text) return;
  
  log('Texte à insérer:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
  log('Mode d\'insertion:', mode);
  
  /**
   * Trouve et remplit le champ de saisie approprié
   * Prend en charge différentes versions de l'interface ChatGPT
   */
  function findAndFillInput() {
    // Sélecteurs pour les différentes versions de l'interface ChatGPT
    // Ordre de priorité: du plus spécifique au plus général
    const selectors = [
      '#prompt-textarea', // Sélecteur spécifique à ChatGPT 4
      'textarea[data-id="root"]', // Sélecteur pour certaines versions
      'textarea[placeholder*="Send a message"]', // Sélecteur basé sur le placeholder
      'textarea[placeholder*="message"]', // Plus général
      'div.stretch textarea', // Structure DOM courante
      'form textarea', // Structure générique
      'div[contenteditable="true"][role="textbox"]', // Pour les interfaces basées sur contenteditable
      'div[role="textbox"]', // Fallback pour les interfaces basées sur role
      'div[contenteditable="true"]', // Dernier recours pour contenteditable
      'textarea[placeholder]' // Dernier recours pour tout textarea avec placeholder
    ];
    
    let inputElement = null;
    
    // Essayer chaque sélecteur jusqu'à trouver un élément
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      // Prendre le dernier élément visible (généralement le champ de saisie actif)
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        if (element && isElementVisible(element)) {
          inputElement = element;
          log('Élément trouvé avec le sélecteur:', selector);
          break;
        }
      }
      if (inputElement) break;
    }
    
    if (!inputElement) {
      log('Aucun élément de saisie trouvé');
      return false;
    }
    
    log('Type d\'élément trouvé:', inputElement.tagName);
    
    // Adapter l'insertion selon le type d'élément
    if (inputElement.tagName.toLowerCase() === 'textarea') {
      log('Insertion dans textarea');
      // Préserver le texte existant si en mode append
      if (mode === 'append' && inputElement.value) {
        inputElement.value = inputElement.value + '\n\n' + text;
      } else {
        inputElement.value = text;
      }
      // Déclencher les événements nécessaires
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    } 
    // Pour les éléments contenteditable
    else if (inputElement.getAttribute('contenteditable') === 'true' || inputElement.getAttribute('role') === 'textbox') {
      log('Insertion dans div contenteditable/textbox');
      // Préserver le texte existant si en mode append
      if (mode === 'append' && inputElement.textContent.trim()) {
        inputElement.textContent = inputElement.textContent + '\n\n' + text;
      } else {
        inputElement.textContent = text;
      }
      // Déclencher les événements nécessaires
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Mettre le focus sur l'élément
    inputElement.focus();
    
    // Essayer de faire défiler jusqu'à l'élément pour s'assurer qu'il est visible
    try {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      log('Erreur lors du défilement:', e);
    }
    
    // Nettoyer l'URL pour éviter de réinsérer le texte lors d'un rechargement
    if (window.history && window.history.replaceState) {
      const newUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, newUrl);
    }
    
    return true;
  }
  
  /**
   * Vérifie si un élément est visible dans le DOM
   * @param {Element} element - L'élément à vérifier
   * @return {boolean} - true si l'élément est visible
   */
  function isElementVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }
  
  // Essayer immédiatement
  log('Premier essai d\'insertion');
  if (findAndFillInput()) {
    log('Insertion réussie au premier essai');
    return;
  }
  
  // Si ça ne fonctionne pas, essayer plusieurs fois avec un délai
  // car l'interface de ChatGPT peut prendre du temps à se charger
  log('Premier essai échoué, planification de nouvelles tentatives');
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    log(`Tentative ${attempts}/${MAX_ATTEMPTS}`);
    if (findAndFillInput()) {
      log(`Insertion réussie à la tentative ${attempts}`);
      clearInterval(interval);
      
      // Essayer de cliquer sur le bouton d'envoi si demandé
      if (mode === 'send') {
        setTimeout(tryClickSendButton, 500);
      }
    } else if (attempts >= MAX_ATTEMPTS) {
      log('Nombre maximum de tentatives atteint, abandon');
      clearInterval(interval);
    }
  }, ATTEMPT_INTERVAL);
}

/**
 * Essaie de cliquer sur le bouton d'envoi après insertion du texte
 */
function tryClickSendButton() {
  // Sélecteurs pour les boutons d'envoi
  const sendButtonSelectors = [
    'button[data-testid="send-button"]',
    'button.absolute.p-1.rounded-md',
    'form button[type="submit"]',
    'button svg path[d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"]',
    'button:has(svg)',
    'button.absolute',
    'button[aria-label="Send message"]'
  ];
  
  // Essayer chaque sélecteur
  for (const selector of sendButtonSelectors) {
    try {
      const buttons = document.querySelectorAll(selector);
      // Prendre le dernier bouton visible (généralement le plus pertinent)
      for (let i = buttons.length - 1; i >= 0; i--) {
        const button = buttons[i];
        if (button && !button.disabled && isButtonVisible(button)) {
          log('Bouton d\'envoi trouvé, tentative de clic');
          button.click();
          return true;
        }
      }
    } catch (e) {
      log('Erreur lors de la recherche du bouton d\'envoi:', e);
    }
  }
  
  log('Aucun bouton d\'envoi trouvé ou cliquable');
  return false;
}

/**
 * Vérifie si un bouton est visible et cliquable
 * @param {Element} button - Le bouton à vérifier
 * @return {boolean} - true si le bouton est visible et cliquable
 */
function isButtonVisible(button) {
  if (!button) return false;
  
  const style = window.getComputedStyle(button);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         button.offsetWidth > 0 &&
         button.offsetHeight > 0 &&
         !button.disabled;
}

// Exécuter la fonction lorsque le DOM est chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', insertTextIntoInput);
} else {
  insertTextIntoInput();
}

// Ajouter un gestionnaire d'événements pour les messages de l'extension
window.addEventListener('message', event => {
  // Vérifier que le message vient de notre extension
  if (event.data && event.data.type === 'LUCIDSELECT_INSERT_TEXT') {
    log('Message reçu de l\'extension:', event.data);
    
    // Simuler un paramètre d'URL pour réutiliser la logique existante
    const params = new URLSearchParams();
    params.set('text', event.data.text);
    if (event.data.mode) {
      params.set('mode', event.data.mode);
    }
    
    // Remplacer l'URL actuelle avec les nouveaux paramètres
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, document.title, newUrl);
    
    // Exécuter la fonction d'insertion
    insertTextIntoInput();
  }
});

// Notifier l'extension que le script est chargé et prêt
window.dispatchEvent(new CustomEvent('LUCIDSELECT_READY', { detail: { version: '1.1.0' } }));