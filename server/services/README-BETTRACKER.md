# Intégration API BetTracker Pro

Ce service permet d'intégrer l'API BetTracker Pro dans l'application.

## Configuration

### 1. Créer un compte BetTracker Pro

Inscrivez-vous sur [https://bettracker.io/register](https://bettracker.io/register)

⚠️ **Important** : L'accès à l'API REST nécessite généralement un **compte BetTracker Pro** avec un abonnement actif. Certaines fonctionnalités de l'API peuvent être limitées ou nécessiter un abonnement payant.

### 2. Vérifier votre abonnement

1. Connectez-vous à votre compte BetTracker Pro
2. Vérifiez que votre abonnement inclut l'accès à l'API REST
3. Si nécessaire, souscrivez à un abonnement Pro

### 3. Générer une clé API

1. Connectez-vous à votre compte BetTracker Pro
2. Accédez aux paramètres de votre compte
3. Allez dans la section "Clé API"
4. Générez une clé API (format : `btk_...`)

### 4. Configurer la variable d'environnement

Ajoutez votre clé API dans le fichier `.env` du serveur :

```env
BETTRACKER_API_KEY=btk_votre_cle_api_ici
```

⚠️ **Note** : La clé API commence généralement par `btk_` selon la documentation.

### 5. Consulter la documentation

La documentation complète de l'API REST est disponible sur :
[https://bettracker.io/docs/api](https://bettracker.io/docs/api)

## Utilisation

### Endpoints disponibles

#### GET `/api/analysis/bettracker/races`
Récupère la liste des courses disponibles pour une date donnée.

**Paramètres de requête :**
- `date` (optionnel) : Date au format YYYY-MM-DD (défaut: aujourd'hui)

**Exemple :**
```bash
GET /api/analysis/bettracker/races?date=2025-01-15
```

#### GET `/api/analysis/bettracker/quinte-du-jour`
Récupère automatiquement le quinté+ du jour.

**Exemple :**
```bash
GET /api/analysis/bettracker/quinte-du-jour
```

#### POST `/api/analysis/bettracker/race/analysis`
Analyse une course PMU spécifique.

**Body (JSON) :**
```json
{
  "hippodrome_code": "M3",
  "race_number": 5,
  "date": "2025-01-15"
}
```

**Exemple :**
```bash
POST /api/analysis/bettracker/race/analysis
Content-Type: application/json

{
  "hippodrome_code": "M3",
  "race_number": 5,
  "date": "2025-01-15"
}
```

#### GET `/api/analysis/bettracker/pronostics`
Récupère les pronostics IA.

**Paramètres de requête :**
- `status` (optionnel) : Statut des pronostics (ex: 'validated')

**Exemple :**
```bash
GET /api/analysis/bettracker/pronostics?status=validated
```

#### GET `/api/analysis/bettracker/stats`
Récupère les statistiques utilisateur.

**Paramètres de requête :**
- `period` (optionnel) : Période ('month', 'week', 'year', etc.)

**Exemple :**
```bash
GET /api/analysis/bettracker/stats?period=month
```

## Structure du service

Le service `bettracker.js` expose les fonctions suivantes :

- `executeTool(tool, arguments)` : Exécute un outil de l'API (méthode principale)
- `getTodayRaces()` : Récupère les courses du jour
- `searchRaces(options)` : Recherche des courses selon des critères
- `getRaces(date)` : Récupère les courses (du jour ou pour une date)
- `getRaceAnalysis(options)` : Analyse une course PMU spécifique
- `getQuinteDuJour()` : Récupère le quinté+ du jour
- `getAIPronostics(options)` : Récupère les pronostics IA
- `getUserStats(options)` : Récupère les statistiques utilisateur

## Structure de l'API

L'API BetTracker utilise une structure unique avec un endpoint principal `/tools/execute` :

- **Base URL** : `https://bettracker.io/api`
- **Endpoint principal** : `POST /tools/execute`
- **Format des requêtes** : Toutes les requêtes utilisent le même endpoint avec un body contenant `tool` et `arguments`

**Exemple de requête :**
```json
{
  "tool": "get_today_races",
  "arguments": {}
}
```

## Authentification

Toutes les requêtes utilisent le header `X-API-Key` :
```
X-API-Key: btk_votre_cle_api
```

## Outils disponibles

Selon la [documentation officielle](https://bettracker.io/docs/api), les outils suivants sont disponibles :

### Courses & Pronostics
- `get_today_races` : Courses du jour
- `get_ai_pronostics` : Pronostics IA
- `search_races` : Rechercher des courses
- `get_pmu_race_analysis` : Analyser une course PMU

### Statistiques & Paris
- `get_user_stats` : Statistiques utilisateur
- `get_recent_bets` : Paris récents
- `get_bankroll_history` : Évolution de la bankroll
- `get_budget_status` : État du budget

### Compte & Notifications
- `get_subscription_info` : Informations abonnement
- `get_notifications` : Notifications
- `ask_ai_chat` : Chatbot IA

