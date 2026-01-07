/**
 * Script pour tester l'API Boturfers et voir le format de réponse
 */

require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function testBoturfers() {
  console.log('='.repeat(60));
  console.log('🔍 Test de l\'API Boturfers');
  console.log('='.repeat(60));
  console.log('');
  
  // Test 1: Widget des partants du quinté
  console.log('📡 Test 1: Widget partants du quinté');
  try {
    const widgetUrl = 'https://www.boturfers.fr/public/widgets/widget1.php?cat=partant&rxcx=quinte';
    console.log(`URL: ${widgetUrl}`);
    
    const response = await axios.get(widgetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Referer': 'https://www.boturfers.fr/'
      },
      timeout: 15000
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Taille: ${response.data?.length || 0} caractères`);
    
    // Sauvegarder le HTML
    const filename = `debug-boturfers-widget1-${Date.now()}.html`;
    const filepath = path.join(__dirname, '..', filename);
    fs.writeFileSync(filepath, response.data);
    console.log(`✅ HTML sauvegardé dans: ${filename}`);
    
    // Analyser le contenu
    const $ = cheerio.load(response.data);
    console.log(`\n📊 Structure HTML:`);
    console.log(`  - Titre: ${$('title').text()}`);
    console.log(`  - Scripts: ${$('script').length}`);
    console.log(`  - Divs: ${$('div').length}`);
    console.log(`  - Tables: ${$('table').length}`);
    
    // Chercher R1C1, R2C1, etc.
    const bodyText = $('body').text();
    const raceMatches = bodyText.match(/R\d+\s*C\d+/gi);
    if (raceMatches) {
      console.log(`  - Patterns de courses trouvés: ${raceMatches.length}`);
      console.log(`    Exemples: ${raceMatches.slice(0, 5).join(', ')}`);
    }
    
    // Afficher un extrait du HTML
    const htmlExcerpt = response.data.substring(0, 1000);
    console.log(`\n📄 Extrait HTML (1000 premiers caractères):`);
    console.log(htmlExcerpt);
    
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
  
  console.log('\n');
  
  // Test 2: Widget évolutif
  console.log('📡 Test 2: Widget évolutif du quinté');
  try {
    const widgetUrl = 'https://www.boturfers.fr/public/widgets/widget-quinte-v1.php?style=default';
    console.log(`URL: ${widgetUrl}`);
    
    const response = await axios.get(widgetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Referer': 'https://www.boturfers.fr/'
      },
      timeout: 15000
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Taille: ${response.data?.length || 0} caractères`);
    
    // Sauvegarder le HTML
    const filename = `debug-boturfers-widget-evolutif-${Date.now()}.html`;
    const filepath = path.join(__dirname, '..', filename);
    fs.writeFileSync(filepath, response.data);
    console.log(`✅ HTML sauvegardé dans: ${filename}`);
    
    // Analyser le contenu
    const $ = cheerio.load(response.data);
    const bodyText = $('body').text() || response.data;
    
    // Chercher les patterns de courses
    const raceMatches = bodyText.match(/R\d+\s*C\d+/gi);
    if (raceMatches) {
      console.log(`  - Patterns de courses trouvés: ${raceMatches.length}`);
      console.log(`    Exemples: ${raceMatches.slice(0, 5).join(', ')}`);
    }
    
    // Essayer d'extraire les données complètes
    console.log(`\n📋 Extraction des données:`);
    const fullText = response.data;
    
    // Pattern complet
    const pattern1 = /R(\d+)C(\d+)\s*-\s*([^-]+?)\s*-\s*(\d+)\s*partants?\s*-\s*([^-]+?)\s*-\s*([^-]+?)\s*-\s*(\d{1,2})h(\d{2})/gi;
    let match;
    let extractedCount = 0;
    while ((match = pattern1.exec(fullText)) !== null && extractedCount < 5) {
      extractedCount++;
      console.log(`  ${extractedCount}. R${match[1]}C${match[2]} - ${match[3].trim()} - ${match[7]}h${match[8]}`);
    }
    
    if (extractedCount === 0) {
      // Essayer pattern simple
      const pattern2 = /R(\d+)C(\d+)/gi;
      let match2;
      let simpleCount = 0;
      while ((match2 = pattern2.exec(fullText)) !== null && simpleCount < 10) {
        simpleCount++;
        const startIndex = match2.index;
        const context = fullText.substring(startIndex, startIndex + 200);
        console.log(`  ${simpleCount}. R${match2[1]}C${match2[2]} - Contexte: ${context.substring(0, 100)}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
  
  console.log('\n');
  console.log('='.repeat(60));
  console.log('🏁 Fin du test');
  console.log('='.repeat(60));
}

testBoturfers().catch(console.error);

