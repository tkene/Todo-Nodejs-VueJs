<script setup>
import { ref } from "vue";

const props = defineProps({
  // Liste des items à afficher dans la timeline
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  // Clé pour récupérer le texte/contenu de l'item
  itemTextKey: {
    type: String,
    default: 'comment'
  },
  // Clé pour récupérer la date de l'item
  itemDateKey: {
    type: String,
    default: 'createdAt'
  },
  // Clé pour récupérer l'identifiant unique de l'item
  itemIdKey: {
    type: String,
    default: 'id'
  },
  // Fonction pour formater la date (reçoit la date en paramètre)
  formatDateFunction: {
    type: Function,
    required: true
  },
  // Couleur du timeline
  timelineColor: {
    type: String,
    default: 'accent'
  },
  // Icône du timeline
  timelineIcon: {
    type: String,
    default: 'comment'
  },
  // Côté du timeline ('left' ou 'right')
  timelineSide: {
    type: String,
    default: 'right'
  },
  // Afficher les boutons d'édition et suppression
  showActions: {
    type: Boolean,
    default: true
  },
  // Couleur de la bordure gauche du contenu
  contentBorderColor: {
    type: String,
    default: 'var(--accent)'
  }
});

const emit = defineEmits(['edit', 'delete']);

function demarrerEdition(item) {
  emit('edit', item);
}

function supprimerItem(item) {
  emit('delete', item);
}

function obtenirDate(item) {
  const date = item[props.itemDateKey];
  if (!date) {
    // Si pas de date, utiliser l'id comme fallback
    return props.formatDateFunction(item[props.itemIdKey]);
  }
  return props.formatDateFunction(date);
}
</script>

<template>
  <q-timeline :color="timelineColor">
    <q-timeline-entry
      v-for="item in items"
      :key="item[itemIdKey]"
      :subtitle="obtenirDate(item)"
      :icon="timelineIcon"
      :side="timelineSide"
    >
      <div 
        class="item-content q-pa-md relative-position" 
        :style="{
          backgroundColor: 'rgba(0, 0, 0, 0.02)', 
          borderRadius: '8px', 
          borderLeft: `3px solid ${contentBorderColor}`
        }"
      >
        <!-- Mode affichage -->
        <div>
          <div 
            class="text-body1 q-ma-none q-pr-xl comment-content" 
            v-html="item[itemTextKey]"
          ></div>
        </div>
        
        <!-- Date en bas à droite -->
        <div class="absolute-bottom-right q-pa-sm">
          <div class="row items-center q-gutter-xs">
            <q-icon name="schedule" size="12px" color="grey-6" />
            <span class="text-caption text-grey-6">
              {{ obtenirDate(item) }}
            </span>
          </div>
        </div>
        
        <!-- Boutons d'action en haut à droite -->
        <div v-if="showActions" class="absolute-top-right q-pa-sm">
          <div class="row q-gutter-xs">
            <q-btn 
              icon="edit"
              color="warning"
              size="sm"
              flat
              round
              dense
              @click="demarrerEdition(item)"
            />
            <q-btn 
              icon="delete"
              color="negative"
              size="sm"
              flat
              round
              dense
              @click="supprimerItem(item)"
            />
          </div>
        </div>
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>

