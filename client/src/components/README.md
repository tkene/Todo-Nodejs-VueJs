# Composants

## Organisation

### Layout Components (`layout/`)
Composants de structure et de mise en page :
- `Sidebar.vue` - Barre latérale de navigation

### UI Components
Composants d'interface utilisateur réutilisables :
- `AddComment.vue` - Formulaire d'ajout de commentaire
- `AddJobApplication.vue` - Formulaire d'ajout/modification de candidature
- `AddTodo.vue` - Formulaire d'ajout de tâche
- `ConfirmDialog.vue` - Dialog de confirmation
- `CopyButton.vue` - Bouton de copie
- `EditableTimeline.vue` - Timeline éditable
- `FiltersTodo.vue` - Filtres pour les tâches
- `ListCard.vue` - Carte de liste
- `StatCard.vue` - Carte de statistique
- `Tags.vue` - Gestion des tags

## Conventions

- Utiliser des props typées avec `defineProps`
- Utiliser des emits nommés avec `defineEmits`
- Préférer la composition API (`<script setup>`)
- Utiliser Tailwind CSS pour le styling
- Documenter les props et emits avec des commentaires

