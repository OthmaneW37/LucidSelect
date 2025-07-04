// text-processing-worker.js - Web Worker pour le traitement de texte en arrière-plan

/**
 * Divise un texte en segments pour un traitement plus efficace
 * @param {string} text - Texte à diviser
 * @param {number} maxSegmentLength - Longueur maximale d'un segment
 * @returns {Array<string>} Segments de texte
 */
function splitTextIntoSegments(text, maxSegmentLength = 1000) {
  // Si le texte est plus court que la longueur maximale, le retourner tel quel
  if (text.length <= maxSegmentLength) {
    return [text];
  }
  
  const segments = [];
  let currentPosition = 0;
  
  while (currentPosition < text.length) {
    // Trouver un point de coupure approprié (fin de phrase ou paragraphe)
    let endPosition = Math.min(currentPosition + maxSegmentLength, text.length);
    
    // Si nous ne sommes pas à la fin du texte, chercher un point de coupure naturel
    if (endPosition < text.length) {
      // Chercher la dernière occurrence d'un point, point d'exclamation, point d'interrogation ou saut de ligne
      const lastPeriod = text.lastIndexOf('.', endPosition);
      const lastExclamation = text.lastIndexOf('!', endPosition);
      const lastQuestion = text.lastIndexOf('?', endPosition);
      const lastNewline = text.lastIndexOf('\n', endPosition);
      
      // Trouver le point de coupure le plus approprié
      const possibleBreakpoints = [lastPeriod, lastExclamation, lastQuestion, lastNewline]
        .filter(point => point > currentPosition && point <= endPosition);
      
      if (possibleBreakpoints.length > 0) {
        // Utiliser le point de coupure le plus éloigné
        endPosition = Math.max(...possibleBreakpoints) + 1;
      }
    }
    
    // Ajouter le segment au tableau
    segments.push(text.substring(currentPosition, endPosition));
    currentPosition = endPosition;
  }
  
  return segments;
}

/**
 * Résume un texte en utilisant des techniques de traitement de texte
 * @param {string} text - Texte à résumer
 * @param {number} targetLength - Longueur cible approximative du résumé
 * @returns {string} Texte résumé
 */
function summarizeText(text, targetLength = 0.3) {
  // Diviser le texte en phrases
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    return text;
  }
  
  // Calculer le nombre de phrases à conserver
  const targetSentences = Math.max(1, Math.ceil(sentences.length * targetLength));
  
  // Calculer le score de chaque phrase
  const sentenceScores = sentences.map((sentence, index) => {
    // Facteurs de scoring
    const length = sentence.length;
    const position = 1 - (Math.abs(index - 0) / sentences.length); // Favoriser les phrases au début
    const keywordCount = countKeywords(sentence, text);
    
    // Score combiné (ajuster les poids selon les besoins)
    const score = (0.3 * position) + (0.5 * keywordCount) + (0.2 * (1 - length / 200));
    
    return { sentence, score, index };
  });
  
  // Trier les phrases par score et prendre les meilleures
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, targetSentences);
  
  // Trier les phrases par leur position originale pour maintenir l'ordre du texte
  const orderedSentences = topSentences
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);
  
  // Joindre les phrases pour former le résumé
  return orderedSentences.join(' ');
}

/**
 * Compte les mots-clés dans une phrase
 * @param {string} sentence - Phrase à analyser
 * @param {string} fullText - Texte complet pour l'analyse de fréquence
 * @returns {number} Score basé sur les mots-clés
 */
