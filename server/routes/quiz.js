const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const quizModule = require('../modules/quiz');

/**
 * GET /api/elearning/technologies
 * Récupère les technologies disponibles (Vue.JS, PHP, Symfony)
 */
router.get("/technologies", requireAuth, async (req, res) => {
  try {
    const technologies = quizModule.getTechnologies();
    res.json({
      success: true,
      technologies
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des technologies:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la récupération des technologies',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/elearning/content
 * Récupère tout le contenu d'apprentissage organisé par sections
 * Query: { technology: string (Vue.JS, PHP, Symfony) }
 */
router.get("/content", requireAuth, async (req, res) => {
  try {
    const { technology } = req.query;
    
    if (!technology) {
      return res.status(400).json({ error: 'La technologie est requise' });
    }

    const content = quizModule.getLearningContent(technology);

    res.json({
      success: true,
      ...content
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu e-learning:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la récupération du contenu',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/elearning/start (pour compatibilité)
 * Démarre un nouveau quiz en récupérant des questions aléatoires depuis le fichier JSON
 * Body: { technology: string (Vue.JS, PHP, Symfony), count: number (optionnel, défaut: 10) }
 */
router.post("/start", requireAuth, async (req, res) => {
  try {
    const { technology, count = 10 } = req.body;
    
    if (!technology) {
      return res.status(400).json({ error: 'La technologie est requise' });
    }

    const questions = quizModule.getRandomQuestions(technology, count);

    res.json({
      success: true,
      questions,
      totalQuestions: questions.length,
      technology
    });
  } catch (error) {
    console.error('Erreur lors du démarrage:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors du démarrage',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/quiz/submit
 * Soumet les réponses du quiz et calcule le score
 */
router.post("/submit", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { answers } = req.body; // Array de { questionId, selectedAnswer }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Les réponses sont requises' });
    }

    // Récupérer les questions depuis la base de données
    const db = require('../models');
    const questionIds = answers.map(a => a.questionId);
    const questions = await db.QuizQuestion.findAll({
      where: {
        id: questionIds
      }
    });

    if (questions.length !== answers.length) {
      return res.status(400).json({ error: 'Certaines questions sont introuvables' });
    }

    // Calculer le score
    let score = 0;
    const detailedAnswers = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: null,
          isCorrect: false
        };
      }

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) {
        score++;
      }

      return {
        questionId: question.id,
        question: question.question,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    // Sauvegarder le score
    const savedScore = await quizModule.saveScore(
      userId,
      score,
      answers.length,
      detailedAnswers
    );

    res.json({
      success: true,
      score,
      totalQuestions: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      answers: detailedAnswers,
      savedScore
    });
  } catch (error) {
    console.error('Erreur lors de la soumission du quiz:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la soumission du quiz',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/quiz/history/questions
 * Récupère l'historique des questions
 */
router.get("/history/questions", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const questions = await quizModule.getQuestionsHistory(limit);
    res.json({
      success: true,
      questions,
      total: questions.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des questions:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la récupération de l\'historique',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/quiz/history/scores
 * Récupère l'historique des scores
 */
router.get("/history/scores", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const limit = parseInt(req.query.limit) || 50;
    const scores = await quizModule.getScoresHistory(userId, limit);
    res.json({
      success: true,
      scores,
      total: scores.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des scores:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la récupération de l\'historique',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

