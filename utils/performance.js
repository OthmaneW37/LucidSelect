// performance.js - Module d'optimisation des performances

/**
 * Classe pour gérer les optimisations de performance
 */
class PerformanceManager {
  /**
   * Charge un module de manière asynchrone (lazy loading)
   * @param {string} modulePath - Chemin vers le module à charger
   * @returns {Promise<any>} Module chargé
   */
  static async lazyLoadModule(modulePath) {
    try {
      const module = await import(chrome.runtime.getURL(modulePath));
      return module.default || module;
    } catch (error) {
      console.error(`Erreur lors du chargement du module ${modulePath}:`, error);
      throw error;
    }
  }

  /**
   * Crée et initialise un Web Worker
   * @param {string} workerScript - Chemin vers le script du worker
   * @returns {Worker} Instance du Web Worker
   */
  static createWorker(workerScript) {
    const workerUrl = chrome.runtime.getURL(workerScript);
    return new Worker(workerUrl);
  }

  /**
   * Exécute une tâche dans un Web Worker
   * @param {string} workerScript - Chemin vers le script du worker
   * @param {Object} data - Données à envoyer au worker
   * @returns {Promise<any>} Résultat de la tâche
   */
  static executeInWorker(workerScript, data) {
    return new Promise((resolve, reject) => {
      const worker = this.createWorker(workerScript);
      
      // Écouter les messages du worker
      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate(); // Terminer le worker après utilisation
      };
      
      // Écouter les erreurs
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
      
      // Envoyer les données au worker
      worker.postMessage(data);
    });
  }

  /**
   * Applique la technique de debounce à une fonction
   * @param {Function} func - Fonction à debouncer
   * @param {number} wait - Délai d'attente en ms
   * @returns {Function} Fonction debouncée
   */
  static debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Applique la technique de throttle à une fonction
   * @param {Function} func - Fonction à throttler
   * @param {number} limit - Limite de temps en ms
   * @returns {Function} Fonction throttlée
   */
  static throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   * @param {Function} func - Fonction à mesurer
   * @param {Array} args - Arguments de la fonction
   * @returns {Promise<Object>} Résultat et temps d'exécution
   */
  static async measurePerformance(func, ...args) {
    const start = performance.now();
    
    try {
      const result = await func(...args);
      const end = performance.now();
      
      return {
        result,
        executionTime: end - start
      };
    } catch (error) {
      const end = performance.now();
      
      return {
        error,
        executionTime: end - start
      };
    }
  }
}

export default PerformanceManager;