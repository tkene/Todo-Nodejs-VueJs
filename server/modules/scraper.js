const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Récupère les données d'une course depuis Boturfers
 * @param {string} courseId - Format "R1C8" (Réunion 1, Course 8)
 * @param {string} targetDateStr - Date au format YYYY-MM-DD (optionnel)
 */
async function scrapeRaceData(courseId, targetDateStr = null) {
  try {
    // Parser le courseId
    const match = courseId.match(/R(\d+)C(\d+)/);
    if (!match) {
      throw new Error(`Format de courseId invalide: ${courseId}. Format attendu: R1C8`);
    }
    
    const reunion = parseInt(match[1]);
    const course = parseInt(match[2]);
    
    // Utiliser Boturfers pour récupérer les données de la course
    const raceData = await getRaceDataFromBoturfers(courseId, reunion, course, targetDateStr);
    
    return raceData;
  } catch (error) {
    console.error('[DEBUG] Erreur lors de la récupération des données de course:', {
      message: error.message,
      stack: error.stack,
      courseId
    });
    throw error;
  }
}

/**
 * Récupère les données d'une course spécifique depuis Boturfers
 * @param {string} courseId - Format "R1C8"
 * @param {number} reunion - Numéro de réunion
 * @param {number} course - Numéro de course
 * @param {string} targetDateStr - Date au format YYYY-MM-DD (optionnel)
 */
async function getRaceDataFromBoturfers(courseId, reunion, course, targetDateStr = null) {
  try {
    // Boturfers propose un widget pour les partants d'une course spécifique
    // Format: widget1.php?cat=partant&rxcx=R1C1
    const widgetUrl = `https://www.boturfers.fr/public/widgets/widget1.php?cat=partant&rxcx=R${reunion}C${course}`;
    
    console.log(`[DEBUG] Récupération des données de course depuis Boturfers: ${widgetUrl}`);
    
    const response = await axios.get(widgetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Referer': 'https://www.boturfers.fr/'
      },
      timeout: 15000
    });
    
    if (response.status !== 200 || !response.data) {
      throw new Error(`Boturfers a retourné un status ${response.status}`);
    }
    
    // Le widget retourne du JavaScript qui génère du HTML
    // Extraire le contenu HTML depuis le document.write
    const htmlContent = response.data;
    
    // Parser le HTML généré
    const $ = cheerio.load(htmlContent);
    
    // Extraire les informations de la course depuis le premier paragraphe
    // Format: "R1C1 - DEAUVILLE - 16 partants - 1 900 m - Plat - 13h55"
    const courseInfoText = $('p').first().text() || '';
    const infoMatch = courseInfoText.match(/R(\d+)C(\d+)\s*-\s*([^-]+)\s*-\s*(\d+)\s*partants?\s*-\s*([^-]+)\s*-\s*([^-]+)\s*-\s*(\d{1,2})h(\d{2})/i);
    
    let hippodrome = 'Inconnu';
    let surface = 'Herbe';
    let corde = 'Non spécifiée';
    let raceName = `Course ${course}`;
    let courseTime = null;
    
    if (infoMatch) {
      hippodrome = infoMatch[3].trim();
      const distance = infoMatch[5].trim();
      const type = infoMatch[6].trim();
      const hour = parseInt(infoMatch[7]);
      const minute = parseInt(infoMatch[8]);
      courseTime = hour * 60 + minute;
      
      // Déterminer la surface selon le type
      if (type.includes('PSF') || type.includes('psf')) {
        surface = 'PSF';
      } else if (type.includes('Plat')) {
        surface = 'Herbe';
      } else {
        surface = 'Herbe'; // Par défaut
      }
    }
    
    // Extraire le nom de la course depuis le titre h2
    const titleText = $('h2').first().text() || '';
    if (titleText) {
      // Format: "Quinté du mardi 30 décembre 2025 : Prix Ouest France (prix De Sainte-Mere-Eglise)"
      const nameMatch = titleText.match(/:\s*(.+?)(?:\s*\(|$)/);
      if (nameMatch) {
        raceName = nameMatch[1].trim();
      }
    }
    
    // Extraire les chevaux depuis le tableau
    const horses = [];
    $('table.boturfers tbody tr').each((index, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      
      if (cells.length >= 3) {
        const numero = parseInt($row.find('td').eq(0).text().trim()) || index + 1;
        const name = $row.find('td').eq(1).text().trim() || `Cheval ${numero}`;
        
        // Extraire la musique (si présente)
        let musique = null;
        const musiqueCell = cells.filter((i, cell) => {
          const text = $(cell).text().trim();
          return /^\d+-\d+-\d+/.test(text);
        });
        if (musiqueCell.length > 0) {
          musique = $(musiqueCell[0]).text().trim();
        }
        
        // Extraire les cotes PMU et ZeTurf
        let cote = null;
        let coteInitiale = null;
        const coteCells = $row.find('td').filter((i, cell) => {
          const text = $(cell).text().trim();
          return /^\d+[,.]\d+$/.test(text);
        });
        if (coteCells.length > 0) {
          const coteText = $(coteCells[0]).text().trim().replace(',', '.');
          cote = parseFloat(coteText);
          coteInitiale = cote;
        }
        
        // Extraire le poids (si présent)
        let poids = null;
        const poidsText = $row.text().match(/(\d+[,.]?\d*)\s*kg/i);
        if (poidsText) {
          poids = parseFloat(poidsText[1].replace(',', '.'));
        }
        
        horses.push({
          numero,
          name,
          musique,
          poids,
          cote,
          coteInitiale,
          aptitudPSF: surface === 'PSF' && Math.random() > 0.4 // À améliorer avec vraies données
        });
      }
    });
    
    // Si on n'a pas trouvé de chevaux dans le tableau, essayer une autre structure
    if (horses.length === 0) {
      $('table tr').each((index, row) => {
        const $row = $(row);
        const text = $row.text();
        const numeroMatch = text.match(/^(\d+)/);
        if (numeroMatch) {
          const numero = parseInt(numeroMatch[1]);
          const nameMatch = text.match(/\d+\s+(.+?)(?:\s+SA|\s+\d|$)/);
          const name = nameMatch ? nameMatch[1].trim() : `Cheval ${numero}`;
          
          horses.push({
            numero,
            name,
            musique: null,
            poids: null,
            cote: null,
            coteInitiale: null,
            aptitudPSF: false
          });
        }
      });
    }
    
    // Déterminer la date
    const date = targetDateStr ? new Date(targetDateStr) : new Date();
    
    return {
      courseId,
      name: raceName,
      surface,
      hippodrome,
      corde,
      date,
      horses
    };
  } catch (error) {
    console.error(`[DEBUG] Erreur lors de la récupération des données depuis Boturfers: ${error.message}`);
    throw error;
  }
}

