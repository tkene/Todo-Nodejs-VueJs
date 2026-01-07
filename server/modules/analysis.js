const db = require('../models');
const scraper = require('./scraper');

/**
 * Scrape les données réelles d'une course PMU
 * Utilise le module scraper pour récupérer les vraies données
 */
async function scrapeRaceData(courseId) {
  return await scraper.scrapeRaceData(courseId);
}

/**
 * Scrape le sentiment réel du forum
 * Utilise le module scraper pour analyser les forums de turf
 */
async function scrapeForumSentiment(raceId, horseId, horseName, raceName) {
  return await scraper.scrapeForumSentiment(horseName, raceName || '');
}

/**
 * Calcule le score de performance d'un cheval
 * Basé sur : musique (pondérée), aptitude surface, poids
 */
function calculatePerformanceScore(horse, raceSurface) {
  let score = 0;
  
  // 1. Score basé sur la musique (40% du score total)
  if (horse.musique) {
    const musiqueParts = horse.musique.split('-').map(Number);
    const musiqueScore = musiqueParts.reduce((sum, pos) => {
      // Plus la position est proche de 1, meilleur c'est
      return sum + (6 - pos) * 10; // 1er = 50pts, 2ème = 40pts, etc.
    }, 0) / musiqueParts.length;
    score += musiqueScore * 0.4;
  }
  
  // 2. Score basé sur l'aptitude à la surface (30% du score total)
  if (raceSurface === 'PSF' && horse.aptitudPSF) {
    score += 50 * 0.3; // Bonus de 15 points si apte PSF sur PSF
  } else if (raceSurface === 'Herbe' && !horse.aptitudPSF) {
    score += 50 * 0.3; // Bonus de 15 points si apte Herbe sur Herbe
  } else {
    score += 30 * 0.3; // Score moyen si pas d'aptitude spécifique
  }
  
  // 3. Score basé sur le poids (30% du score total)
  // Poids optimal autour de 57kg
  const poidsOptimal = 57;
  const poidsDiff = Math.abs(horse.poids - poidsOptimal);
  const poidsScore = Math.max(0, 50 - (poidsDiff * 5)); // Pénalité de 5pts par kg d'écart
  score += poidsScore * 0.3;
  
  return parseFloat(score.toFixed(2));
}

/**
 * Fonction principale : fetchAndAnalyze
 * Scrape les données, analyse et calcule les scores
 * @param {string} courseId - Identifiant de la course
 */
