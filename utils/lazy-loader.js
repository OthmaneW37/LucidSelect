/**
 * lazy-loader.js
 * Module pour gérer le chargement paresseux (lazy loading) des ressources
 * afin d'optimiser les performances de l'extension.
 */

class LazyLoader {
  /**
   * Charge un module JavaScript de manière asynchrone
   * @param {string} path - Chemin vers le fichier JavaScript à charger
   * @returns {Promise<any>} - Promise résolue lorsque le module est chargé
   */
  static async loadScript(path) {
    return new Promise((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      if (document.querySelector(`script[src="${path}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = path;
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = (error) => reject(new Error(`Erreur lors du chargement du script ${path}: ${error}`));
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Charge une feuille de style CSS de manière asynchrone
   * @param {string} path - Chemin vers le fichier CSS à charger
   * @returns {Promise<void>} - Promise résolue lorsque la feuille de style est chargée
   */
  static async loadStylesheet(path) {
    return new Promise((resolve, reject) => {
      // Vérifier si la feuille de style est déjà chargée
      if (document.querySelector(`link[href="${path}"]`)) {
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      
      link.onload = () => resolve();
      link.onerror = (error) => reject(new Error(`Erreur lors du chargement de la feuille de style ${path}: ${error}`));
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Charge un module ES6 de manière dynamique
   * @param {string} path - Chemin vers le module à charger
   * @returns {Promise<any>} - Promise résolue avec le module importé
   */
  static async loadModule(path) {
    try {
      return await import(path);
    } catch (error) {
      console.error(`Erreur lors du chargement du module ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * Charge un contenu HTML dans un élément cible
   * @param {string} path - Chemin vers le fichier HTML à charger
   * @param {HTMLElement|string} target - Élément ou sélecteur de l'élément où insérer le contenu
   * @param {boolean} executeScripts - Si true, exécute les scripts contenus dans le HTML
   * @returns {Promise<void>} - Promise résolue lorsque le contenu est chargé
   */
  static async loadHTML(path, target, executeScripts = false) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Récupérer l'élément cible
      const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
      if (!targetElement) {
        throw new Error(`Élément cible non trouvé: ${target}`);
      }
      
      // Insérer le contenu HTML
      targetElement.innerHTML = doc.body.innerHTML;
      
      // Exécuter les scripts si demandé
      if (executeScripts) {
        const scripts = doc.querySelectorAll('script');
        for (const script of scripts) {
          if (script.src) {
            await this.loadScript(script.src);
          } else {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
          }
        }
      }
      
      return targetElement;
    } catch (error) {
      console.error(`Erreur lors du chargement du contenu HTML ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * Charge une image de manière asynchrone
   * @param {string} src - URL de l'image à charger
   * @returns {Promise<HTMLImageElement>} - Promise résolue avec l'élément image chargé
   */
  static loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(new Error(`Erreur lors du chargement de l'image ${src}: ${error}`));
      img.src = src;
    });
  }
  
  /**
   * Précharge un ensemble de ressources en parallèle
   * @param {Object} resources - Objet contenant les ressources à précharger
   * @param {string[]} resources.scripts - Chemins des scripts à précharger
   * @param {string[]} resources.stylesheets - Chemins des feuilles de style à précharger
   * @param {string[]} resources.images - Chemins des images à précharger
   * @returns {Promise<void>} - Promise résolue lorsque toutes les ressources sont préchargées
   */
  static async preloadResources({ scripts = [], stylesheets = [], images = [] }) {
    const promises = [];
    
    // Précharger les scripts
    for (const script of scripts) {
      promises.push(this.loadScript(script));
    }
    
    // Précharger les feuilles de style
    for (const stylesheet of stylesheets) {
      promises.push(this.loadStylesheet(stylesheet));
    }
    
    // Précharger les images
    for (const image of images) {
      promises.push(this.loadImage(image));
    }
    
    await Promise.all(promises);
  }
  
  /**
   * Charge un composant (HTML + CSS + JS) de manière asynchrone
   * @param {string} name - Nom du composant à charger
   * @param {string} basePath - Chemin de base pour les composants
   * @param {HTMLElement|string} target - Élément ou sélecteur de l'élément où insérer le composant
   * @returns {Promise<HTMLElement>} - Promise résolue avec l'élément du composant
   */
  static async loadComponent(name, basePath = '../components', target) {
    try {
      // Charger le HTML du composant
      const htmlPath = `${basePath}/${name}/${name}.html`;
      const element = await this.loadHTML(htmlPath, target, false);
      
      // Charger le CSS du composant
      const cssPath = `${basePath}/${name}/${name}.css`;
      await this.loadStylesheet(cssPath).catch(() => {
        console.log(`Pas de fichier CSS trouvé pour le composant ${name}`);
      });
      
      // Charger le JS du composant
      const jsPath = `${basePath}/${name}/${name}.js`;
      await this.loadScript(jsPath).catch(() => {
        console.log(`Pas de fichier JS trouvé pour le composant ${name}`);
      });
      
      return element;
    } catch (error) {
      console.error(`Erreur lors du chargement du composant ${name}:`, error);
      throw error;
    }
  }
}

// Exporter la classe pour une utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoader;
} else if (typeof window !== 'undefined') {
  window.LazyLoader = LazyLoader;
}