/**
 * Scrape le sentiment du forum pour un cheval
 * @param {string} horseName - Nom du cheval
 * @param {string} raceName - Nom de la course
 */
async function scrapeForumSentiment(horseName, raceName) {
  try {
    // Forums de turf populaires
    const forums = [
      'https://www.zone-turf.fr',
      'https://www.turfomania.fr',
      'https://www.geny.com'
    ];
    
    let totalSentiment = 0;
    let commentCount = 0;
    const sentiments = [];
    
    for (const forumBaseUrl of forums) {
      try {
        // Rechercher des discussions sur le cheval
        const searchUrl = `${forumBaseUrl}/recherche?q=${encodeURIComponent(horseName + ' ' + raceName)}`;
        
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Referer': forumBaseUrl
          },
          timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Analyser les commentaires/discussions
        $('.comment, .post, .message, [class*="comment"]').each((index, element) => {
          const $el = $(element);
          const text = $el.text().toLowerCase();
          
          // Analyse de sentiment basique
          const positiveWords = ['gagnant', 'favori', 'excellent', 'fort', 'bon', 'top', 'meilleur', 'chance', 'gagné'];
          const negativeWords = ['perdant', 'faible', 'mauvais', 'décevant', 'éviter', 'risque', 'perdu'];
          
          let sentimentScore = 0;
          positiveWords.forEach(word => {
            if (text.includes(word)) sentimentScore += 1;
          });
          negativeWords.forEach(word => {
            if (text.includes(word)) sentimentScore -= 1;
          });
          
          if (sentimentScore !== 0) {
            sentiments.push(sentimentScore);
            commentCount++;
          }
        });
      } catch (forumError) {
        console.log(`Erreur lors du scraping du forum ${forumBaseUrl}:`, forumError.message);
        // Continuer avec les autres forums
      }
    }
    
    // Calculer le sentiment moyen
    if (sentiments.length > 0) {
      totalSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
      // Normaliser entre -100 et +100
      totalSentiment = Math.max(-100, Math.min(100, totalSentiment * 20));
    }
    
    // Déterminer la catégorie de sentiment
    let sentimentCategory = 'neutre';
    if (totalSentiment >= 70) {
      sentimentCategory = 'très_positif';
    } else if (totalSentiment >= 30) {
      sentimentCategory = 'positif';
    } else if (totalSentiment <= -70) {
      sentimentCategory = 'très_négatif';
    } else if (totalSentiment <= -30) {
      sentimentCategory = 'négatif';
    }
    
    return {
      sentiment: sentimentCategory,
      sentimentScore: parseFloat(totalSentiment.toFixed(2)),
      commentCount
    };
  } catch (error) {
    console.error('Erreur lors du scraping du forum:', error.message);
    // Retourner un sentiment neutre en cas d'erreur
    return {
      sentiment: 'neutre',
      sentimentScore: 0,
      commentCount: 0
    };
  }
}

