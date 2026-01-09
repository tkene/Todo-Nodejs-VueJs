# 🏗️ Architecture Frontend - Vue.js

## Vue d'ensemble

Cette application Vue.js utilise une architecture modulaire et scalable basée sur la Composition API, avec une séparation claire des responsabilités.

## 📂 Structure des Dossiers

### `/api` - Services API
- Communication avec le backend
- Instance axios configurée
- Interceptors pour gestion centralisée

### `/components` - Composants Vue
- `/layout` : Composants de structure (Sidebar, etc.)
- Composants UI réutilisables

### `/composables` - Hooks Vue
- Logique réactive réutilisable
- Gestion d'état locale
- `useJobs`, `useTodos`, `useTags`, `useAuth`, `useNotifications`

### `/config` - Configuration
- Configuration centralisée de l'application
- Constantes réutilisables

### `/services` - Services Métier
- Logique métier réutilisable
- Services de notification, etc.

### `/types` - Types JSDoc
- Définitions de types pour autocomplétion
- Documentation des structures de données

### `/utils` - Utilitaires
- Fonctions utilitaires pures
- Organisées par domaine (date, validation, string)

### `/views` - Pages
- Pages/Vues de l'application
- Organisées par domaine fonctionnel

## 🎯 Principes

1. **Séparation des responsabilités** : Chaque module a une responsabilité claire
2. **Réutilisabilité** : Code réutilisable via composables et services
3. **Maintenabilité** : Code organisé et documenté
4. **Scalabilité** : Architecture facilement extensible

## 📖 Documentation

- `ARCHITECTURE.md` : Documentation détaillée
- `MIGRATION_GUIDE.md` : Guide de migration
- `IMPROVEMENTS.md` : Liste des améliorations
- `ARCHITECTURE_SUMMARY.md` : Résumé de l'architecture

