# Guide de test de l'API BetTracker

Ce script permet de tester l'intégration avec l'API BetTracker Pro.

## Prérequis

1. Avoir configuré la clé API dans le fichier `.env` :
   ```env
   BETTRACKER_API_KEY=votre_cle_api_ici
   ```

2. Avoir installé les dépendances :
   ```bash
   npm install
   ```

## Utilisation

### Tous les tests

Exécuter tous les tests disponibles :

```bash
npm run test:bettracker
```

ou directement :

```bash
node scripts/test-bettracker.js
```

### Test spécifique : Récupération des courses

```bash
npm run test:bettracker:races
```

ou avec une date spécifique :

```bash
node scripts/test-bettracker.js --endpoint=races --date=2025-01-15
```

### Test spécifique : Quinté du jour

```bash
npm run test:bettracker:quinte
```

ou directement :

```bash
node scripts/test-bettracker.js --endpoint=quinte
```

### Test spécifique : Détails d'une course

```bash
node scripts/test-bettracker.js --endpoint=race --raceId=12345
```

### Test spécifique : Statistiques d'un cheval

```bash
node scripts/test-bettracker.js --endpoint=horse --horseId=67890
```

## Options disponibles

- `--endpoint=<type>` : Type de test à exécuter
  - `races` : Test de récupération des courses
  - `quinte` : Test de récupération du quinté du jour
  - `race` : Test de récupération des détails d'une course
  - `horse` : Test de récupération des stats d'un cheval
  - (aucun) : Exécute tous les tests

- `--date=<YYYY-MM-DD>` : Date pour les tests de courses (optionnel, défaut: aujourd'hui)

- `--raceId=<id>` : Identifiant de la course pour le test de détails

- `--horseId=<id>` : Identifiant du cheval pour le test de stats

## Exemples

```bash
# Tous les tests
npm run test:bettracker

# Courses d'une date spécifique
node scripts/test-bettracker.js --endpoint=races --date=2025-01-20

# Quinté du jour
node scripts/test-bettracker.js --endpoint=quinte

# Détails d'une course spécifique
node scripts/test-bettracker.js --endpoint=race --raceId=12345

# Stats d'un cheval
node scripts/test-bettracker.js --endpoint=horse --horseId=67890
```

## Résultats

Le script affiche :
- ✅ Les tests réussis en vert
- ❌ Les erreurs en rouge
- ⚠️ Les avertissements en jaune
- ℹ️ Les informations en cyan

En cas d'erreur, les détails de la réponse HTTP sont affichés pour faciliter le débogage.

## Dépannage

### Erreur : "BETTRACKER_API_KEY n'est pas définie"

Vérifiez que vous avez bien créé un fichier `.env` à la racine du dossier `server/` avec :
```env
BETTRACKER_API_KEY=votre_cle_api
```

### Erreur : "Request failed with status code 401"

Votre clé API est invalide ou expirée. Vérifiez :
1. Que la clé est correctement copiée dans le `.env`
2. Que la clé n'a pas expiré dans votre compte BetTracker Pro
3. Que vous avez bien les permissions nécessaires

### Erreur : "Request failed with status code 404"

L'endpoint utilisé n'existe pas. Vérifiez :
1. La documentation officielle de BetTracker Pro : https://bettracker.io/docs/api
2. Que les endpoints dans `server/services/bettracker.js` correspondent à la documentation

### Erreur : "connect ECONNREFUSED"

L'URL de base de l'API est incorrecte. Vérifiez :
1. L'URL dans `server/services/bettracker.js` (variable `BETTRACKER_API_BASE_URL`)
2. La documentation officielle pour l'URL correcte

