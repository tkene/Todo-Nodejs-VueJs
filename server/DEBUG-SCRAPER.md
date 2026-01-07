# Guide de Débogage du Scraper PMU

## 🔍 Méthodes de débogage

### 1. Utiliser le script de test

Le moyen le plus simple pour tester et débugger le scraper :

```bash
# Tester une course spécifique
npm run test:scraper R1C8

# Ou directement avec node
node scripts/test-scraper.js R1C8

# Lister les courses disponibles
node scripts/test-scraper.js --list
```

### 2. Logs détaillés

J'ai ajouté des logs `[DEBUG]` dans le code. Pour les voir :

1. **Dans la console du serveur** : Les logs apparaissent automatiquement
2. **Format des logs** :
   - `[DEBUG]` : Informations de débogage détaillées
   - `[ANALYSIS]` : Logs du module d'analyse

### 3. Points de contrôle

Le scraper essaie plusieurs approches dans cet ordre :

1. **API PMU** (`https://www.pmu.fr/api/programme/{date}`)
   - ✅ Si ça fonctionne : données JSON structurées
   - ❌ Si ça échoue : passe au scraping HTML

2. **Scraping HTML** (`https://www.pmu.fr/turf/resultats/{date}/R{reunion}/C{course}`)
   - Parse la page HTML avec Cheerio
   - Extrait les données des sélecteurs CSS

## 🐛 Erreurs courantes et solutions

### Erreur : "Page non trouvée (404)"

**Cause** : La course n'existe pas encore ou la date est incorrecte.

**Solution** :
- Vérifier que la date est correcte (aujourd'hui)
- Vérifier que le format `R1C8` est correct
- Essayer une autre course

### Erreur : "Timeout"

**Cause** : Le serveur PMU met trop de temps à répondre.

**Solution** :
- Vérifier votre connexion internet
- Le site PMU peut être surchargé, réessayer plus tard
- Augmenter le timeout dans `scraper.js` (ligne 109)

### Erreur : "Structure de réponse invalide"

**Cause** : Le format de la réponse a changé ou est différent.

**Solution** :
- Vérifier les logs `[DEBUG]` pour voir la structure reçue
- Adapter les sélecteurs CSS dans `scrapePMUHTML()`

### Erreur : "Aucune donnée de chevaux trouvée"

**Cause** : Le scraping n'a pas trouvé de chevaux dans la page.

**Solution** :
- Vérifier que la page HTML contient bien les données
- Les sélecteurs CSS peuvent avoir changé
- Inspecter la page PMU dans le navigateur pour trouver les bons sélecteurs

## 🔧 Débogage avancé

### 1. Voir la réponse HTTP complète

Ajoutez ce code temporairement dans `scraper.js` :

```javascript
console.log('[DEBUG] Réponse complète:', JSON.stringify(response.data, null, 2));
```

### 2. Sauvegarder le HTML pour inspection

```javascript
const fs = require('fs');
fs.writeFileSync('debug-pmu.html', response.data);
console.log('[DEBUG] HTML sauvegardé dans debug-pmu.html');
```

### 3. Tester les sélecteurs CSS

Utilisez un outil comme [Cheerio Playground](https://cheerio.js.org/) pour tester vos sélecteurs.

### 4. Vérifier les headers HTTP

Les sites peuvent bloquer les requêtes sans les bons headers. Vérifiez que :
- `User-Agent` est présent
- `Referer` pointe vers le bon domaine
- `Accept` correspond au type de contenu attendu

## 📊 Structure des logs

Quand tout fonctionne, vous devriez voir :

```
[DEBUG] Tentative API PMU: https://www.pmu.fr/api/programme/2025-01-XX
[DEBUG] API PMU Status: 200
[DEBUG] Nombre de réunions trouvées: 2
[DEBUG] Réunion 1 trouvée, nombre de courses: 8
[DEBUG] Course 8 trouvée dans l'API
[ANALYSIS] Données récupérées: { courseId: 'R1C8', name: '...', ... }
```

## 🚨 En cas d'erreur persistante

1. **Vérifier les logs complets** : Regardez tous les `[DEBUG]` dans la console
2. **Tester manuellement** : Ouvrez l'URL dans un navigateur pour voir si elle existe
3. **Vérifier la date** : Les courses peuvent ne pas être disponibles pour toutes les dates
4. **Fallback** : Le système génère des courses par défaut si le scraping échoue complètement

## 💡 Astuces

- Utilisez `npm run test:scraper` avant de tester dans l'interface web
- Les erreurs sont maintenant plus détaillées avec la stack trace complète
- Les timeouts sont configurés à 15 secondes pour le HTML, 10 secondes pour l'API

