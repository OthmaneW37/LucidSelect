// options.js

// Elements
const openaiKeyInput = document.getElementById('openai-key');
const togetherKeyInput = document.getElementById('together-key');
const apiRadios = document.querySelectorAll('input[name="api_provider"]');
const saveBtn = document.getElementById('save-btn');
const statusDiv = document.getElementById('status');
const togetherGroup = document.getElementById('together-group');

// Load settings
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(
    ['openai_api_key', 'together_api_key', 'selected_api'],
    (items) => {
      if (items.openai_api_key) openaiKeyInput.value = items.openai_api_key;
      if (items.together_api_key) togetherKeyInput.value = items.together_api_key;

      const selected = items.selected_api || 'openai';

      // Select radio
      document.querySelector(`input[value="${selected}"]`).checked = true;
      toggleFields(selected);
    }
  );
});

// Toggle fields based on selection
apiRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    toggleFields(e.target.value);
  });
});

function toggleFields(provider) {
  // Simple logic: we know we only have OpenAI and Together active for now
  if (provider === 'together') {
    togetherGroup.style.display = 'block';
    // Maybe hide OpenAI or keep it visible? Let's keep OpenAI visible as primary
  } else {
    togetherGroup.style.display = 'none';
  }
}

// Save settings
saveBtn.addEventListener('click', () => {
  const openaiKey = openaiKeyInput.value.trim();
  const togetherKey = togetherKeyInput.value.trim();
  const selectedApi = document.querySelector('input[name="api_provider"]:checked').value;

  chrome.storage.local.set(
    {
      openai_api_key: openaiKey,
      together_api_key: togetherKey,
      selected_api: selectedApi
    },
    () => {
      // Show status
      statusDiv.textContent = 'Paramètres enregistrés avec succès !';
      statusDiv.className = 'status success';
      statusDiv.style.display = 'flex'; // overriding none from css

      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  );
});