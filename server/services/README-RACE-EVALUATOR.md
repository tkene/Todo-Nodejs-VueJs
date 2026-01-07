# Module d'Évaluation des Courses PMU

## 📋 Description

Module Node.js qui calcule les probabilités de victoire, Top 3 et fin de course pour chaque cheval dans une course PMU, sans utiliser d'IA externe.

## 🎯 Fonctionnalités

- **Probabilité de victoire** : Calculée via fonction softmax sur les scores pondérés
- **Probabilité Top 3** : Redistribution logique basée sur le ranking
- **Probabilité de finir** : Base 97%, réduite si cheval souvent fautif
- **Explications** : Génération automatique d'explications courtes pour chaque cheval

## 📊 Données utilisées

### Par cheval :
- `age` : Âge du cheval
- `recentForm` : Forme récente (0-1, moyenne des dernières places)
- `terrainAffinity` : Affinité au terrain (0-1)
- `distanceAffinity` : Affinité à la distance (0-1)
- `jockeyWinRate` : Taux de victoire du jockey (0-1)
- `trainerWinRate` : Taux de victoire de l'entraîneur (0-1)
- `cote` : Cote PMU (pour calculer probabilité implicite)
- `isOftenFaulty` : Boolean indiquant si le cheval est souvent fautif
- `faultFrequency` : Fréquence de fautes (0-1, optionnel)

### Par course :
- `nbPartants` : Nombre de partants
- `terrain` : Type de terrain (PSF, Herbe, etc.)
- `distance` : Distance de la course
- `discipline` : Discipline (plat, trot, attelé)

## 🧮 Algorithme

### 1. Normalisation
Toutes les valeurs sont normalisées entre 0 et 1 si nécessaire.

### 2. Calcul du score
```
score = w1*recentForm + 
        w2*terrainAffinity + 
        w3*distanceAffinity + 
        w4*jockeyWinRate + 
        w5*trainerWinRate + 
        w6*pmuProbability
```

### 3. Softmax
Les scores sont transformés en probabilités via la fonction softmax :
- Garantit que la somme des probabilités = 1
- Stable numériquement (évite les overflow)

### 4. Probabilité Top 3
Redistribution basée sur :
- Probabilité de victoire
- Rang du cheval
- Nombre de partants

### 5. Probabilité de finir
- Base : 97%
- Réduction si `isOftenFaulty` : entre 75% et 90% selon sévérité

## ⚙️ Configuration

Les poids (weights) sont configurables dans `config/evaluationWeights.json` :

```json
{
  "w1": 0.25,  // recentForm
  "w2": 0.20,  // terrainAffinity
  "w3": 0.15,  // distanceAffinity
  "w4": 0.15,  // jockeyWinRate
  "w5": 0.10,  // trainerWinRate
  "w6": 0.15   // pmuProbability
}
```

**Important** : La somme des poids doit être égale à 1.0

## 📝 Utilisation

### Backend

```javascript
const raceEvaluator = require('./services/raceEvaluator');

const race = {
  nbPartants: 16,
  terrain: 'PSF',
  distance: 1900,
  discipline: 'plat'
};

const horses = [
  {
    id: 1,
    name: 'Cheval A',
    recentForm: 0.8,
    terrainAffinity: 0.9,
    distanceAffinity: 0.7,
    jockeyWinRate: 0.2,
    trainerWinRate: 0.18,
    cote: 3.5,
    isOftenFaulty: false
  },
  // ... autres chevaux
];

const results = raceEvaluator.evaluateRace(race, horses);
```

### API Endpoint

```bash
POST /api/analysis/evaluate
Body: { "courseId": "R1C8" }
```

### Frontend

```javascript
import { evaluateRace } from '../api/Analysis';

const result = await evaluateRace('R1C8');
// result.evaluations contient les probabilités pour chaque cheval
```

## 📤 Format de retour

```javascript
[
  {
    id: 1,
    name: "Cheval A",
    numero: 1,
    probWin: 0.1523,      // 15.23%
    probTop3: 0.4234,     // 42.34%
    probFinish: 0.97,     // 97%
    explanation: "Favori de la course • Forme récente excellente • Très à l'aise sur PSF",
    rank: 1,
    score: 2.45
  },
  // ... autres chevaux
]
```

## ✅ Garanties

- **Somme probWin = 1** : Vérifiée et renormalisée si nécessaire
- **Stabilité numérique** : Utilisation de softmax avec soustraction du max
- **Reproductibilité** : Résultats identiques pour les mêmes entrées
- **Performance** : Calcul rapide, pas de dépendances lourdes

## 🔧 Transformation des données existantes

Le module inclut `transformHorseData()` pour convertir les données de la DB au format attendu :

- `recentForm` : Calculé depuis la musique
- `terrainAffinity` : Basé sur `aptitudPSF` et `race.surface`
- `distanceAffinity` : Valeur par défaut (peut être enrichie)
- `jockeyWinRate` / `trainerWinRate` : Valeurs par défaut (peuvent être enrichies)
- `isOftenFaulty` : Basé sur le sentiment du forum

## 🎨 Frontend

Le composant `RaceResult.vue` affiche :
- Tableau avec toutes les probabilités
- Barres de progression visuelles
- Badges de rang (or, argent, bronze)
- Statistiques globales
- Explications pour chaque cheval

## 📈 Améliorations possibles

- Enrichir `distanceAffinity` avec historique réel
- Ajouter `jockeyWinRate` et `trainerWinRate` depuis la DB
- Ajuster les poids selon la discipline (plat vs trot)
- Prendre en compte l'âge du cheval dans le calcul
- Ajouter des facteurs météo si disponibles