/**
 * Récupère la liste des courses disponibles depuis Boturfers
 * Utilise uniquement les vraies données de l'API/widget Boturfers
 * @param {string} targetDateStr - Date au format YYYY-MM-DD (optionnel, défaut: aujourd'hui)
 * @returns {Array} Liste des courses trouvées (vide si aucune course n'est disponible)
 */
async function getAvailableRaces(targetDateStr = null) {
  try {
    const now = new Date();
    
    // Si une date est fournie, l'utiliser, sinon utiliser aujourd'hui
    let baseDate = now;
    if (targetDateStr) {
      baseDate = new Date(targetDateStr);
      // S'assurer que la date est valide
      if (isNaN(baseDate.getTime())) {
        throw new Error(`Date invalide: ${targetDateStr}. Format attendu: YYYY-MM-DD`);
      }
    }
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Temps en minutes depuis minuit
    
    // Si une date cible est fournie, calculer le décalage par rapport à aujourd'hui
    const dayOffset = targetDateStr ? Math.floor((baseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const dateStr = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`;
    
    // Utiliser uniquement l'API/widget Boturfers pour récupérer les vraies courses
    console.log(`[DEBUG] Récupération des courses depuis Boturfers pour ${dateStr}`);
    const races = await getRacesFromBoturfers(dateStr, currentTime, dayOffset);
    
    // Trier par heure
    races.sort((a, b) => (a.heure || 0) - (b.heure || 0));
    
    if (races.length > 0) {
      console.log(`[DEBUG] ✅ ${races.length} courses trouvées via Boturfers`);
    } else {
      console.log(`[DEBUG] ⚠️ Aucune course trouvée via Boturfers pour ${dateStr}`);
    }
    
    // Retourner uniquement les vraies données de Boturfers (pas de fallback)
    return races;
  } catch (error) {
    console.error('Erreur lors de la récupération des courses depuis Boturfers:', error.message);
    // En cas d'erreur, retourner un tableau vide plutôt que de générer des courses
    return [];
  }
}

/**
 * Récupère les courses depuis l'API Boturfers
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @param {number} currentTime - Temps actuel en minutes depuis minuit
 * @param {number} dayOffset - Décalage de jours depuis aujourd'hui
 * @returns {Array} Liste des courses trouvées
 */
async function getRacesFromBoturfers(dateStr, currentTime, dayOffset) {
  const races = [];
  
  try {
    // Essayer plusieurs widgets Boturfers
    const widgetUrls = [
      'https://www.boturfers.fr/public/widgets/widget1.php?cat=partant&rxcx=quinte',
      'https://www.boturfers.fr/public/widgets/widget-quinte-v1.php?style=default'
    ];
    
    for (const widgetUrl of widgetUrls) {
      try {
        console.log(`[DEBUG] Tentative avec widget: ${widgetUrl}`);
        
        const response = await axios.get(widgetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9',
            'Referer': 'https://www.boturfers.fr/'
          },
          timeout: 15000,
          validateStatus: function (status) {
            return status < 500;
          }
        });
        
        if (response.status !== 200 || !response.data) {
          console.log(`[DEBUG] Widget retourné un status ${response.status}`);
          continue;
        }
        
        let htmlContent = response.data;
        
        // Si le contenu contient du JavaScript avec document.write, extraire le HTML généré
        // Format: document.write('<html>...</html>');
        const documentWriteMatch = htmlContent.match(/document\.write\s*\(\s*['"](.*?)['"]\s*\)/s);
        if (documentWriteMatch) {
          // Décoder les séquences échappées
          htmlContent = documentWriteMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
          console.log(`[DEBUG] HTML extrait depuis document.write`);
        }
        
        const $ = cheerio.load(htmlContent);
        
        // Méthode 1: Chercher dans le texte brut avec plusieurs patterns flexibles
        const fullText = htmlContent;
        console.log(`[DEBUG] Taille du contenu: ${fullText.length} caractères`);
        
        // Afficher un extrait pour debug (sans caractères spéciaux qui cassent la console)
        const excerpt = fullText.substring(0, 1000).replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        console.log(`[DEBUG] Extrait (1000 premiers caractères): ${excerpt}`);
        
        // Chercher tous les patterns RXCX dans le texte pour voir ce qui est disponible
        const allRXCX = fullText.match(/R\d+C\d+/gi);
        if (allRXCX) {
          console.log(`[DEBUG] Patterns RXCX trouvés dans le HTML: ${allRXCX.length} - Exemples: ${allRXCX.slice(0, 10).join(', ')}`);
        } else {
          console.log(`[DEBUG] ⚠️ Aucun pattern RXCX trouvé dans le HTML`);
        }
        
        // Pattern 1a: Format "R1C6 - VINCENNES - 15 partants - Attele - 7-9 ans - 2700 mètres - Départ vers 15h15"
        const pattern1a = /R(\d+)C(\d+)\s*-\s*([^-]+?)\s*-\s*(\d+)\s*partants?\s*-\s*[^-]+?\s*-\s*[^-]+?\s*-\s*[^-]+?\s*-\s*Départ\s+vers\s+(\d{1,2})h(\d{2})/gi;
        let match;
        let pattern1Count = 0;
        while ((match = pattern1a.exec(fullText)) !== null) {
          pattern1Count++;
          const reunion = parseInt(match[1]);
          const course = parseInt(match[2]);
          const courseId = `R${reunion}C${course}`;
          const hippodrome = match[3].trim();
          const hour = parseInt(match[5]);
          const minute = parseInt(match[6]);
          const courseTime = hour * 60 + minute;
          
          console.log(`[DEBUG] Pattern1a trouvé: ${courseId} - ${hippodrome} - ${formatCourseTime(courseTime)}`);
          
          if (!races.find(r => r.courseId === courseId)) {
            if (isCourseFuture(new Date(dateStr), courseTime, dayOffset, currentTime)) {
              races.push({
                courseId,
                label: `${courseId} - ${hippodrome} - ${formatCourseTime(courseTime)}`,
                name: `Course ${course} - ${hippodrome}`,
                hippodrome,
                date: dateStr,
                heure: courseTime
              });
            }
          }
        }
        
        // Pattern 1b: Format classique "R1C1 - DEAUVILLE - 16 partants - 1 900 m - Plat - 13h55"
        const pattern1b = /R(\d+)C(\d+)\s*-\s*([^-]+?)\s*-\s*(\d+)\s*partants?\s*-\s*([^-]+?)\s*-\s*([^-]+?)\s*-\s*(\d{1,2})h(\d{2})/gi;
        while ((match = pattern1b.exec(fullText)) !== null) {
          pattern1Count++;
          const reunion = parseInt(match[1]);
          const course = parseInt(match[2]);
          const courseId = `R${reunion}C${course}`;
          const hippodrome = match[3].trim();
          const hour = parseInt(match[7]);
          const minute = parseInt(match[8]);
          const courseTime = hour * 60 + minute;
          
          console.log(`[DEBUG] Pattern1b trouvé: ${courseId} - ${hippodrome} - ${formatCourseTime(courseTime)}`);
          
          if (!races.find(r => r.courseId === courseId)) {
            if (isCourseFuture(new Date(dateStr), courseTime, dayOffset, currentTime)) {
              races.push({
                courseId,
                label: `${courseId} - ${hippodrome} - ${formatCourseTime(courseTime)}`,
                name: `Course ${course} - ${hippodrome}`,
                hippodrome,
                date: dateStr,
                heure: courseTime
              });
            }
          }
        }
        console.log(`[DEBUG] Pattern1: ${pattern1Count} matches trouvés`);
        
        // Méthode 2: Chercher R1C1, R2C1, etc. puis extraire les infos autour
        const pattern2 = /R(\d+)C(\d+)/gi;
        const courseIds = new Set();
        let match2;
        let pattern2Count = 0;
        while ((match2 = pattern2.exec(fullText)) !== null) {
          const reunion = parseInt(match2[1]);
          const course = parseInt(match2[2]);
          const courseId = `R${reunion}C${course}`;
          
          if (!courseIds.has(courseId)) {
            courseIds.add(courseId);
            pattern2Count++;
            
            // Chercher les informations autour de ce pattern (dans les 400 caractères suivants)
            const startIndex = match2.index;
            const context = fullText.substring(startIndex, startIndex + 400);
            
            // Extraire l'hippodrome (généralement après R1C1 -)
            // Format: "R1C6 - VINCENNES" ou "R1C1 - DEAUVILLE"
            const hippodromeMatch = context.match(/R\d+C\d+\s*[-\s]+([A-ZÉÈÊÀÁÂÄÇÔÖÙÛÜ][A-ZÉÈÊÀÁÂÄÇÔÖÙÛÜ\s]+?)(?:\s*-\s*|\s+partants|$)/i);
            const hippodrome = hippodromeMatch ? hippodromeMatch[1].trim() : 'Inconnu';
            
            // Extraire l'heure - plusieurs formats possibles:
            // - "Départ vers 15h15"
            // - "13h55"
            // - "15:15"
            let courseTime = null;
            
            // Format "Départ vers 15h15"
            const timeMatch1 = context.match(/Départ\s+vers\s+(\d{1,2})h(\d{2})/i);
            if (timeMatch1) {
              const hour = parseInt(timeMatch1[1]);
              const minute = parseInt(timeMatch1[2]);
              courseTime = hour * 60 + minute;
            } else {
              // Format "15h15" ou "15:15"
              const timeMatch2 = context.match(/(\d{1,2})[h:](\d{2})/);
              if (timeMatch2) {
                const hour = parseInt(timeMatch2[1]);
                const minute = parseInt(timeMatch2[2]);
                // Vérifier que c'est une heure valide (entre 0h00 et 23h59)
                if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                  courseTime = hour * 60 + minute;
                }
              }
            }
            
            console.log(`[DEBUG] Pattern2: ${courseId} - Hippodrome: ${hippodrome}, Heure: ${courseTime ? formatCourseTime(courseTime) : 'N/A'}`);
            console.log(`[DEBUG] Contexte: ${context.substring(0, 150)}`);
            
            // Si on a trouvé une heure valide, ajouter la course
            if (courseTime && !races.find(r => r.courseId === courseId)) {
              if (isCourseFuture(new Date(dateStr), courseTime, dayOffset, currentTime)) {
                races.push({
                  courseId,
                  label: `${courseId} - ${hippodrome} - ${formatCourseTime(courseTime)}`,
                  name: `Course ${course} - ${hippodrome}`,
                  hippodrome,
                  date: dateStr,
                  heure: courseTime
                });
                console.log(`[DEBUG] ✅ Course ajoutée via Pattern2: ${courseId}`);
              }
            }
          }
        }
        console.log(`[DEBUG] Pattern2: ${pattern2Count} patterns RXCX trouvés`);
        
        // Méthode 3: Chercher dans les éléments HTML structurés
        let pattern3Count = 0;
        $('p, div, span, td, th, h1, h2, h3').each((index, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          
          // Chercher R1C1 avec hippodrome et heure dans le même élément
          const match = text.match(/R(\d+)C(\d+)/i);
          if (match && text.length < 500) { // Limiter aux éléments courts pour éviter les faux positifs
            pattern3Count++;
            const reunion = parseInt(match[1]);
            const course = parseInt(match[2]);
            const courseId = `R${reunion}C${course}`;
            
            if (!races.find(r => r.courseId === courseId)) {
              // Extraire hippodrome (mots en majuscules après R1C1)
              const hippodromeMatch = text.match(/R\d+C\d+\s*[-\s]+([A-ZÉÈÊÀÁÂÄÇÔÖÙÛÜ][A-ZÉÈÊÀÁÂÄÇÔÖÙÛÜ\s]+?)(?:\s*-\s*|\s+partants|$)/i);
              const hippodrome = hippodromeMatch ? hippodromeMatch[1].trim() : 'Inconnu';
              
              // Extraire l'heure - plusieurs formats
              let courseTime = null;
              
              // Format "Départ vers 15h15"
              const timeMatch1 = text.match(/Départ\s+vers\s+(\d{1,2})h(\d{2})/i);
              if (timeMatch1) {
                const hour = parseInt(timeMatch1[1]);
                const minute = parseInt(timeMatch1[2]);
                courseTime = hour * 60 + minute;
              } else {
                // Format "15h15" ou "15:15"
                const timeMatch2 = text.match(/(\d{1,2})[h:](\d{2})/);
                if (timeMatch2) {
                  const hour = parseInt(timeMatch2[1]);
                  const minute = parseInt(timeMatch2[2]);
                  if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                    courseTime = hour * 60 + minute;
                  }
                }
              }
              
              console.log(`[DEBUG] Pattern3: ${courseId} dans élément HTML - Text: ${text.substring(0, 150)}`);
              
              if (courseTime && isCourseFuture(new Date(dateStr), courseTime, dayOffset, currentTime)) {
                races.push({
                  courseId,
                  label: `${courseId} - ${hippodrome} - ${formatCourseTime(courseTime)}`,
                  name: `Course ${course} - ${hippodrome}`,
                  hippodrome,
                  date: dateStr,
                  heure: courseTime
                });
                console.log(`[DEBUG] ✅ Course ajoutée via Pattern3: ${courseId}`);
              }
            }
          }
        });
        console.log(`[DEBUG] Pattern3: ${pattern3Count} éléments HTML avec RXCX trouvés`);
        
        // Si on a trouvé des courses avec ce widget, on s'arrête
        if (races.length > 0) {
          console.log(`[DEBUG] ✅ ${races.length} courses trouvées avec ${widgetUrl}`);
          break;
        }
        
      } catch (widgetError) {
        console.log(`[DEBUG] Erreur avec widget ${widgetUrl}: ${widgetError.message}`);
        continue;
      }
    }
    
    // Si on n'a toujours pas trouvé de courses, essayer la page programme
    if (races.length === 0) {
      console.log(`[DEBUG] Aucune course trouvée dans les widgets, tentative de la page programme Boturfers`);
      const programmeUrl = `https://www.boturfers.fr/programme/${dateStr}`;
      
      try {
        const progResponse = await axios.get(programmeUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html',
            'Referer': 'https://www.boturfers.fr/'
          },
          timeout: 15000,
          validateStatus: function (status) {
            return status < 500; // Accepter les 404, 403, etc. pour éviter les exceptions
          }
        });
        
        if (progResponse.status === 200 && progResponse.data) {
          const $prog = cheerio.load(progResponse.data);
          const progText = $prog.text();
          
          // Chercher tous les R1C1, R2C1, etc. dans la page programme
          const progMatches = progText.match(/R(\d+)\s*C(\d+)/gi);
          if (progMatches) {
            progMatches.forEach(match => {
              const details = match.match(/R(\d+)\s*C(\d+)/i);
              if (details) {
                const reunion = parseInt(details[1]);
                const course = parseInt(details[2]);
                const courseId = `R${reunion}C${course}`;
                
                if (!races.find(r => r.courseId === courseId)) {
                  // Chercher l'hippodrome et l'heure dans le contexte
                  const matchIndex = progText.indexOf(match);
                  const context = progText.substring(Math.max(0, matchIndex - 100), matchIndex + 400);
                  
                  // Extraire hippodrome
                  const hippodromeMatch = context.match(/R\d+\s*C\d+\s*[-\s]+([A-ZÉÈÊÀÁÂÄÇÔÖÙÛÜ][A-ZÉÈÊÀÁÂÄÇÔÖÙÛÜ\s]+?)(?:\s*-\s*|\s+partants|$)/i);
                  const hippodrome = hippodromeMatch ? hippodromeMatch[1].trim() : 'Inconnu';
                  
                  // Extraire l'heure - plusieurs formats
                  let courseTime = null;
                  const timeMatch1 = context.match(/Départ\s+vers\s+(\d{1,2})h(\d{2})/i);
                  if (timeMatch1) {
                    const hour = parseInt(timeMatch1[1]);
                    const minute = parseInt(timeMatch1[2]);
                    courseTime = hour * 60 + minute;
                  } else {
                    const timeMatch2 = context.match(/(\d{1,2})[h:](\d{2})/);
                    if (timeMatch2) {
                      const hour = parseInt(timeMatch2[1]);
                      const minute = parseInt(timeMatch2[2]);
                      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                        courseTime = hour * 60 + minute;
                      }
                    }
                  }
                  
                  console.log(`[DEBUG] Programme: ${courseId} - ${hippodrome} - ${courseTime ? formatCourseTime(courseTime) : 'N/A'}`);
                  
                  // Accepter même sans heure si c'est un jour futur
                  if (courseTime || dayOffset > 0) {
                    if (isCourseFuture(new Date(dateStr), courseTime, dayOffset, currentTime)) {
                      races.push({
                        courseId,
                        label: `${courseId} - ${hippodrome}${courseTime ? ' - ' + formatCourseTime(courseTime) : ''}`,
                        name: `Course ${course} - ${hippodrome}`,
                        hippodrome,
                        date: dateStr,
                        heure: courseTime
                      });
                      console.log(`[DEBUG] ✅ Course ajoutée depuis programme: ${courseId}`);
                    }
                  }
                }
              }
            });
          }
        }
      } catch (progError) {
        console.log(`[DEBUG] Erreur lors de l'accès à la page programme Boturfers: ${progError.message}`);
      }
    }
    
  } catch (error) {
    console.log(`[DEBUG] Erreur lors de l'appel à Boturfers: ${error.message}`);
  }
  
  console.log(`[DEBUG] Total de ${races.length} courses extraites depuis Boturfers`);
  return races;
}

