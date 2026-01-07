/**
 * Module d'évaluation des courses PMU
 * Calcule les probabilités de victoire, Top 3 et fin de course pour chaque cheval
 * 
 * @module services/raceEvaluator
 */

const weights = require('../config/evaluationWeights.json');

/**
 * Normalise une valeur entre 0 et 1
 * @param {number} value - Valeur à normaliser
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @returns {number} Valeur normalisée entre 0 et 1
 */
function normalize(value, min, max) {
  if (max === min) return 0.5; // Éviter division par zéro
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calcule la fonction softmax pour transformer des scores en probabilités
 * @param {Array<number>} scores - Tableau de scores
 * @returns {Array<number>} Tableau de probabilités (somme = 1)
 */
function softmax(scores) {
  // Trouver le score maximum pour éviter les overflow
  const maxScore = Math.max(...scores);
  
  // Calculer exp(scores - maxScore) pour stabilité numérique
  const expScores = scores.map(score => Math.exp(score - maxScore));
  const sumExpScores = expScores.reduce((sum, exp) => sum + exp, 0);
  
  // Normaliser pour obtenir des probabilités
  return expScores.map(exp => exp / sumExpScores);
}

/**
 * Calcule la probabilité implicite d'une cote PMU
 * @param {number} cote - Cote du cheval (ex: 3.5)
 * @returns {number} Probabilité implicite entre 0 et 1
 */
function calculatePMUProbability(cote) {
  if (!cote || cote <= 0) return 0.1; // Valeur par défaut si pas de cote
  return 1 / cote;
}

/**
 * Calcule le score d'un cheval basé sur ses caractéristiques
 * @param {Object} horse - Données du cheval
 * @param {Object} race - Données de la course
 * @returns {number} Score brut du cheval
 */
function calculateHorseScore(horse, race) {
  // Normaliser les valeurs si nécessaire
  const recentForm = normalize(horse.recentForm || 0.5, 0, 1);
  const terrainAffinity = normalize(horse.terrainAffinity || 0.5, 0, 1);
  const distanceAffinity = normalize(horse.distanceAffinity || 0.5, 0, 1);
  const jockeyWinRate = normalize(horse.jockeyWinRate || 0.1, 0, 1);
  const trainerWinRate = normalize(horse.trainerWinRate || 0.1, 0, 1);
  
  // Calculer la probabilité implicite de la cote
  const pmuProbability = calculatePMUProbability(horse.cote);
  
  // Calculer le score pondéré
  const score = 
    weights.w1 * recentForm +
    weights.w2 * terrainAffinity +
    weights.w3 * distanceAffinity +
    weights.w4 * jockeyWinRate +
    weights.w5 * trainerWinRate +
    weights.w6 * pmuProbability;
  
  return score;
}

/**
 * Calcule la probabilité Top 3 basée sur le ranking et les probabilités de victoire
 * @param {number} probWin - Probabilité de gagner
 * @param {number} rank - Rang du cheval (1 = favori, 2 = second, etc.)
 * @param {number} nbPartants - Nombre de partants
 * @param {Array<number>} allProbWins - Toutes les probabilités de victoire
 * @returns {number} Probabilité d'être dans le Top 3
 */
function calculateTop3Probability(probWin, rank, nbPartants, allProbWins) {
  // Approche : redistribution logique basée sur le ranking
  // Les chevaux mieux classés ont plus de chances d'être dans le Top 3
  
  // Facteur de décroissance selon le rang (favori = 1.0, 2ème = 0.85, etc.)
  let rankMultiplier;
  if (rank === 1) {
    rankMultiplier = 1.0; // Favori : très forte probabilité Top 3
  } else if (rank === 2) {
    rankMultiplier = 0.85; // Second : forte probabilité
  } else if (rank === 3) {
    rankMultiplier = 0.70; // Troisième : bonne probabilité
  } else if (rank <= 5) {
    rankMultiplier = 0.50 - ((rank - 3) * 0.10); // 4ème = 0.4, 5ème = 0.3
  } else if (rank <= 10) {
    rankMultiplier = 0.25 - ((rank - 5) * 0.03); // Décroissance douce
  } else {
    rankMultiplier = Math.max(0.05, 0.10 - ((rank - 10) * 0.01)); // Outsiders
  }
  
  // Base : probWin * facteur (Top 3 = 3 places, donc multiplier par ~3)
  // Mais ajuster selon le rang
  const baseTop3 = probWin * 3.0;
  
  // Appliquer le multiplicateur de rang
  let probTop3 = baseTop3 * rankMultiplier;
  
  // Ajustement : les favoris ont une probabilité Top 3 plus élevée que leur probWin
  // Les outsiders ont une probabilité Top 3 plus faible
  if (rank <= 3) {
    // Pour les 3 premiers, augmenter la probabilité Top 3
    probTop3 = Math.max(probTop3, probWin * 1.5);
  }
  
  // S'assurer que la probabilité reste dans des limites raisonnables
  // Un cheval ne peut pas avoir plus de 95% de chances d'être dans le Top 3
  return Math.min(0.95, Math.max(0.01, probTop3));
}

/**
 * Calcule la probabilité de finir la course
 * @param {Object} horse - Données du cheval
 * @returns {number} Probabilité de finir (entre 0 et 1)
 */
function calculateFinishProbability(horse) {
  // Base : 97% des chevaux finissent normalement
  let probFinish = 0.97;
  
  // Réduire si le cheval est souvent fautif
  if (horse.isOftenFaulty) {
    // Sévérité basée sur la fréquence (on peut l'ajuster)
    const faultSeverity = horse.faultFrequency || 0.5; // 0 = rarement, 1 = très souvent
    const reduction = 0.15 + (faultSeverity * 0.1); // Réduction entre 15% et 25%
    probFinish = 0.97 - reduction;
  }
  
  // S'assurer que la probabilité reste dans des limites raisonnables
  return Math.max(0.75, Math.min(0.99, probFinish));
}

/**
 * Génère une explication courte pour un cheval
 * @param {Object} horse - Données du cheval avec probabilités calculées
 * @param {number} rank - Rang du cheval
 * @param {Object} race - Données de la course
 * @returns {string} Explication courte
 */
function generateExplanation(horse, rank, race) {
  const explanations = [];
  
  // Explication basée sur le rang
  if (rank === 1) {
    explanations.push('Favori de la course');
  } else if (rank <= 3) {
    explanations.push('Parmi les favoris');
  } else if (rank <= race.nbPartants / 2) {
    explanations.push('Chances modérées');
  } else {
    explanations.push('Outsider');
  }
  
  // Explication basée sur la forme récente
  if (horse.recentForm > 0.7) {
    explanations.push('Forme récente excellente');
  } else if (horse.recentForm < 0.3) {
    explanations.push('Forme récente décevante');
  }
  
  // Explication basée sur l'affinité terrain
  if (horse.terrainAffinity > 0.7) {
    explanations.push(`Très à l'aise sur ${race.terrain}`);
  } else if (horse.terrainAffinity < 0.3) {
    explanations.push(`Peu performant sur ${race.terrain}`);
  }
  
  // Explication basée sur le jockey
  if (horse.jockeyWinRate > 0.2) {
    explanations.push('Jockey performant');
  }
  
  // Explication basée sur l'entraîneur
  if (horse.trainerWinRate > 0.2) {
    explanations.push('Entraîneur en forme');
  }
  
  // Explication basée sur la cote
  if (horse.cote && horse.cote < 3) {
    explanations.push('Très court dans les cotes');
  } else if (horse.cote && horse.cote > 10) {
    explanations.push('Cote élevée (outsider)');
  }
  
  // Explication si souvent fautif
  if (horse.isOftenFaulty) {
    explanations.push('Attention : peut être fautif');
  }
  
  // Retourner l'explication (limiter à 3 éléments max)
  return explanations.slice(0, 3).join(' • ') || 'Analyse standard';
}

/**
 * Évalue une course et calcule les probabilités pour chaque cheval
 * @param {Object} race - Données de la course
 *   - nbPartants: number
 *   - terrain: string
 *   - distance: number
 *   - discipline: string ('plat' | 'trot' | 'attelé')
 * @param {Array<Object>} horses - Tableau de chevaux avec leurs données
 *   - id: number|string
 *   - name: string
 *   - age: number (optionnel)
 *   - recentForm: number (0-1)
 *   - terrainAffinity: number (0-1)
 *   - distanceAffinity: number (0-1)
 *   - jockeyWinRate: number (0-1)
 *   - trainerWinRate: number (0-1)
 *   - cote: number (optionnel)
 *   - isOftenFaulty: boolean
 *   - faultFrequency: number (0-1, optionnel)
 * @returns {Array<Object>} Tableau de résultats avec probabilités et explications
 */
function evaluateRace(race, horses) {
  if (!horses || horses.length === 0) {
    throw new Error('Aucun cheval fourni pour l\'évaluation');
  }
  
  if (!race || !race.nbPartants) {
    throw new Error('Données de course incomplètes');
  }
  
  // 1. Calculer les scores bruts pour chaque cheval
  const horseScores = horses.map(horse => ({
    ...horse,
    rawScore: calculateHorseScore(horse, race)
  }));
  
  // 2. Extraire les scores pour le softmax
  const scores = horseScores.map(h => h.rawScore);
  
  // 3. Calculer les probabilités de victoire via softmax
  const probWins = softmax(scores);
  
  // 4. Vérifier que la somme = 1 (avec tolérance pour erreurs d'arrondi)
  const sumProbWins = probWins.reduce((sum, prob) => sum + prob, 0);
  if (Math.abs(sumProbWins - 1) > 0.01) {
    // Renormaliser si nécessaire
    probWins.forEach((prob, index) => {
      probWins[index] = prob / sumProbWins;
    });
  }
  
  // 5. Trier les chevaux par probabilité de victoire décroissante
  const sortedHorses = horseScores
    .map((horse, index) => ({
      ...horse,
      probWin: probWins[index],
      rank: index + 1
    }))
    .sort((a, b) => b.probWin - a.probWin)
    .map((horse, index) => ({
      ...horse,
      rank: index + 1
    }));
  
  // 6. Calculer les probabilités Top 3
  const allProbWins = sortedHorses.map(h => h.probWin);
  sortedHorses.forEach(horse => {
    horse.probTop3 = calculateTop3Probability(
      horse.probWin,
      horse.rank,
      race.nbPartants,
      allProbWins
    );
  });
  
  // 7. Calculer les probabilités de finir la course
  sortedHorses.forEach(horse => {
    horse.probFinish = calculateFinishProbability(horse);
  });
  
  // 8. Générer les explications
  sortedHorses.forEach(horse => {
    horse.explanation = generateExplanation(horse, horse.rank, race);
  });
  
  // 9. Formater les résultats
  const results = sortedHorses.map(horse => ({
    id: horse.id,
    name: horse.name,
    numero: horse.numero || horse.rank,
    probWin: parseFloat(horse.probWin.toFixed(4)),
    probTop3: parseFloat(horse.probTop3.toFixed(4)),
    probFinish: parseFloat(horse.probFinish.toFixed(4)),
    explanation: horse.explanation,
    rank: horse.rank,
    score: parseFloat(horse.rawScore.toFixed(2))
  }));
  
  return results;
}

/**
 * Transforme les données de cheval existantes (depuis la DB) en format attendu
 * @param {Object} horse - Cheval depuis la DB
 * @param {Object} race - Course depuis la DB
 * @returns {Object} Cheval au format attendu par evaluateRace
 */
function transformHorseData(horse, race) {
  // Calculer recentForm depuis la musique
  let recentForm = 0.5; // Valeur par défaut
  if (horse.musique) {
    const positions = horse.musique.split('-').map(Number);
    // Convertir les positions en score (1er = 1.0, 2ème = 0.8, etc.)
    const formScores = positions.map(pos => Math.max(0, 1 - (pos - 1) * 0.2));
    recentForm = formScores.reduce((sum, score) => sum + score, 0) / formScores.length;
  }
  
  // Calculer terrainAffinity depuis aptitudPSF
  let terrainAffinity = 0.5;
  if (race.surface === 'PSF' && horse.aptitudPSF) {
    terrainAffinity = 0.8;
  } else if (race.surface === 'Herbe' && !horse.aptitudPSF) {
    terrainAffinity = 0.7;
  } else if (race.surface === 'PSF' && !horse.aptitudPSF) {
    terrainAffinity = 0.3;
  }
  
  // distanceAffinity : valeur par défaut (peut être améliorée avec plus de données)
  const distanceAffinity = 0.6;
  
  // jockeyWinRate et trainerWinRate : valeurs par défaut (peuvent être enrichies)
  const jockeyWinRate = 0.15; // Moyenne générale
  const trainerWinRate = 0.15; // Moyenne générale
  
  // isOftenFaulty : basé sur le sentiment du forum si négatif
  const isOftenFaulty = horse.forumInsight?.sentiment === 'très_négatif' || 
                        horse.forumInsight?.sentiment === 'négatif';
  
  return {
    id: horse.id,
    name: horse.name,
    numero: horse.numero,
    age: horse.age || 5, // Valeur par défaut
    recentForm,
    terrainAffinity,
    distanceAffinity,
    jockeyWinRate,
    trainerWinRate,
    cote: horse.cote ? parseFloat(horse.cote) : null,
    isOftenFaulty,
    faultFrequency: isOftenFaulty ? 0.6 : 0.1,
    forumInsight: horse.forumInsight
  };
}

module.exports = {
  evaluateRace,
  transformHorseData,
  // Exporter les fonctions utilitaires pour les tests
  normalize,
  softmax,
  calculateHorseScore,
  calculateTop3Probability,
  calculateFinishProbability
};

