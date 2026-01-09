# Guide de Migration SQLite vers MySQL

Ce guide explique comment migrer toutes les données de SQLite vers MySQL.

## Prérequis

1. **MySQL installé et en cours d'exécution**
2. **Base de données créée** : `job-tracker-2026` (ou celle configurée dans `.env`)
3. **Variables d'environnement configurées** dans `server/.env` :
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=job-tracker-2026
   DB_USER=root
   DB_PASSWORD=votre-mot-de-passe
   ```

## Étapes de migration

### 1. Vérifier la configuration MySQL

```bash
cd server
npm run check:db
```

Ce script vérifie :
- Que MySQL est bien configuré
- Que la connexion fonctionne
- Quelles tables existent dans MySQL

### 2. Exécuter les migrations Sequelize (si pas déjà fait)

Les tables doivent exister dans MySQL avant la migration des données :

```bash
cd server
npm run db:migrate
```

Cela créera toutes les tables nécessaires dans MySQL.

### 3. Exécuter la migration des données

```bash
cd server
npm run migrate:sqlite-to-mysql
```

Le script va :
- ✅ Lire toutes les données de `database.sqlite`
- ✅ Les insérer dans MySQL
- ✅ Gérer automatiquement les doublons (ignorés)
- ✅ Respecter l'ordre des tables (users → tags → todos → jobs → comments → TodoTags → quiz_*)

### 4. Vérifier que tout fonctionne

```bash
cd server
npm run check:db
```

Vous devriez voir toutes les tables avec leurs données.

## Ordre de migration

Le script migre les tables dans cet ordre (pour respecter les clés étrangères) :

1. **users** (doit être en premier)
2. **tags** (référence users)
3. **todos** (référence users)
4. **jobs** (référence users)
5. **comments** (référence jobs)
6. **TodoTags** (table de liaison)
7. **quiz_questions** (si existe)
8. **quiz_scores** (si existe)

## Gestion des doublons

- Si une table MySQL contient déjà des données, le script utilise `ON DUPLICATE KEY UPDATE` pour ignorer les doublons
- Les enregistrements avec des IDs identiques ne seront pas dupliqués

## Notes importantes

⚠️ **Sauvegarde recommandée** : Faites une sauvegarde de votre base MySQL avant la migration si elle contient déjà des données importantes.

⚠️ **Fichier SQLite** : Le fichier `database.sqlite` n'est pas modifié, il reste intact comme sauvegarde.

⚠️ **Sessions** : Les sessions utilisateur (stockées dans `sessions.db`) ne sont pas migrées car elles sont temporaires.

## Après la migration

Une fois la migration terminée :

1. Vérifiez que toutes les données sont présentes dans MySQL
2. Testez l'application pour vous assurer que tout fonctionne
3. Le backend utilisera automatiquement MySQL si `DB_HOST` est configuré dans `.env`

## Dépannage

### Erreur : "DB_HOST n'est pas défini"
→ Configurez les variables d'environnement dans `server/.env`

### Erreur : "Table n'existe pas dans MySQL"
→ Exécutez d'abord `npm run db:migrate` pour créer les tables

### Erreur de connexion MySQL
→ Vérifiez que MySQL est démarré et que les identifiants sont corrects

### Données manquantes
→ Vérifiez les logs du script pour voir quelles tables ont été migrées avec succès

