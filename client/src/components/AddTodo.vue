<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";

const emit = defineEmits(['submit']);

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  }
});

const $q = useQuasar();

const open = ref(false);
const text = ref('');
const selectedTagIds = ref([]);

function resetForm() {
  text.value = '';
  selectedTagIds.value = [];
}

function cancel() {
  open.value = false;
  resetForm();
}

async function submit() {
  if (!text.value || !text.value.trim()) {
    $q.notify({
      message: 'Veuillez remplir le texte de la tâche',
      color: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    });
    return;
  }

  // Extraire les IDs des tags
  const tagIds = selectedTagIds.value.map(tag => {
    if (typeof tag === 'number') {
      return tag;
    }
    if (typeof tag === 'object' && tag !== null && tag.id) {
      return tag.id;
    }
    return tag;
  });

  emit('submit', {
    text: text.value.trim(),
    tags: tagIds
  });

  open.value = false;
  resetForm();
}
</script>

<template>
  <div>
    <q-btn 
      color="primary"
      icon="add"
      label="Ajouter une tâche"
      @click="open = true" 
    />

    <q-dialog v-model="open" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="q-pa-md">
          <div class="text-h5 text-weight-bold q-mb-xs">Nouvelle tâche</div>
          <div class="text-body2 text-grey-7">
            Remplis les informations et clique sur Enregistrer
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="submit">
            <q-input
              v-model="text"
              label="Texte de la tâche *"
              placeholder="Entrez le texte de la tâche"
              :rules="[(v) => !!v || 'Ce champ est requis']"
              class="q-mb-md"
            />
            
            <q-select
              v-model="selectedTagIds"
              :options="tags"
              option-label="name"
              option-value="id"
              label="Tags"
              multiple
              use-chips
              class="q-mb-md"
            />

            <div class="text-caption text-grey-7 q-mb-md">
              Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs tags
            </div>

            <q-card-actions class="q-mt-md flex justify-end">
              <q-btn
                flat
                color="secondary"
                label="Annuler"
                @click="cancel"
              />
              <q-btn 
                type="submit" 
                color="primary" 
                label="Enregistrer" 
                :disable="!text || !text.trim()"
                class="q-ml-md"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