async function fetchAndAnalyze(courseId) {
  try {
    console.log(`[ANALYSIS] Début de l'analyse pour ${courseId}`);
    
    // 1. Scraper les données de la course
    let raceData;
    try {
      raceData = await scrapeRaceData(courseId);
      console.log(`[ANALYSIS] Données récupérées:`, {
        courseId: raceData.courseId,
        name: raceData.name,
        hippodrome: raceData.hippodrome,
        nombreChevaux: raceData.horses?.length || 0
      });
    } catch (scrapeError) {
      console.error(`[ANALYSIS] Erreur lors du scraping:`, {
        message: scrapeError.message,
        stack: scrapeError.stack
      });
      throw new Error(`Impossible de récupérer les données de la course ${courseId}: ${scrapeError.message}`);
    }
    
    if (!raceData || !raceData.horses || raceData.horses.length === 0) {
      throw new Error(`Aucune donnée de chevaux trouvée pour la course ${courseId}`);
    }
    
    // 2. Vérifier si la course existe déjà en base
    let race = await db.Race.findOne({ where: { courseId } });
    console.log(`[ANALYSIS] Course en base:`, race ? `Trouvée (ID: ${race.id})` : 'Non trouvée, création...');
    if (!race) {
      // Créer la course
      race = await db.Race.create({
        courseId: raceData.courseId,
        name: raceData.name,
        surface: raceData.surface,
        hippodrome: raceData.hippodrome,
        corde: raceData.corde,
        date: raceData.date
      });
    } else {
      // Mettre à jour la course
      await race.update({
        name: raceData.name,
        surface: raceData.surface,
        hippodrome: raceData.hippodrome,
        corde: raceData.corde
      });
    }
    
    // 3. Créer/Mettre à jour les chevaux
    const horses = [];
    for (const horseData of raceData.horses) {
      let horse = await db.Horse.findOne({
        where: { raceId: race.id, numero: horseData.numero }
      });
      
      // Calculer le score de performance
      const performanceScore = calculatePerformanceScore(horseData, raceData.surface);
      
      if (!horse) {
        horse = await db.Horse.create({
          raceId: race.id,
          numero: horseData.numero,
          name: horseData.name,
          musique: horseData.musique,
          poids: horseData.poids,
          cote: horseData.cote,
          coteInitiale: horseData.coteInitiale,
          performanceScore,
          aptitudPSF: horseData.aptitudPSF
        });
      } else {
        await horse.update({
          name: horseData.name,
          musique: horseData.musique,
          poids: horseData.poids,
          cote: horseData.cote,
          coteInitiale: horseData.coteInitiale,
          performanceScore,
          aptitudPSF: horseData.aptitudPSF
        });
      }
      
      // 4. Scraper le sentiment du forum
      const forumData = await scrapeForumSentiment(race.id, horse.id, horse.name, race.name);
      
      let forumInsight = await db.ForumInsight.findOne({
        where: { raceId: race.id, horseId: horse.id }
      });
      
      if (!forumInsight) {
        forumInsight = await db.ForumInsight.create({
          raceId: race.id,
          horseId: horse.id,
          sentiment: forumData.sentiment,
          sentimentScore: forumData.sentimentScore,
          commentCount: forumData.commentCount
        });
      } else {
        await forumInsight.update({
          sentiment: forumData.sentiment,
          sentimentScore: forumData.sentimentScore,
          commentCount: forumData.commentCount
        });
      }
      
      // Récupérer le cheval avec ses insights
      const horseWithInsights = await db.Horse.findByPk(horse.id, {
        include: [{
          model: db.ForumInsight,
          as: 'forumInsights',
          limit: 1,
          order: [['createdAt', 'DESC']]
        }]
      });
      
      horses.push({
        id: horseWithInsights.id,
        numero: horseWithInsights.numero,
        name: horseWithInsights.name,
        musique: horseWithInsights.musique,
        poids: horseWithInsights.poids,
        cote: horseWithInsights.cote,
        coteInitiale: horseWithInsights.coteInitiale,
        performanceScore: horseWithInsights.performanceScore,
        aptitudPSF: horseWithInsights.aptitudPSF,
        forumInsight: horseWithInsights.forumInsights?.[0] || null
      });
    }
    
    // 5. Trier les chevaux par score de performance décroissant
    horses.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
    
    // 6. Générer l'expert insight (algorithme)
    const expertInsight = generateExpertInsight(race, horses);
    
    // 7. Détecter les alertes "Smart Money"
    const smartMoneyAlerts = detectSmartMoneyAlerts(horses);
    
    return {
      race: {
        id: race.id,
        courseId: race.courseId,
        name: race.name,
        surface: race.surface,
        hippodrome: race.hippodrome,
        corde: race.corde,
        date: race.date
      },
      horses,
      top3: horses.slice(0, 3),
      expertInsight,
      smartMoneyAlerts
    };
  } catch (error) {
    console.error('Erreur dans fetchAndAnalyze:', error);
    throw error;
  }
}

/**
 * Génère un insight expert basé sur la météo et le terrain (algorithme)
 */
