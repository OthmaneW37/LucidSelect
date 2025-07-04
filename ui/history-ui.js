// history-ui.js - Interface utilisateur pour gérer l'historique des requêtes

import { getHistory, clearHistory, exportHistory, searchHistory } from '../utils/history.js';
import multilingualUI from './multilingual-ui.js';
import PerformanceManager from '../utils/performance.js';
import { MAX_HISTORY_ITEMS } from '../utils/constants.js';

/**
 * Classe pour gérer l'interface utilisateur de l'historique
 */
class HistoryUI {
  /**
   * Initialise l'interface de l'historique
   */
  constructor() {
    this.history = [];
    this.container = null;
    this.historyList = null;
    this.detailPanel = null;
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.selectedItemId = null;
    
    // Utiliser le debounce pour la recherche
    this.debouncedSearch = PerformanceManager.debounce(this.performSearch.bind(this), 300);
  }

  /**
   * Initialise l'interface utilisateur de l'historique
   * @param {HTMLElement} container - Conteneur pour l'interface
   * @returns {Promise<void>}
   */
  async init(container) {
    this.container = container || document.getElementById('history-container');
    
    if (!this.container) {
      console.error('Conteneur pour l\'historique non trouvé');
      return;
    }
    
    // Charger l'historique
    await this.loadHistory();
    
    // Créer l'interface
    this.createUI();
    
    // Ajouter les écouteurs d'événements
    this.setupEventListeners();
    
    // Écouter les changements de langue
    document.addEventListener('languageChanged', () => this.updateUITranslations());
  }

  /**
   * Charge l'historique depuis le stockage
   * @returns {Promise<void>}
   */
  async loadHistory() {
    try {
      this.history = await getHistory();
      this.totalPages = Math.ceil(this.history.length / this.itemsPerPage) || 1;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      this.history = [];
      this.totalPages = 1;
    }
  }

  /**
   * Crée l'interface utilisateur
   */
  createUI() {
    // Vider le conteneur
    this.container.innerHTML = '';
    
    // Créer le titre
    const title = multilingualUI.createTranslatedElement('h2', 'history.title', { class: 'section-title' });
    this.container.appendChild(title);
    
    // Créer la barre d'outils
    const toolbar = document.createElement('div');
    toolbar.className = 'history-toolbar';
    
    // Barre de recherche
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'history-search';
    searchInput.className = 'search-input';
    searchInput.setAttribute('data-i18n-placeholder', 'history.search_placeholder');
    searchInput.placeholder = multilingualUI.translate('history.search_placeholder');
    
    searchContainer.appendChild(searchInput);
    toolbar.appendChild(searchContainer);
    
    // Boutons d'action
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    const exportButton = document.createElement('button');
    exportButton.id = 'export-history-button';
    exportButton.className = 'secondary-button';
    exportButton.setAttribute('data-i18n', 'history.export_button');
    exportButton.textContent = multilingualUI.translate('history.export_button');
    
    const clearButton = document.createElement('button');
    clearButton.id = 'clear-history-button';
    clearButton.className = 'danger-button';
    clearButton.setAttribute('data-i18n', 'history.clear_button');
    clearButton.textContent = multilingualUI.translate('history.clear_button');
    
    actionButtons.appendChild(exportButton);
    actionButtons.appendChild(clearButton);
    toolbar.appendChild(actionButtons);
    
    this.container.appendChild(toolbar);
    
    // Créer la section principale
    const mainSection = document.createElement('div');
    mainSection.className = 'history-main-section';
    
    // Liste de l'historique
    this.historyList = document.createElement('div');
    this.historyList.className = 'history-list';
    mainSection.appendChild(this.historyList);
    
    // Panneau de détails
    this.detailPanel = document.createElement('div');
    this.detailPanel.className = 'history-detail-panel';
    mainSection.appendChild(this.detailPanel);
    
    this.container.appendChild(mainSection);
    
    // Créer la pagination
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    const prevButton = document.createElement('button');
    prevButton.id = 'prev-page-button';
    prevButton.className = 'pagination-button';
    prevButton.innerHTML = '&laquo;';
    prevButton.setAttribute('data-i18n-title', 'history.prev_page');
    prevButton.title = multilingualUI.translate('history.prev_page');
    
    const pageInfo = document.createElement('span');
    pageInfo.id = 'page-info';
    pageInfo.className = 'page-info';
    
    const nextButton = document.createElement('button');
    nextButton.id = 'next-page-button';
    nextButton.className = 'pagination-button';
    nextButton.innerHTML = '&raquo;';
    nextButton.setAttribute('data-i18n-title', 'history.next_page');
    nextButton.title = multilingualUI.translate('history.next_page');
    
    pagination.appendChild(prevButton);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextButton);
    
