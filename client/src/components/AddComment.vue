
<script setup>
import { ref } from "vue";

const emit = defineEmits(['submit']);

const open = ref(false);
const form = ref({
  comment: "",
});

async function submit() {
  // validation simple
  if (!form.value.comment) {
    return;
  }

  // Émettre l'événement avec les données du formulaire
  emit('submit', form.value);

  // Fermer le dialog
  open.value = false;

  // Reset du formulaire
  form.value = {
    comment: "",
  };
}

function cancel() {
  open.value = false;
  // Reset du formulaire
  form.value = {
    comment: "",
  };
}
</script>

<template>
  <div>
    <q-btn 
      color="primary" 
      icon="add" 
      label="Ajouter un commentaire" 
      @click="open = true" 
    />

    <q-dialog v-model="open" persistent>
      <q-card style="min-width: 70%; min-height: 70%">
        <q-card-section class="row items-center q-pa-sm">
          <div class="text-h6">Ajouter un commentaire</div>
        </q-card-section>

        <q-separator />

        <q-card-section :style="{ backgroundColor: '#f0f0f0' }">
          <q-form @submit.prevent="submit">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <textarea
                  placeholder="Commentaire / résumé"
                  class="w-full h-full textarea-centered"
                  v-model="form.comment"
                />
              </div>
            </div>

            <q-card-actions class="q-mt-md flex justify-end">
              <q-btn
                flat
                label="Annuler"
                color="secondary"
                @click="cancel"
              />
              <q-btn 
                color="primary" 
                label="Enregistrer" 
                type="submit" 
                class="q-ml-md"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.textarea-centered {
  min-height: 600px;
  border-radius: 10px;
  padding: 10px;
  border-color: black;
}
</style>
