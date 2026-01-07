/**
 * Script pour inspecter la structure HTML réelle du site PMU
 * Usage: node scripts/inspect-pmu-page.js 2025-12-31
 */

require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function inspectPMUPage() {
  const dateStr = process.argv[2] || new Date().toISOString().split('T')[0];
  
  console.log('='.repeat(60));
  console.log(`🔍 Inspection de la page PMU pour le ${dateStr}`);
  console.log('='.repeat(60));
  console.log('');
  
  const urls = [
    `https://www.pmu.fr/turf/programme/${dateStr}`,
    `https://www.pmu.fr/offre/jeux-pmu/turf/programme/${dateStr}`,
    `https://www.pmu.fr/turf/programmes/${dateStr}`,
    `https://www.pmu.fr/turf/courses/${dateStr}`
  ];
  
  for (const url of urls) {
    try {
      console.log(`📡 Test de: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'fr-FR,fr;q=0.9',
          'Referer': 'https://www.pmu.fr/'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${response.headers['content-type']}`);
      console.log(`  Taille: ${response.data?.length || 0} caractères`);
      
      if (response.status === 200 && response.data) {
        // Sauvegarder le HTML
        const filename = `debug-pmu-${dateStr.replace(/-/g, '')}-${Date.now()}.html`;
        const filepath = path.join(__dirname, '..', filename);
        fs.writeFileSync(filepath, response.data);
        console.log(`  ✅ HTML sauvegardé dans: ${filename}`);
        
        // Analyser la structure
        const $ = cheerio.load(response.data);
        console.log('');
        console.log('📊 Structure HTML trouvée:');
        console.log(`  - Titre: ${$('title').text()}`);
        console.log(`  - Scripts: ${$('script').length}`);
        console.log(`  - Éléments avec "course" dans la classe: ${$('[class*="course"]').length}`);
        console.log(`  - Éléments avec "race" dans la classe: ${$('[class*="race"]').length}`);
        console.log(`  - Éléments avec "reunion" dans la classe: ${$('[class*="reunion"]').length}`);
        console.log(`  - Éléments avec "programme" dans la classe: ${$('[class*="programme"]').length}`);
        console.log(`  - Tableaux: ${$('table').length}`);
        console.log(`  - Textes contenant "R1C1" ou similaire: ${$('*:contains("R1")').length}`);
        
        // Chercher des patterns R1C1, R2C1, etc.
        const bodyText = $('body').text();
        const raceMatches = bodyText.match(/R\d+\s*C\d+/gi);
        if (raceMatches) {
          console.log(`  - Patterns de courses trouvés: ${raceMatches.length}`);
          console.log(`    Exemples: ${raceMatches.slice(0, 5).join(', ')}`);
        }
        
        // Chercher dans les scripts
        let foundInScripts = false;
        $('script').each((i, script) => {
          const content = $(script).html() || '';
          if (content.includes('reunion') || content.includes('course') || content.includes('programme')) {
            if (!foundInScripts) {
              console.log(`  - Scripts contenant "reunion/course/programme": OUI`);
              foundInScripts = true;
              
              // Extraire un extrait du script
              const excerpt = content.substring(0, 500);
              console.log(`    Extrait: ${excerpt}...`);
            }
          }
        });
        
        console.log('');
        console.log('💡 Pour inspecter le HTML, ouvrez le fichier sauvegardé dans un navigateur');
        console.log('');
        
        return; // Arrêter après le premier succès
      }
      
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}`);
      if (error.response) {
        console.log(`     Status: ${error.response.status}`);
      }
    }
    console.log('');
  }
}

inspectPMUPage().catch(console.error);