    this.container.appendChild(pagination);
    
    // Afficher l'historique
    this.renderHistoryList();
    this.updatePagination();
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Écouteur pour le bouton d'exportation
    const exportButton = document.getElementById('export-history-button');
    if (exportButton) {
      exportButton.addEventListener('click', () => this.showExportOptions());
    }
    
    // Écouteur pour le bouton de suppression
    const clearButton = document.getElementById('clear-history-button');
    if (clearButton) {
      clearButton.addEventListener('click', () => this.confirmClearHistory());
    }
    
    // Écouteur pour la recherche
    const searchInput = document.getElementById('history-search');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        this.debouncedSearch(event.target.value);
      });
    }
    
    // Écouteurs pour la pagination
    const prevButton = document.getElementById('prev-page-button');
    const nextButton = document.getElementById('next-page-button');
    
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderHistoryList();
          this.updatePagination();
        }
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.renderHistoryList();
          this.updatePagination();
        }
      });
    }
  }

  /**
   * Affiche la liste de l'historique
   * @param {Array} historyToShow - Liste de l'historique à afficher (optionnel)
   */
  renderHistoryList(historyToShow = null) {
    const history = historyToShow || this.history;
    
    // Vider la liste
    this.historyList.innerHTML = '';
    
    if (history.length === 0) {
      const emptyMessage = multilingualUI.createTranslatedElement('p', 'history.empty_list', { class: 'empty-message' });
      this.historyList.appendChild(emptyMessage);
      this.detailPanel.innerHTML = '';
      return;
    }
    
    // Calculer les indices de début et de fin pour la pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, history.length);
    
    // Créer un élément pour chaque entrée de l'historique
    for (let i = startIndex; i < endIndex; i++) {
      const item = history[i];
      const itemElement = document.createElement('div');
      itemElement.className = 'history-item';
      itemElement.dataset.id = item.id;
      
      if (item.id === this.selectedItemId) {
        itemElement.classList.add('selected');
      }
      
      const itemDate = new Date(item.timestamp);
      const formattedDate = itemDate.toLocaleDateString();
      const formattedTime = itemDate.toLocaleTimeString();
      
      const itemHeader = document.createElement('div');
      itemHeader.className = 'history-item-header';
      
      const itemTitle = document.createElement('h3');
      itemTitle.className = 'history-item-title';
      itemTitle.textContent = item.prompt.length > 50 
        ? item.prompt.substring(0, 50) + '...'
        : item.prompt;
      
      const itemTimestamp = document.createElement('span');
      itemTimestamp.className = 'history-item-timestamp';
      itemTimestamp.textContent = `${formattedDate} ${formattedTime}`;
      
      itemHeader.appendChild(itemTitle);
      itemHeader.appendChild(itemTimestamp);
      
      const itemType = document.createElement('div');
      itemType.className = 'history-item-type';
      itemType.textContent = multilingualUI.translate(`history.type.${item.type}`) || item.type;
      
      itemElement.appendChild(itemHeader);
      itemElement.appendChild(itemType);
      
      // Ajouter l'écouteur d'événement pour afficher les détails
      itemElement.addEventListener('click', () => {
        this.showItemDetails(item.id);
        
        // Mettre à jour la sélection
        const selectedItems = this.historyList.querySelectorAll('.history-item.selected');
        selectedItems.forEach(el => el.classList.remove('selected'));
        itemElement.classList.add('selected');
      });
      
      this.historyList.appendChild(itemElement);
    }
    
    // Si aucun élément n'est sélectionné et qu'il y a des éléments dans l'historique,
    // sélectionner le premier élément
    if (!this.selectedItemId && history.length > 0) {
      this.showItemDetails(history[startIndex].id);
      const firstItem = this.historyList.querySelector('.history-item');
      if (firstItem) {
        firstItem.classList.add('selected');
      }
    }
  }

  /**
   * Met à jour les informations de pagination
   */
  updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page-button');
    const nextButton = document.getElementById('next-page-button');
    
    if (pageInfo) {
      pageInfo.textContent = multilingualUI.translate('history.page_info', {
        current: this.currentPage,
        total: this.totalPages
      });
    }
    
    if (prevButton) {
      prevButton.disabled = this.currentPage <= 1;
    }
    
    if (nextButton) {
      nextButton.disabled = this.currentPage >= this.totalPages;
    }
  }

  /**
   * Affiche les détails d'un élément de l'historique
   * @param {string} itemId - ID de l'élément
   */
  showItemDetails(itemId) {
    const item = this.history.find(h => h.id === itemId);
    
    if (!item) {
      console.error('Élément d\'historique non trouvé:', itemId);
      return;
    }
    
    this.selectedItemId = itemId;
    
    // Vider le panneau de détails
    this.detailPanel.innerHTML = '';
    
    // Créer le titre
    const detailTitle = document.createElement('h3');
    detailTitle.className = 'detail-title';
    detailTitle.setAttribute('data-i18n', 'history.detail_title');
    detailTitle.textContent = multilingualUI.translate('history.detail_title');
    this.detailPanel.appendChild(detailTitle);
    
    // Informations sur la requête
    const requestSection = document.createElement('div');
    requestSection.className = 'detail-section';
    
    const requestTitle = document.createElement('h4');
    requestTitle.setAttribute('data-i18n', 'history.request_title');
    requestTitle.textContent = multilingualUI.translate('history.request_title');
    
    const requestType = document.createElement('p');
    requestType.className = 'detail-type';
    requestType.innerHTML = `<strong>${multilingualUI.translate('history.type_label')}:</strong> ${multilingualUI.translate(`history.type.${item.type}`) || item.type}`;
    
    const requestDate = document.createElement('p');
    requestDate.className = 'detail-date';
    const itemDate = new Date(item.timestamp);
    requestDate.innerHTML = `<strong>${multilingualUI.translate('history.date_label')}:</strong> ${itemDate.toLocaleString()}`;
    
    const requestModel = document.createElement('p');
    requestModel.className = 'detail-model';
    requestModel.innerHTML = `<strong>${multilingualUI.translate('history.model_label')}:</strong> ${item.model || multilingualUI.translate('history.unknown_model')}`;
    
    const requestContent = document.createElement('div');
    requestContent.className = 'detail-content';
    
    const requestLabel = document.createElement('p');
    requestLabel.className = 'detail-label';
    requestLabel.innerHTML = `<strong>${multilingualUI.translate('history.prompt_label')}:</strong>`;
    
    const requestText = document.createElement('pre');
    requestText.className = 'detail-text';
    requestText.textContent = item.prompt;
    
    requestContent.appendChild(requestLabel);
    requestContent.appendChild(requestText);
    
    requestSection.appendChild(requestTitle);
    requestSection.appendChild(requestType);
    requestSection.appendChild(requestDate);
    requestSection.appendChild(requestModel);
    requestSection.appendChild(requestContent);
    
    // Informations sur la réponse
    const responseSection = document.createElement('div');
    responseSection.className = 'detail-section';
    
    const responseTitle = document.createElement('h4');
    responseTitle.setAttribute('data-i18n', 'history.response_title');
    responseTitle.textContent = multilingualUI.translate('history.response_title');
    
    const responseContent = document.createElement('div');
    responseContent.className = 'detail-content';
    
    const responseLabel = document.createElement('p');
    responseLabel.className = 'detail-label';
    responseLabel.innerHTML = `<strong>${multilingualUI.translate('history.response_label')}:</strong>`;
    
    const responseText = document.createElement('pre');
    responseText.className = 'detail-text';
    responseText.textContent = item.response;
    
    responseContent.appendChild(responseLabel);
    responseContent.appendChild(responseText);
    
    responseSection.appendChild(responseTitle);
    responseSection.appendChild(responseContent);
    
    // Boutons d'action
    const actionButtons = document.createElement('div');
    actionButtons.className = 'detail-actions';
    
    const reuseButton = document.createElement('button');
    reuseButton.className = 'primary-button';
    reuseButton.setAttribute('data-i18n', 'history.reuse_button');
    reuseButton.textContent = multilingualUI.translate('history.reuse_button');
    reuseButton.addEventListener('click', () => this.reusePrompt(item));
    
    const copyPromptButton = document.createElement('button');
    copyPromptButton.className = 'secondary-button';
    copyPromptButton.setAttribute('data-i18n', 'history.copy_prompt_button');
    copyPromptButton.textContent = multilingualUI.translate('history.copy_prompt_button');
    copyPromptButton.addEventListener('click', () => this.copyToClipboard(item.prompt, 'history.prompt_copied'));
    
    const copyResponseButton = document.createElement('button');
    copyResponseButton.className = 'secondary-button';
    copyResponseButton.setAttribute('data-i18n', 'history.copy_response_button');
    copyResponseButton.textContent = multilingualUI.translate('history.copy_response_button');
    copyResponseButton.addEventListener('click', () => this.copyToClipboard(item.response, 'history.response_copied'));
    
    actionButtons.appendChild(reuseButton);
    actionButtons.appendChild(copyPromptButton);
    actionButtons.appendChild(copyResponseButton);
    
    // Ajouter les sections au panneau de détails
    this.detailPanel.appendChild(requestSection);
    this.detailPanel.appendChild(responseSection);
    this.detailPanel.appendChild(actionButtons);
  }

  /**
   * Réutilise un prompt de l'historique
   * @param {Object} item - Élément de l'historique
   */
  reusePrompt(item) {
    // Créer un événement personnalisé pour informer l'application
    const event = new CustomEvent('reusePrompt', { detail: { prompt: item.prompt, type: item.type } });
    document.dispatchEvent(event);
    
    // Afficher un message de confirmation
    this.showNotification(multilingualUI.translate('history.prompt_reused'));
  }

  /**
   * Copie un texte dans le presse-papiers
   * @param {string} text - Texte à copier
   * @param {string} notificationKey - Clé de traduction pour la notification
   */
  copyToClipboard(text, notificationKey) {
    navigator.clipboard.writeText(text)
      .then(() => {
        this.showNotification(multilingualUI.translate(notificationKey));
      })
      .catch(error => {
        console.error('Erreur lors de la copie dans le presse-papiers:', error);
        this.showNotification(multilingualUI.translate('history.copy_error'), 'error');
      });
  }

  /**
   * Affiche une notification
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (info, success, error)
   */
  showNotification(message, type = 'success') {
    // Créer un événement personnalisé pour afficher une notification
    const event = new CustomEvent('showNotification', { 
      detail: { message, type }
    });
    document.dispatchEvent(event);
  }

  /**
   * Demande confirmation avant de vider l'historique
   */
  confirmClearHistory() {
    const confirmMessage = multilingualUI.translate('history.clear_confirm');
    
    if (confirm(confirmMessage)) {
      this.clearHistoryData();
    }
  }

  /**
   * Vide l'historique
   * @returns {Promise<void>}
   */
  async clearHistoryData() {
    try {
      await clearHistory();
      
      // Recharger l'historique
      await this.loadHistory();
      
      // Mettre à jour l'interface
      this.currentPage = 1;
      this.selectedItemId = null;
      this.renderHistoryList();
      this.updatePagination();
      
      // Afficher un message de confirmation
      this.showNotification(multilingualUI.translate('history.clear_success'));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
      this.showNotification(multilingualUI.translate('history.clear_error'), 'error');
    }
  }

  /**
   * Affiche les options d'exportation de l'historique
   */
  showExportOptions() {
    // Créer un menu contextuel pour les options d'exportation
    const exportMenu = document.createElement('div');
    exportMenu.className = 'export-menu';
    
    const jsonOption = document.createElement('button');
    jsonOption.className = 'export-option';
    jsonOption.setAttribute('data-i18n', 'history.export_json');
    jsonOption.textContent = multilingualUI.translate('history.export_json');
    jsonOption.addEventListener('click', () => {
      this.exportHistoryData('json');
      document.body.removeChild(exportMenu);
    });
    
    const csvOption = document.createElement('button');
    csvOption.className = 'export-option';
    csvOption.setAttribute('data-i18n', 'history.export_csv');
    csvOption.textContent = multilingualUI.translate('history.export_csv');
    csvOption.addEventListener('click', () => {
      this.exportHistoryData('csv');
      document.body.removeChild(exportMenu);
    });
    
    exportMenu.appendChild(jsonOption);
    exportMenu.appendChild(csvOption);
    
    // Positionner le menu près du bouton d'exportation
    const exportButton = document.getElementById('export-history-button');
    const rect = exportButton.getBoundingClientRect();
    
    exportMenu.style.position = 'absolute';
    exportMenu.style.top = `${rect.bottom + window.scrollY}px`;
    exportMenu.style.left = `${rect.left + window.scrollX}px`;
    
    // Ajouter le menu au document
    document.body.appendChild(exportMenu);
    
    // Fermer le menu si on clique ailleurs
    const closeMenu = (event) => {
      if (!exportMenu.contains(event.target) && event.target !== exportButton) {
        document.body.removeChild(exportMenu);
        document.removeEventListener('click', closeMenu);
      }
    };
    
    // Ajouter l'écouteur d'événement avec un délai pour éviter qu'il se déclenche immédiatement
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);
  }

  /**
   * Exporte l'historique dans un fichier
   * @param {string} format - Format d'exportation (json, csv)
   * @returns {Promise<void>}
   */
  async exportHistoryData(format) {
    try {
      const data = await exportHistory(format);
      
      // Créer un objet Blob
      let blob;
      let filename;
      
      if (format === 'json') {
        blob = new Blob([data], { type: 'application/json' });
        filename = `lucidselect_history_${new Date().toISOString().split('T')[0]}.json`;
      } else if (format === 'csv') {
        blob = new Blob([data], { type: 'text/csv' });
        filename = `lucidselect_history_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        throw new Error('Format non supporté');
      }
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Afficher un message de confirmation
      this.showNotification(multilingualUI.translate('history.export_success'));
    } catch (error) {
      console.error('Erreur lors de l\'exportation de l\'historique:', error);
      this.showNotification(multilingualUI.translate('history.export_error'), 'error');
    }
  }

  /**
   * Effectue une recherche dans l'historique
   * @param {string} query - Terme de recherche
   * @returns {Promise<void>}
   */
  async performSearch(query) {
    try {
      if (!query.trim()) {
        // Si la recherche est vide, afficher tout l'historique
        await this.loadHistory();
      } else {
        // Sinon, effectuer la recherche
        this.history = await searchHistory(query);
      }
      
      // Réinitialiser la pagination
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.history.length / this.itemsPerPage) || 1;
      
      // Mettre à jour l'interface
      this.renderHistoryList();
      this.updatePagination();
    } catch (error) {
      console.error('Erreur lors de la recherche dans l\'historique:', error);
    }
  }

  /**
   * Met à jour les traductions de l'interface
   */
  updateUITranslations() {
    // Mettre à jour les éléments avec des attributs data-i18n
    multilingualUI.updateUI();
    
    // Mettre à jour les éléments spécifiques
    const searchInput = document.getElementById('history-search');
    if (searchInput) {
      searchInput.placeholder = multilingualUI.translate('history.search_placeholder');
    }
    
    // Mettre à jour la pagination
    this.updatePagination();
    
    // Si un élément est sélectionné, mettre à jour ses détails
    if (this.selectedItemId) {
      this.showItemDetails(this.selectedItemId);
    }
    
    // Recharger la liste pour mettre à jour les messages
    this.renderHistoryList();
  }
}

// Exporter une instance singleton
const historyUI = new HistoryUI();
export default historyUI;