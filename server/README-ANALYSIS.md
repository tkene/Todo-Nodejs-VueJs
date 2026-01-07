# Configuration et Utilisation de l'Analyse PMU

Cette section décrit comment utiliser la fonctionnalité d'analyse prédictive des courses PMU, qui utilise un algorithme mathématique pour analyser les courses.

## 1. Utilisation de la Fonctionnalité d'Analyse PMU

La page `/analyse-pmu` dans le frontend vous permet de sélectionner une course et de lancer une analyse.

1.  **Accédez à la page d'Analyse PMU** :
    *   Dans votre application frontend, naviguez vers l'onglet "Analyse PMU" ou accédez directement à l'URL `/analyse-pmu`.

2.  **Sélectionnez une Date et une Course** :
    *   Utilisez le sélecteur de date pour choisir le jour des courses.
    *   Sélectionnez une course disponible dans la liste déroulante.

3.  **Lancez l'Analyse** :
    *   Cliquez sur le bouton "Lancer l'Analyse".
    *   Un indicateur de chargement s'affichera pendant que le backend récupère les données et effectue les calculs.

4.  **Visualisez les Résultats** :
    *   Une fois l'analyse terminée, les sections "Podium", "Expert Insight" et "Alerte Smart Money" s'afficheront.
    *   Vous pouvez ensuite cliquer sur "Calculer les Probabilités" pour obtenir une évaluation probabiliste détaillée.

## 2. Évaluation Probabiliste

Après avoir lancé une analyse, vous pouvez calculer les probabilités détaillées pour chaque cheval :

- **Probabilité de victoire** : Calculée via fonction softmax
- **Probabilité Top 3** : Redistribution logique basée sur le ranking
- **Probabilité de finir** : Base 97%, réduite si cheval souvent fautif

Ces probabilités sont calculées par un algorithme mathématique sans IA externe, basé sur :
- Forme récente (musique)
- Affinité terrain/distance
- Taux de victoire du jockey et de l'entraîneur
- Cotes PMU
