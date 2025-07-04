// notifications.js - Module pour gérer les notifications dans l'interface utilisateur

import PerformanceManager from '../utils/performance.js';

/**
 * Classe pour gérer les notifications dans l'interface utilisateur
 */
class NotificationsManager {
  /**
   * Initialise le gestionnaire de notifications
   */
  constructor() {
    this.container = null;
    this.notifications = [];
    this.notificationIdCounter = 0;
    
    // Utiliser le throttle pour éviter trop de notifications simultanées
    this.throttledShowNotification = PerformanceManager.throttle(this.showNotification.bind(this), 300);
  }

  /**
   * Initialise le gestionnaire de notifications
   * @returns {void}
   */
  init() {
    // Créer le conteneur de notifications s'il n'existe pas
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notifications-container';
      document.body.appendChild(this.container);
    }
    
    // Ajouter l'écouteur d'événement pour les notifications
    document.addEventListener('showNotification', (event) => {
      const { message, type, duration } = event.detail;
      this.throttledShowNotification(message, type, duration);
    });
  }

  /**
   * Affiche une notification
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (info, success, error, warning)
   * @param {number} duration - Durée d'affichage en ms
   * @returns {string} ID de la notification
   */
  showNotification(message, type = 'info', duration = 3000) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Générer un ID unique pour la notification
    const notificationId = `notification-${Date.now()}-${this.notificationIdCounter++}`;
    notification.id = notificationId;
    
    // Ajouter l'icône en fonction du type
    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    
    switch (type) {
      case 'success':
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        break;
      case 'error':
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        break;
      case 'warning':
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
        break;
      default: // info
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
    }
    
    // Ajouter le message
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;
    
    // Ajouter le bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    closeButton.addEventListener('click', () => this.removeNotification(notificationId));
    
    // Assembler la notification
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeButton);
    
    // Ajouter la notification au conteneur
    this.container.appendChild(notification);
    
    // Ajouter la notification à la liste
    this.notifications.push({
      id: notificationId,
      element: notification,
      timeoutId: setTimeout(() => this.removeNotification(notificationId), duration)
    });
    
    // Ajouter une classe pour l'animation d'entrée
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    return notificationId;
  }

  /**
   * Supprime une notification
   * @param {string} notificationId - ID de la notification
   * @returns {void}
   */
  removeNotification(notificationId) {
    // Trouver la notification dans la liste
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) return;
    
    const notification = this.notifications[notificationIndex];
    
    // Annuler le timeout
    clearTimeout(notification.timeoutId);
    
    // Ajouter une classe pour l'animation de sortie
    notification.element.classList.remove('show');
    notification.element.classList.add('hide');
    
    // Supprimer la notification après l'animation
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      
      // Supprimer la notification de la liste
      this.notifications.splice(notificationIndex, 1);
    }, 300);
  }

  /**
   * Supprime toutes les notifications
   * @returns {void}
   */
  clearAllNotifications() {
    // Copier la liste des notifications pour éviter les problèmes de modification pendant l'itération
    const notificationIds = this.notifications.map(n => n.id);
    
    // Supprimer chaque notification
    notificationIds.forEach(id => this.removeNotification(id));
  }
}

// Exporter une instance singleton
const notificationsManager = new NotificationsManager();
export default notificationsManager;