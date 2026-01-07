# Dépannage API BetTracker

## ⚠️ Compte Pro requis

**L'API REST BetTracker nécessite généralement un compte Pro avec un abonnement actif.**

Si vous obtenez une erreur 404, vérifiez :
1. Que vous avez un compte BetTracker Pro (pas seulement un compte gratuit)
2. Que votre abonnement est actif
3. Que l'accès à l'API REST est inclus dans votre plan

Pour vérifier :
- Connectez-vous à [BetTracker Pro](https://bettracker.io)
- Allez dans Paramètres > Abonnement
- Vérifiez que vous avez accès à l'API REST

## Erreur : `Cannot POST /api/tools/execute` (404)

### Problème
L'endpoint `/api/tools/execute` retourne une erreur 404, ce qui signifie que l'URL n'est pas correcte.

### Solutions

#### 1. Vérifier que vous avez un compte Pro actif

**C'est la cause la plus probable d'une erreur 404.**

- L'API REST nécessite généralement un compte BetTracker Pro avec abonnement
- Vérifiez votre abonnement dans les paramètres de votre compte
- Si vous n'avez pas d'abonnement Pro, souscrivez-en un

#### 2. Vérifier l'URL de base dans la documentation
Consultez la documentation officielle de BetTracker Pro :
- **Documentation API** : https://bettracker.io/docs/api
- La documentation indique que la Base URL est `https://bettracker.io/api`
- L'endpoint complet devrait être `https://bettracker.io/api/tools/execute`

#### 3. Tester différentes variantes d'URL
L'API pourrait utiliser une structure différente. Testez ces variantes dans votre `.env` :

```env
# Option 1 (par défaut selon la doc)
BETTRACKER_API_BASE_URL=https://bettracker.io/api

# Option 2 (si l'endpoint est directement à la racine)
BETTRACKER_API_BASE_URL=https://bettracker.io

# Option 3 (si l'API utilise un sous-domaine)
BETTRACKER_API_BASE_URL=https://api.bettracker.io
```

#### 4. Vérifier que votre compte a accès à l'API
- Connectez-vous à votre compte BetTracker Pro
- Vérifiez dans les paramètres que l'API est activée
- Vérifiez que votre abonnement inclut l'accès à l'API

#### 5. Tester avec curl
Testez manuellement l'endpoint :

```bash
curl -X POST https://bettracker.io/api/tools/execute \
  -H "X-API-Key: VOTRE_CLE_API" \
  -H "Content-Type: application/json" \
  -d '{"tool":"get_today_races","arguments":{}}'
```

Si cela ne fonctionne pas, essayez :
```bash
curl -X POST https://bettracker.io/tools/execute \
  -H "X-API-Key: VOTRE_CLE_API" \
  -H "Content-Type: application/json" \
  -d '{"tool":"get_today_races","arguments":{}}'
```

#### 5. Vérifier les logs détaillés
Le service affiche maintenant l'URL complète utilisée dans les logs. Vérifiez :
```
[BETTRACKER] Appel API: https://bettracker.io/api/tools/execute
```

### Erreur : `getaddrinfo ENOTFOUND api.bettracker.io`

### Problème
L'URL de base de l'API n'est pas correcte ou le domaine n'existe pas.

### Solutions

#### 1. Vérifier l'URL dans la documentation
Consultez la documentation officielle de BetTracker Pro :
- **Documentation API** : https://bettracker.io/docs/api
- Vérifiez l'URL de base exacte de l'API

#### 2. Configurer l'URL dans le fichier `.env`
Une fois l'URL correcte trouvée, ajoutez-la dans votre fichier `.env` :

```env
BETTRACKER_API_BASE_URL=https://vraie-url-de-l-api.com
BETTRACKER_API_KEY=votre_cle_api
```

### Contact support
Si le problème persiste après avoir vérifié la documentation :
1. Contactez le support BetTracker Pro
2. Vérifiez que votre compte a bien accès à l'API
3. Vérifiez que votre clé API est active et valide
4. Demandez l'URL exacte de l'endpoint API si elle diffère de la documentation

