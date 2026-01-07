/**
 * Script de test pour l'API BetTracker Pro
 * 
 * Usage:
 *   node scripts/test-bettracker.js
 *   node scripts/test-bettracker.js --endpoint races
 *   node scripts/test-bettracker.js --endpoint quinte
 *   node scripts/test-bettracker.js --endpoint race --raceId 12345
 */

require('dotenv').config();
const bettracker = require('../services/bettracker');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Test de la configuration
 */
function testConfiguration() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔧 Test de la configuration', 'blue');
  log('='.repeat(60), 'blue');
  
  const apiKey = process.env.BETTRACKER_API_KEY;
  
  if (!apiKey) {
    logError('BETTRACKER_API_KEY n\'est pas définie dans le fichier .env');
    logWarning('Veuillez ajouter: BETTRACKER_API_KEY=votre_cle_api');
    return false;
  }
  
  logSuccess(`Clé API trouvée: ${apiKey.substring(0, 10)}...`);
  logInfo('Configuration OK');
  return true;
}

/**
 * Test de récupération des courses du jour
 */
async function testGetTodayRaces() {
  log('\n' + '='.repeat(60), 'blue');
  log('🏇 Test: Récupération des courses du jour', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    logInfo('Appel de bettracker.getTodayRaces()...');
    const races = await bettracker.getTodayRaces();
    
    if (!races || races.length === 0) {
      logWarning('Aucune course trouvée pour aujourd\'hui');
      return [];
    }
    
    logSuccess(`${races.length} course(s) trouvée(s)`);
    
    // Afficher les premières courses
    const displayCount = Math.min(5, races.length);
    log(`\n📋 Affichage des ${displayCount} premières courses:`, 'cyan');
    
    races.slice(0, displayCount).forEach((race, index) => {
      log(`\n${index + 1}. Course:`, 'yellow');
      log(`   Nom: ${race.name || 'N/A'}`);
      log(`   Hippodrome: ${race.hippodrome || race.hippodrome_code || 'N/A'}`);
      log(`   Date: ${race.date || 'N/A'}`);
      log(`   Type: ${race.type || 'N/A'}`);
      log(`   Partants: ${race.nbPartants || 'N/A'}`);
      if (race.hippodrome_code) log(`   Code Hippodrome: ${race.hippodrome_code}`);
      if (race.race_number) log(`   Numéro: ${race.race_number}`);
    });
    
    return races;
  } catch (error) {
    logError(`Erreur lors de la récupération des courses: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test de récupération des courses (avec date optionnelle)
 */
async function testGetRaces(date = null) {
  try {
    if (date) {
      log('\n' + '='.repeat(60), 'blue');
      log('🔍 Test: Recherche de courses par date', 'blue');
      log('='.repeat(60), 'blue');
      logInfo(`Date cible: ${date}`);
      logInfo('Appel de bettracker.searchRaces()...');
      const races = await bettracker.searchRaces({ date });
      
      if (!races || races.length === 0) {
        logWarning('Aucune course trouvée pour cette date');
        return [];
      }
      
      logSuccess(`${races.length} course(s) trouvée(s)`);
      return races;
    } else {
      return await testGetTodayRaces();
    }
  } catch (error) {
    logError(`Erreur lors de la récupération des courses: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test de récupération du quinté du jour
 */
async function testGetQuinteDuJour() {
  log('\n' + '='.repeat(60), 'blue');
  log('🎯 Test: Récupération du quinté+ du jour', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    logInfo('Appel de bettracker.getQuinteDuJour()...');
    const quinteData = await bettracker.getQuinteDuJour();
    
    if (!quinteData) {
      logWarning('Aucune donnée de quinté trouvée');
      return;
    }
    
    logSuccess('Données du quinté récupérées avec succès');
    
    // Afficher les informations principales
    log('\n📊 Informations de la course:', 'cyan');
    log(`   ID: ${quinteData.id || 'N/A'}`, 'yellow');
    log(`   Nom: ${quinteData.name || 'N/A'}`);
    log(`   Hippodrome: ${quinteData.hippodrome || 'N/A'}`);
    log(`   Date: ${quinteData.date || 'N/A'}`);
    log(`   Surface: ${quinteData.surface || 'N/A'}`);
    log(`   Distance: ${quinteData.distance || 'N/A'}`);
    log(`   Partants: ${quinteData.nbPartants || quinteData.horses?.length || 'N/A'}`);
    
    // Afficher les chevaux si disponibles
    if (quinteData.horses && quinteData.horses.length > 0) {
      log(`\n🐴 Chevaux (${quinteData.horses.length}):`, 'cyan');
      const displayCount = Math.min(5, quinteData.horses.length);
      quinteData.horses.slice(0, displayCount).forEach((horse, index) => {
        log(`   ${index + 1}. ${horse.name || 'N/A'} (N°${horse.numero || 'N/A'})`, 'yellow');
        if (horse.cote) log(`      Cote: ${horse.cote}`);
        if (horse.musique) log(`      Musique: ${horse.musique}`);
      });
      if (quinteData.horses.length > displayCount) {
        log(`   ... et ${quinteData.horses.length - displayCount} autres chevaux`);
      }
    }
    
    return quinteData;
  } catch (error) {
    logError(`Erreur lors de la récupération du quinté: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test d'analyse d'une course PMU
 */
async function testGetRaceAnalysis(options) {
  log('\n' + '='.repeat(60), 'blue');
  log('📋 Test: Analyse d\'une course PMU', 'blue');
  log('='.repeat(60), 'blue');
  
  const { hippodrome_code, race_number, date } = options || {};
  
  if (!hippodrome_code || !race_number || !date) {
    logWarning('Options incomplètes. Test ignoré.');
    logInfo('Usage: node scripts/test-bettracker.js --endpoint race --hippodrome_code=M3 --race_number=5 --date=2025-01-15');
    return;
  }
  
  try {
    logInfo(`Hippodrome: ${hippodrome_code}, Course: ${race_number}, Date: ${date}`);
    logInfo('Appel de bettracker.getRaceAnalysis()...');
    const raceAnalysis = await bettracker.getRaceAnalysis({
      hippodrome_code,
      race_number: parseInt(race_number),
      date
    });
    
    if (!raceAnalysis) {
      logWarning('Aucune analyse trouvée');
      return;
    }
    
    logSuccess('Analyse de la course récupérée avec succès');
    
    // Afficher les informations principales
    log('\n📊 Informations de l\'analyse:', 'cyan');
    console.log(JSON.stringify(raceAnalysis, null, 2));
    
    return raceAnalysis;
  } catch (error) {
    logError(`Erreur lors de l'analyse: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test de récupération des pronostics IA
 */
async function testGetAIPronostics() {
  log('\n' + '='.repeat(60), 'blue');
  log('🤖 Test: Pronostics IA', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    logInfo('Appel de bettracker.getAIPronostics()...');
    const pronostics = await bettracker.getAIPronostics({ status: 'validated' });
    
    if (!pronostics || pronostics.length === 0) {
      logWarning('Aucun pronostic trouvé');
      return [];
    }
    
    logSuccess(`${pronostics.length} pronostic(s) trouvé(s)`);
    
    // Afficher les premiers pronostics
    const displayCount = Math.min(3, pronostics.length);
    log(`\n📋 Affichage des ${displayCount} premiers pronostics:`, 'cyan');
    pronostics.slice(0, displayCount).forEach((pronostic, index) => {
      log(`\n${index + 1}. Pronostic:`, 'yellow');
      console.log(JSON.stringify(pronostic, null, 2));
    });
    
    return pronostics;
  } catch (error) {
    logError(`Erreur lors de la récupération des pronostics: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test de récupération des statistiques utilisateur
 */
async function testGetUserStats() {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test: Statistiques utilisateur', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    logInfo('Appel de bettracker.getUserStats()...');
    const stats = await bettracker.getUserStats({ period: 'month' });
    
    if (!stats) {
      logWarning('Aucune statistique trouvée');
      return;
    }
    
    logSuccess('Statistiques récupérées avec succès');
    
    // Afficher les statistiques
    log('\n📊 Statistiques:', 'cyan');
    console.log(JSON.stringify(stats, null, 2));
    
    return stats;
  } catch (error) {
    logError(`Erreur lors de la récupération des stats: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test de connexion basique
 */
async function testConnection() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔌 Test: Connexion à l\'API BetTracker', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    // Test simple avec un endpoint qui devrait exister
    logInfo('Test de connexion basique...');
    await bettracker.getRaces();
    logSuccess('Connexion à l\'API réussie');
    return true;
  } catch (error) {
    logError(`Échec de la connexion: ${error.message}`);
    if (error.message.includes('BETTRACKER_API_KEY')) {
      logWarning('Vérifiez que la clé API est correctement configurée');
    }
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 Tests de l\'API BetTracker Pro', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // Vérifier la configuration
  if (!testConfiguration()) {
    process.exit(1);
  }
  
  // Récupérer les arguments
  const args = process.argv.slice(2);
  const endpoint = args.find(arg => arg.startsWith('--endpoint'))?.split('=')[1];
  const hippodromeCode = args.find(arg => arg.startsWith('--hippodrome_code'))?.split('=')[1];
  const raceNumber = args.find(arg => arg.startsWith('--race_number'))?.split('=')[1];
  const date = args.find(arg => arg.startsWith('--date'))?.split('=')[1];
  
  try {
    // Test de connexion
    const connected = await testConnection();
    if (!connected) {
      logError('Impossible de se connecter à l\'API. Vérifiez votre configuration.');
      process.exit(1);
    }
    
    // Exécuter les tests selon l'endpoint spécifié
    switch (endpoint) {
      case 'races':
        await testGetRaces(date);
        break;
      
      case 'quinte':
        await testGetQuinteDuJour();
        break;
      
      case 'race':
        await testGetRaceAnalysis({
          hippodrome_code: hippodromeCode,
          race_number: raceNumber,
          date
        });
        break;
      
      case 'pronostics':
        await testGetAIPronostics();
        break;
      
      case 'stats':
        await testGetUserStats();
        break;
      
      default:
        // Exécuter tous les tests
        log('\n📝 Exécution de tous les tests...', 'yellow');
        await testGetTodayRaces();
        await testGetQuinteDuJour();
        await testGetAIPronostics();
        await testGetUserStats();
        break;
    }
    
    log('\n' + '='.repeat(60), 'green');
    log('✅ Tous les tests terminés avec succès', 'green');
    log('='.repeat(60), 'green');
    
  } catch (error) {
    log('\n' + '='.repeat(60), 'red');
    log('❌ Erreur lors des tests', 'red');
    log('='.repeat(60), 'red');
    logError(error.message);
    if (error.stack) {
      logError(`Stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Exécuter les tests
if (require.main === module) {
  main().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = {
  testConfiguration,
  testConnection,
  testGetTodayRaces,
  testGetRaces,
  testGetQuinteDuJour,
  testGetRaceAnalysis,
  testGetAIPronostics,
  testGetUserStats
};