function countKeywords(sentence, fullText) {
  // Extraire les mots de la phrase
  const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
  
  // Calculer la fréquence des mots dans le texte complet
  const wordFrequency = {};
  const allWords = fullText.toLowerCase().match(/\b\w+\b/g) || [];
  
  allWords.forEach(word => {
    if (word.length > 3) { // Ignorer les mots courts
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Calculer le score basé sur la présence de mots fréquents
  let score = 0;
  words.forEach(word => {
    if (word.length > 3) { // Ignorer les mots courts
      score += wordFrequency[word] || 0;
    }
  });
  
  // Normaliser le score par la longueur de la phrase
  return words.length > 0 ? score / words.length : 0;
}

/**
 * Paraphrase un texte en utilisant des techniques de substitution
 * @param {string} text - Texte à paraphraser
 * @returns {string} Texte paraphrasé
 */
function paraphraseText(text) {
  // Cette fonction est une implémentation simplifiée
  // Dans une version réelle, on utiliserait un modèle de langage ou un dictionnaire de synonymes
  
  // Diviser le texte en phrases
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    return text;
  }
  
  // Paraphraser chaque phrase
  const paraphrasedSentences = sentences.map(sentence => {
    // Réorganiser la structure de la phrase (version simplifiée)
    const words = sentence.trim().split(/\s+/);
    
    // Techniques simples de paraphrase
    if (words.length > 3) {
      // 1. Inverser l'ordre des clauses si la phrase contient une virgule
      if (sentence.includes(',')) {
        const clauses = sentence.split(',');
        if (clauses.length >= 2) {
          return clauses.slice(1).join(',') + ', ' + clauses[0] + '.';
        }
      }
      
      // 2. Changer la voix active/passive (simulation simplifiée)
      if (sentence.match(/\b(a|ont|est|sont)\b/i) && sentence.length > 20) {
        // Simulation d'un changement de voix (dans une implémentation réelle, 
        // cela nécessiterait une analyse syntaxique complète)
        return 'Il est à noter que ' + sentence.trim();
      }
    }
    
    // Si aucune transformation n'est appliquée, retourner la phrase originale
    return sentence;
  });
  
  // Joindre les phrases paraphrasées
  return paraphrasedSentences.join(' ');
}

/**
 * Analyse un texte pour extraire des informations clés
 * @param {string} text - Texte à analyser
 * @returns {Object} Résultat de l'analyse
 */
function analyzeText(text) {
  // Statistiques de base
  const wordCount = (text.match(/\b\w+\b/g) || []).length;
  const sentenceCount = (text.match(/[^.!?]+[.!?]+/g) || []).length;
  const paragraphCount = (text.split(/\n\s*\n/) || []).length;
  
  // Calculer la longueur moyenne des mots
  const words = text.match(/\b\w+\b/g) || [];
  const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = words.length > 0 ? totalCharacters / words.length : 0;
  
  // Calculer la longueur moyenne des phrases
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const averageSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  
  // Extraire les mots-clés (version simplifiée)
  const wordFrequency = {};
  words.forEach(word => {
    const normalizedWord = word.toLowerCase();
    if (normalizedWord.length > 3) { // Ignorer les mots courts
      wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    }
  });
  
  // Trier les mots par fréquence et prendre les 10 premiers
  const keywords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
  
  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    averageWordLength,
    averageSentenceLength,
    keywords,
    readingTime: Math.ceil(wordCount / 200) // Estimation du temps de lecture en minutes
  };
}

/**
 * Analyse un QCM/Quiz pour extraire les questions et réponses
 * @param {string} text - Texte du QCM/Quiz
 * @returns {Array<Object>} Questions et réponses extraites
 */
function analyzeQuiz(text) {
  // Diviser le texte en lignes
  const lines = text.split('\n');
  
  const questions = [];
  let currentQuestion = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Ignorer les lignes vides
    if (!line) continue;
    
    // Détecter une nouvelle question (commence par un nombre suivi d'un point ou une parenthèse)
    const questionMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    if (questionMatch) {
      // Si une question est en cours, l'ajouter au tableau
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      // Créer une nouvelle question
      currentQuestion = {
        question: questionMatch[2],
        options: [],
        correctAnswer: null
      };
      continue;
    }
    
    // Détecter une option de réponse (commence par une lettre suivie d'un point ou une parenthèse)
    const optionMatch = line.match(/^([a-zA-Z])[.)]\s+(.+)/);
    if (optionMatch && currentQuestion) {
      const optionLetter = optionMatch[1].toUpperCase();
      const optionText = optionMatch[2];
      
      // Ajouter l'option à la question courante
      currentQuestion.options.push({
        letter: optionLetter,
        text: optionText,
        // Détecter si l'option est marquée comme correcte (par exemple, avec un astérisque)
        isCorrect: optionText.includes('*')
      });
      
      // Si l'option est marquée comme correcte, la définir comme réponse correcte
      if (optionText.includes('*')) {
        currentQuestion.correctAnswer = optionLetter;
      }
      
      continue;
    }
    
    // Si la ligne ne correspond à aucun format reconnu et qu'une question est en cours,
    // l'ajouter comme information supplémentaire à la question
    if (currentQuestion) {
      currentQuestion.question += ' ' + line;
    }
  }
  
  // Ajouter la dernière question si elle existe
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// Écouter les messages du script principal
self.onmessage = async (event) => {
  try {
    const { type, data } = event.data;
    let result;
    
    // Traiter la requête en fonction du type de traitement
    switch (type) {
      case 'summarize':
        result = summarizeText(data.text, data.targetLength);
        break;
      case 'paraphrase':
        result = paraphraseText(data.text);
        break;
      case 'analyze':
        result = analyzeText(data.text);
        break;
      case 'analyzeQuiz':
        result = analyzeQuiz(data.text);
        break;
      default:
        throw new Error(`Type de traitement non supporté: ${type}`);
    }
    
    // Envoyer le résultat au script principal
    self.postMessage({
      success: true,
      result
    });
  } catch (error) {
    // Envoyer l'erreur au script principal
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};