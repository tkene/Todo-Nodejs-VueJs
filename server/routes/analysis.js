const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const analysisModule = require('../modules/analysis');
const raceEvaluator = require('../services/raceEvaluator');
const bettracker = require('../services/bettracker');
const db = require('../models');

// GET /analysis/races - Liste des courses disponibles
router.get("/races", requireAuth, async (req, res) => {
  try {
    const { date } = req.query; // Date optionnelle au format YYYY-MM-DD
    const races = await analysisModule.getAvailableRaces(date);
    
    // S'assurer qu'on retourne toujours un tableau
    if (Array.isArray(races)) {
      res.json(races);
    } else {
      console.warn('getAvailableRaces n\'a pas retourné un tableau:', races);
      res.json([]);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    // Retourner un tableau vide en cas d'erreur plutôt qu'une erreur
    res.json([]);
  }
});

// POST /analysis/analyze - Lancer l'analyse d'une course
router.post("/analyze", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: "courseId est requis" });
    }
    
    const result = await analysisModule.fetchAndAnalyze(courseId);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la course:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /analysis/evaluate - Évaluer une course avec calcul de probabilités
router.post("/evaluate", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: "courseId est requis" });
    }
    
    // Récupérer la course et les chevaux depuis la DB
    const race = await db.Race.findOne({
      where: { courseId },
      include: [{
        model: db.Horse,
        as: 'horses',
        include: [{
          model: db.ForumInsight,
          as: 'forumInsights',
          limit: 1,
          order: [['createdAt', 'DESC']]
        }]
      }]
    });
    
    if (!race) {
      return res.status(404).json({ error: "Course non trouvée. Lancez d'abord une analyse." });
    }
    
    if (!race.horses || race.horses.length === 0) {
      return res.status(404).json({ error: "Aucun cheval trouvé pour cette course." });
    }
    
    // Transformer les données pour l'évaluateur
    const raceData = {
      nbPartants: race.horses.length,
      terrain: race.surface,
      distance: 0, // Peut être enrichi si disponible
      discipline: race.surface === 'PSF' ? 'plat' : 'plat' // À améliorer selon les données
    };
    
    const horsesData = race.horses.map(horse => {
      const transformed = raceEvaluator.transformHorseData(horse, race);
      // Ajouter le forumInsight si disponible
      transformed.forumInsight = horse.forumInsights?.[0] || null;
      return transformed;
    });
    
    // Évaluer la course
    const results = raceEvaluator.evaluateRace(raceData, horsesData);
    
    res.json({
      race: {
        id: race.id,
        courseId: race.courseId,
        name: race.name,
        surface: race.surface,
        hippodrome: race.hippodrome,
        nbPartants: race.horses.length
      },
      evaluations: results
    });
  } catch (error) {
    console.error('Erreur lors de l\'évaluation de la course:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /analysis/bettracker/races - Récupère les courses depuis BetTracker
router.get("/bettracker/races", requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const races = await bettracker.getRaces(date);
    res.json(races);
  } catch (error) {
    console.error('Erreur lors de la récupération des courses BetTracker:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /analysis/bettracker/quinte-du-jour - Récupère le quinté+ du jour depuis BetTracker
router.get("/bettracker/quinte-du-jour", requireAuth, async (req, res) => {
  try {
    const quinteData = await bettracker.getQuinteDuJour();
    res.json(quinteData);
  } catch (error) {
    console.error('Erreur lors de la récupération du quinté BetTracker:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /analysis/bettracker/race/analysis - Analyse une course PMU
router.post("/bettracker/race/analysis", requireAuth, async (req, res) => {
  try {
    const { hippodrome_code, race_number, date } = req.body;
    
    if (!hippodrome_code || !race_number || !date) {
      return res.status(400).json({ 
        error: "hippodrome_code, race_number et date sont requis" 
      });
    }
    
    const raceAnalysis = await bettracker.getRaceAnalysis({
      hippodrome_code,
      race_number,
      date
    });
    
    res.json(raceAnalysis);
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la course:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /analysis/bettracker/pronostics - Récupère les pronostics IA
router.get("/bettracker/pronostics", requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const pronostics = await bettracker.getAIPronostics(status ? { status } : {});
    res.json(pronostics);
  } catch (error) {
    console.error('Erreur lors de la récupération des pronostics:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /analysis/bettracker/stats - Récupère les statistiques utilisateur
router.get("/bettracker/stats", requireAuth, async (req, res) => {
  try {
    const { period } = req.query;
    const stats = await bettracker.getUserStats(period ? { period } : {});
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

