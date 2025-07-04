/**
 * Configuration de l'environnement de test Jest
 * Ce fichier est exécuté avant chaque test
 */

// Mock des API du navigateur qui ne sont pas disponibles dans jsdom
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getURL: jest.fn(path => `chrome-extension://mock-extension-id/${path}`)
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    sendMessage: jest.fn(),
    executeScript: jest.fn()
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn()
  },
  i18n: {
    getMessage: jest.fn((key) => key)
  }
};

// Mock de fetch pour les tests d'API
global.fetch = jest.fn();

// Mock de localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Mock de Worker pour les tests de Web Workers
class WorkerMock {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
    this.onmessageerror = null;
    this.onerror = null;
  }

  postMessage(msg) {
    if (this.onmessage) {
      this.onmessage({ data: msg });
    }
  }

  terminate() {
    // Rien à faire ici pour le mock
  }
}

global.Worker = WorkerMock;

// Supprimer les avertissements de console pendant les tests
console.error = jest.fn();
console.warn = jest.fn();

// Fonction utilitaire pour attendre que les promesses soient résolues
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Fonction utilitaire pour simuler un délai
global.delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Fonction utilitaire pour créer un événement DOM
global.createEvent = (name, params = {}) => {
  const event = document.createEvent('Event');
  event.initEvent(name, true, true);
  Object.assign(event, params);
  return event;
};

// Créer les répertoires de mocks si nécessaire
const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname, '__mocks__');
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir);
}

// Créer les fichiers de mock pour les styles et les fichiers statiques
const styleMockPath = path.join(mockDir, 'styleMock.js');
if (!fs.existsSync(styleMockPath)) {
  fs.writeFileSync(styleMockPath, 'module.exports = {};');
}

const fileMockPath = path.join(mockDir, 'fileMock.js');
if (!fs.existsSync(fileMockPath)) {
  fs.writeFileSync(fileMockPath, 'module.exports = "test-file-stub";');
}