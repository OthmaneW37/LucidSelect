// popup.js

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabs = document.querySelectorAll('.tab-btn');
  const views = document.querySelectorAll('.view');
  const openOptionsBtn = document.getElementById('open-options');
  const apiStatusText = document.getElementById('api-status-text');
  const apiStatusDot = document.getElementById('api-status-dot');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');

  // Load API Status
  checkApiStatus();

  // Load History
  loadHistory();

  // Tab Switching Logic
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      document.getElementById(`${tabId}-view`).classList.add('active');
    });
  });

  // Open Options
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Clear History
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
      chrome.storage.local.set({ request_history: [] }, () => {
        loadHistory();
      });
    }
  });

  // Functions
  function checkApiStatus() {
    chrome.storage.local.get(['openai_api_key', 'together_api_key', 'claude_api_key', 'gemini_api_key', 'selected_api'], (result) => {
      const selectedApi = result.selected_api || 'openai';
      let apiKey = null;
      let apiName = 'OpenAI';

      switch (selectedApi) {
        case 'openai': apiKey = result.openai_api_key; apiName = 'OpenAI'; break;
        case 'together': apiKey = result.together_api_key; apiName = 'Together'; break;
        case 'claude': apiKey = result.claude_api_key; apiName = 'Claude'; break;
        case 'gemini': apiKey = result.gemini_api_key; apiName = 'Gemini'; break;
      }

      if (apiKey) {
        apiStatusText.textContent = `Connecté à ${apiName}`;
        apiStatusText.style.color = 'var(--text-primary)';
        apiStatusDot.className = 'status-dot active';
      } else {
        apiStatusText.textContent = `API ${apiName} non configurée`;
        apiStatusText.style.color = 'var(--error-color)';
        apiStatusDot.className = 'status-dot inactive';
      }
    });
  }

  function loadHistory() {
    chrome.storage.local.get(['request_history'], (result) => {
      const history = result.request_history || [];
      historyList.innerHTML = '';

      if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">Aucun historique récent.</div>';
        return;
      }

      // Show latest first
      history.reverse().forEach((item, index) => {
        const date = new Date(item.timestamp).toLocaleString('fr-FR', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
          <div class="history-query">${escapeHtml(item.question || 'Résumé/Analyse')}</div>
          <div class="history-preview">${escapeHtml(item.answer)}</div>
          <div class="history-meta">
            <span>${date}</span>
            <span>${item.api}</span>
          </div>
        `;
        
        // Expansion (simple alert for now, could be better)
        el.addEventListener('click', () => {
           // Maybe showing a detailed view in the future.
           // For now let's just log it or toggle full view? 
           // Let's replace preview with full text if clicked
           const preview = el.querySelector('.history-preview');
           if (preview.classList.contains('expanded')) {
             preview.classList.remove('expanded');
             preview.style.webkitLineClamp = '2';
             preview.textContent = item.answer;
           } else {
             preview.classList.add('expanded');
             preview.style.webkitLineClamp = 'unset';
             preview.style.whiteSpace = 'pre-wrap';
           }
        });

        historyList.appendChild(el);
      });
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});