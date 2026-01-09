const db = require('../models');
const fs = require('fs');
const path = require('path');

const QUIZ_DATA_PATH = path.join(__dirname, '../backUp/quizz-dev.json');

// Cache pour les données du quiz
let quizDataCache = null;

/**
 * Charge les données du quiz depuis le fichier JSON
 */
function loadQuizData() {
  if (quizDataCache) {
    return quizDataCache;
  }
  
  try {
    const fileContent = fs.readFileSync(QUIZ_DATA_PATH, 'utf8');
    quizDataCache = JSON.parse(fileContent);
    return quizDataCache;
  } catch (error) {
    console.error('Erreur lors du chargement du fichier quiz:', error);
    throw new Error('Impossible de charger les questions du quiz');
  }
}

/**
 * Récupère les technologies disponibles (Vue.JS, PHP, Symfony)
 */
function getTechnologies() {
  const data = loadQuizData();
  return Object.keys(data).map(tech => ({
    id: tech,
    name: tech
  }));
}

/**
 * Récupère toutes les questions organisées par sections pour l'e-learning
 * @param {string} technology - La technologie choisie (Vue.JS, PHP, Symfony)
 */
function getLearningContent(technology) {
  try {
    const data = loadQuizData();
    
    if (!data[technology]) {
      throw new Error(`Technologie "${technology}" non trouvée`);
    }

    // Retourner toutes les sections avec leurs questions
    const sections = data[technology].sections.map(section => ({
      topic: section.topic,
      questions: section.questions.map(question => ({
        id: question.id,
        question: question.q,
        answer: question.a,
        level: question.lv
      }))
    }));

    return {
      technology,
      sections,
      totalQuestions: sections.reduce((sum, section) => sum + section.questions.length, 0)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu e-learning:', error);
    throw error;
  }
}

/**
 * Récupère des questions aléatoires depuis le fichier JSON local (pour compatibilité)
 * @param {string} technology - La technologie choisie (Vue.JS, PHP, Symfony)
 * @param {number} count - Nombre de questions à récupérer (défaut: 10)
 */
function getRandomQuestions(technology, count = 10) {
  try {
    const data = loadQuizData();
    
    if (!data[technology]) {
      throw new Error(`Technologie "${technology}" non trouvée`);
    }

    // Récupérer toutes les questions de toutes les sections pour cette technologie
    const allQuestions = [];
    data[technology].sections.forEach(section => {
      section.questions.forEach(question => {
        allQuestions.push({
          id: question.id,
          question: question.q,
          answer: question.a,
          level: question.lv,
          topic: section.topic
        });
      });
    });

    // Mélanger et prendre 'count' questions aléatoires
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    return selectedQuestions;
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    throw error;
  }
}


/**
 * Sauvegarde un score de quiz
 */
async function saveScore(userId, score, totalQuestions, answers) {
  try {
    const quizScore = await db.QuizScore.create({
      userId: userId || null,
      score,
      totalQuestions,
      answers: answers || null
    });

    return {
      id: quizScore.id,
      userId: quizScore.userId,
      score: quizScore.score,
      totalQuestions: quizScore.totalQuestions,
      answers: quizScore.answers,
      createdAt: quizScore.createdAt
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du score:', error);
    throw error;
  }
}

/**
 * Récupère l'historique des questions
 */
async function getQuestionsHistory(limit = 100) {
  try {
    const questions = await db.QuizQuestion.findAll({
      order: [['createdAt', 'DESC']],
      limit: limit
    });

    return questions.map(q => ({
      id: q.id,
      question: q.question,
      correctAnswer: q.correctAnswer,
      incorrectAnswers: q.incorrectAnswers,
      category: q.category,
      difficulty: q.difficulty,
      type: q.type,
      createdAt: q.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des questions:', error);
    throw error;
  }
}

/**
 * Récupère l'historique des scores
 */
async function getScoresHistory(userId = null, limit = 50) {
  try {
    const where = userId ? { userId } : {};
    
    const scores = await db.QuizScore.findAll({
      where,
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'email'],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: limit
    });

    return scores.map(s => ({
      id: s.id,
      userId: s.userId,
      userEmail: s.user ? s.user.email : null,
      score: s.score,
      totalQuestions: s.totalQuestions,
      percentage: Math.round((s.score / s.totalQuestions) * 100),
      answers: s.answers,
      createdAt: s.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des scores:', error);
    throw error;
  }
}

module.exports = {
  getTechnologies,
  getLearningContent,
  getRandomQuestions,
  saveScore,
  getQuestionsHistory,
  getScoresHistory
};