/**
 * Parse l'heure d'une course depuis différents formats
 * @param {string|number} heure - Heure de la course (format "HH:MM" ou minutes depuis minuit)
 * @param {string} horaire - Horaire alternatif
 * @returns {number} Minutes depuis minuit (0-1439)
 */
function parseCourseTime(heure, horaire) {
  if (typeof heure === 'number') {
    return heure; // Déjà en minutes
  }
  
  const timeStr = heure || horaire || '';
  const match = timeStr.match(/(\d{1,2})[h:](\d{2})/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return hours * 60 + minutes;
  }
  
  return null;
}

/**
 * Vérifie si une course est future
 * @param {Date} courseDate - Date de la course
 * @param {number} courseTime - Heure de la course en minutes depuis minuit
 * @param {number} dayOffset - Nombre de jours depuis aujourd'hui
 * @param {number} currentTime - Temps actuel en minutes depuis minuit
 * @returns {boolean}
 */
function isCourseFuture(courseDate, courseTime, dayOffset, currentTime) {
  if (!courseTime) {
    // Si pas d'heure, considérer comme future si c'est un jour futur
    return dayOffset > 0;
  }
  
  if (dayOffset === 0) {
    // Aujourd'hui : vérifier l'heure
    return courseTime > currentTime;
  }
  
  // Jour futur : toujours future
  return true;
}

/**
 * Formate l'heure depuis les minutes
 * @param {number} minutes - Minutes depuis minuit
 * @returns {string} Format "HH:MM"
 */
function formatTimeFromMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Formate l'heure pour l'affichage
 * @param {number} courseTime - Minutes depuis minuit
 * @returns {string}
 */
function formatCourseTime(courseTime) {
  if (!courseTime) return '';
  return formatTimeFromMinutes(courseTime);
}

module.exports = {
  scrapeRaceData,
  scrapeForumSentiment,
  getAvailableRaces
};
