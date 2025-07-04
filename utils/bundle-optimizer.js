/**
 * bundle-optimizer.js
 * Module pour optimiser la taille du bundle JavaScript de l'extension
 * en implémentant des techniques comme le code splitting et la minification.
 */

class BundleOptimizer {
  /**
   * Initialise l'optimiseur de bundle
   * @param {Object} options - Options de configuration
   * @param {boolean} options.useCodeSplitting - Activer le code splitting
   * @param {boolean} options.useLazyLoading - Activer le lazy loading
   * @param {boolean} options.useWebWorkers - Utiliser les Web Workers pour les tâches intensives
   */
  constructor(options = {}) {
    this.options = {
      useCodeSplitting: true,
      useLazyLoading: true,
      useWebWorkers: true,
      ...options
    };
    
    // Registre des modules chargés
    this.loadedModules = new Map();
    
    // Registre des Web Workers
    this.workers = new Map();
  }
  
  /**
   * Charge un module de manière dynamique avec code splitting
   * @param {string} modulePath - Chemin vers le module à charger
   * @returns {Promise<any>} - Promise résolue avec le module chargé
   */
  async loadModule(modulePath) {
    // Si le module est déjà chargé, retourner l'instance existante
    if (this.loadedModules.has(modulePath)) {
      return this.loadedModules.get(modulePath);
    }
    
    try {
      // Utiliser l'import dynamique pour le code splitting
      const module = await import(/* webpackChunkName: "[request]" */ modulePath);
      this.loadedModules.set(modulePath, module);
      return module;
    } catch (error) {
      console.error(`Erreur lors du chargement du module ${modulePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Charge un module uniquement lorsqu'il est nécessaire (lazy loading)
   * @param {string} modulePath - Chemin vers le module à charger
   * @param {Function} condition - Fonction qui détermine si le module doit être chargé
   * @returns {Promise<any>} - Promise résolue avec le module chargé ou null si la condition n'est pas remplie
   */
  async loadModuleIfNeeded(modulePath, condition) {
    if (typeof condition === 'function' && !condition()) {
      return null;
    }
    
    return this.loadModule(modulePath);
  }
  
  /**
   * Crée ou récupère un Web Worker pour exécuter des tâches intensives
   * @param {string} workerPath - Chemin vers le script du Web Worker
   * @returns {Worker} - Instance du Web Worker
   */
  getWorker(workerPath) {
    if (!this.options.useWebWorkers) {
      throw new Error('Les Web Workers sont désactivés dans les options');
    }
    
    if (this.workers.has(workerPath)) {
      return this.workers.get(workerPath);
    }
    
    const worker = new Worker(workerPath);
    this.workers.set(workerPath, worker);
    return worker;
  }
  
  /**
   * Exécute une tâche dans un Web Worker
   * @param {string} workerPath - Chemin vers le script du Web Worker
   * @param {any} data - Données à envoyer au Worker
   * @returns {Promise<any>} - Promise résolue avec le résultat du Worker
   */
  executeInWorker(workerPath, data) {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker(workerPath);
      
      const messageHandler = (event) => {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        resolve(event.data);
      };
      
      const errorHandler = (error) => {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(error);
      };
      
      worker.addEventListener('message', messageHandler);
      worker.addEventListener('error', errorHandler);
      worker.postMessage(data);
    });
  }
  
  /**
   * Termine tous les Web Workers actifs
   */
  terminateAllWorkers() {
    for (const worker of this.workers.values()) {
      worker.terminate();
    }
    this.workers.clear();
  }
  
  /**
   * Précharge un ensemble de modules pour améliorer les performances
   * @param {string[]} modulePaths - Chemins vers les modules à précharger
   * @returns {Promise<void>} - Promise résolue lorsque tous les modules sont préchargés
   */
  async preloadModules(modulePaths) {
    const promises = modulePaths.map(path => this.loadModule(path));
    await Promise.all(promises);
  }
  
  /**
   * Libère les ressources d'un module pour économiser de la mémoire
   * @param {string} modulePath - Chemin du module à libérer
   */
  unloadModule(modulePath) {
    if (this.loadedModules.has(modulePath)) {
      this.loadedModules.delete(modulePath);
    }
  }
  
  /**
   * Charge un module avec une stratégie de retry en cas d'échec
   * @param {string} modulePath - Chemin vers le module à charger
   * @param {number} maxRetries - Nombre maximum de tentatives
   * @param {number} retryDelay - Délai entre les tentatives (en ms)
   * @returns {Promise<any>} - Promise résolue avec le module chargé
   */
  async loadModuleWithRetry(modulePath, maxRetries = 3, retryDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.loadModule(modulePath);
      } catch (error) {
        console.warn(`Tentative ${attempt + 1}/${maxRetries} échouée pour charger ${modulePath}:`, error);
        lastError = error;
        
        if (attempt < maxRetries - 1) {
          // Attendre avant la prochaine tentative
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw new Error(`Échec du chargement du module ${modulePath} après ${maxRetries} tentatives: ${lastError}`);
  }
}

// Exporter la classe pour une utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BundleOptimizer;
} else if (typeof window !== 'undefined') {
  window.BundleOptimizer = BundleOptimizer;
}