function generateExpertInsight(race, horses) {
  const surface = race.surface;
  const hippodrome = race.hippodrome;
  
  let insight = `Analyse de la course ${race.name} sur ${hippodrome}.\n\n`;
  
  if (surface === 'PSF') {
    insight += `🏇 Surface PSF (Piste en Sable Fibré) : Les chevaux avec une bonne aptitude au PSF sont favorisés. `;
    const psfHorses = horses.filter(h => h.aptitudPSF);
    if (psfHorses.length > 0) {
      insight += `${psfHorses.length} partant(s) présentent une aptitude confirmée à cette surface.\n\n`;
    }
  } else {
    insight += `🌱 Surface Herbe : Conditions classiques, tous les chevaux sont sur un pied d'égalité concernant la surface.\n\n`;
  }
  
  const topHorse = horses[0];
  if (topHorse) {
    insight += `⭐ Favori : ${topHorse.name} (n°${topHorse.numero}) avec un score de ${topHorse.performanceScore} points. `;
    if (topHorse.musique) {
      insight += `Musique ${topHorse.musique} très prometteuse. `;
    }
    if (topHorse.forumInsight?.sentiment === 'très_positif' || topHorse.forumInsight?.sentiment === 'positif') {
      insight += `Le sentiment du forum est ${topHorse.forumInsight.sentiment === 'très_positif' ? 'très positif' : 'positif'} avec ${topHorse.forumInsight.commentCount} commentaires analysés.`;
    }
  }
  
  // Analyse des variations de cotes
  const coteVariations = horses
    .filter(h => h.cote && h.coteInitiale)
    .map(h => ({
      name: h.name,
      numero: h.numero,
      variation: ((h.coteInitiale - h.cote) / h.coteInitiale) * 100
    }))
    .filter(h => Math.abs(h.variation) > 5); // Variations significatives (>5%)
  
  if (coteVariations.length > 0) {
    insight += `\n\n📊 Variations de cotes notables : `;
    coteVariations.forEach(v => {
      const direction = v.variation > 0 ? 'hausse' : 'baisse';
      insight += `${v.name} (n°${v.numero}) en ${direction} de ${Math.abs(v.variation).toFixed(1)}%. `;
    });
  }
  
  return insight;
}

/**
 * Détecte les alertes "Smart Money"
 * (sentiment très positif ou grosse baisse de cote)
 */
function detectSmartMoneyAlerts(horses) {
  const alerts = [];
  
  for (const horse of horses) {
    const alertsForHorse = [];
    
    // Alerte : Sentiment très positif
    if (horse.forumInsight?.sentiment === 'très_positif' && 
        horse.forumInsight.sentimentScore > 85) {
      alertsForHorse.push({
        type: 'sentiment',
        severity: 'high',
        message: `Sentiment très positif du forum (${horse.forumInsight.sentimentScore} points) avec ${horse.forumInsight.commentCount} commentaires`
      });
    }
    
    // Alerte : Grosse baisse de cote (>10%)
    if (horse.cote && horse.coteInitiale) {
      const variation = ((horse.coteInitiale - horse.cote) / horse.coteInitiale) * 100;
      if (variation > 10) {
        alertsForHorse.push({
          type: 'cote',
          severity: 'high',
          message: `Baisse significative de cote : ${variation.toFixed(1)}% (${horse.coteInitiale.toFixed(2)} → ${horse.cote.toFixed(2)})`
        });
      } else if (variation > 5) {
        alertsForHorse.push({
          type: 'cote',
          severity: 'medium',
          message: `Baisse modérée de cote : ${variation.toFixed(1)}%`
        });
      }
    }
    
    if (alertsForHorse.length > 0) {
      alerts.push({
        horse: {
          numero: horse.numero,
          name: horse.name
        },
        alerts: alertsForHorse
      });
    }
  }
  
  return alerts;
}

/**
 * Récupère la liste des courses disponibles
 * @param {string} date - Date au format YYYY-MM-DD (optionnel, défaut: aujourd'hui)
 * Utilise le module scraper pour récupérer les vraies courses
 */
async function getAvailableRaces(date = null) {
  return await scraper.getAvailableRaces(date);
}

module.exports = {
  scrapeRaceData,
  scrapeForumSentiment,
  fetchAndAnalyze,
  getAvailableRaces,
  generateExpertInsight
};

