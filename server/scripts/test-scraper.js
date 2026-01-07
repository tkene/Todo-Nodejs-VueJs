/**
 * Script de test pour débugger le scraper PMU
 * Usage: node scripts/test-scraper.js R1C8
 */

require('dotenv').config();
const scraper = require('../modules/scraper');

async function testScraper() {
  const courseId = process.argv[2] || 'R1C8';
  
  console.log('='.repeat(60));
  console.log(`🧪 Test du scraper pour la course: ${courseId}`);
  console.log('='.repeat(60));
  console.log('');
  
  try {
    console.log('📡 Test 1: Récupération des données de course...');
    const raceData = await scraper.scrapeRaceData(courseId);
    
    console.log('✅ Données récupérées avec succès!');
    console.log('');
    console.log('📊 Résumé:');
    console.log(`   - Course: ${raceData.name}`);
    console.log(`   - Hippodrome: ${raceData.hippodrome}`);
    console.log(`   - Surface: ${raceData.surface}`);
    console.log(`   - Corde: ${raceData.corde}`);
    console.log(`   - Nombre de chevaux: ${raceData.horses.length}`);
    console.log('');
    
    if (raceData.horses.length > 0) {
      console.log('🐴 Premiers chevaux:');
      raceData.horses.slice(0, 3).forEach((horse, index) => {
        console.log(`   ${index + 1}. ${horse.name} (N°${horse.numero})`);
        console.log(`      - Musique: ${horse.musique || 'N/A'}`);
        console.log(`      - Poids: ${horse.poids || 'N/A'} kg`);
        console.log(`      - Cote: ${horse.cote || 'N/A'}`);
      });
      console.log('');
    }
    
    // Test du sentiment forum pour le premier cheval
    if (raceData.horses.length > 0) {
      const firstHorse = raceData.horses[0];
      console.log(`📝 Test 2: Scraping du sentiment forum pour "${firstHorse.name}"...`);
      const sentiment = await scraper.scrapeForumSentiment(firstHorse.name, raceData.name);
      
      console.log('✅ Sentiment récupéré!');
      console.log(`   - Sentiment: ${sentiment.sentiment}`);
      console.log(`   - Score: ${sentiment.sentimentScore}`);
      console.log(`   - Commentaires analysés: ${sentiment.commentCount}`);
      console.log('');
    }
    
    console.log('='.repeat(60));
    console.log('✅ Tous les tests sont passés!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('❌ ERREUR DÉTECTÉE:');
    console.error('='.repeat(60));
    console.error(`Message: ${error.message}`);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    console.error('Détails de l\'erreur:');
    if (error.response) {
      console.error(`   - Status HTTP: ${error.response.status}`);
      console.error(`   - URL: ${error.config?.url}`);
      console.error(`   - Headers:`, error.response.headers);
    }
    if (error.code) {
      console.error(`   - Code erreur: ${error.code}`);
    }
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// Test de la liste des courses
async function testAvailableRaces() {
  console.log('📋 Test: Liste des courses disponibles...');
  try {
    const races = await scraper.getAvailableRaces();
    console.log(`✅ ${races.length} courses trouvées`);
    races.slice(0, 5).forEach(race => {
      console.log(`   - ${race.label}`);
    });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter les tests
(async () => {
  if (process.argv[2] === '--list') {
    await testAvailableRaces();
  } else {
    await testScraper();
  }
})();

