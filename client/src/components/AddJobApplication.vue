
<script setup>
import { ref } from "vue";
import { uid } from "quasar";
import { JOB_STATUSES, DEFAULT_STATUS } from "../constants/jobStatuses.js";

/**
 * TODO : 
 * - Mettre en place le upload des fichiers
 */
const emit = defineEmits(['submit']);

const open = ref(false);
const form = ref({
  company: "",
  job: "",
  status: DEFAULT_STATUS,
  date: "",
  job_link: "",
  contactName: "",
  contactEmail: "",
  attachments: [],
});

const statuses = JOB_STATUSES;
const formIsValid = ref(false);
const resetForm = () => {
  form.value = {
    company: "",
    job: "",
    status: DEFAULT_STATUS,
    date: "",
    job_link: "",
  };
  formIsValid.value = false;
};
// function onFilesAdded(files) {
//   form.value.attachments.push(
//     ...files.map((f) => ({ id: uid(), name: f.name, file: f }))
//   );
// }

// function uploaderFactory(file) {
//   // si tu veux upload direct vers backend, retourne un Promise et fais fetch/axios
//   return {
//     abort: () => {},
//     send: () => Promise.resolve(),
//   };
// }

async function submit() {

  if (!form.value.company || !form.value.job) {
    $q.notify({
      message: 'Veuillez remplir les champs obligatoires',
      color: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    });
    return;
  }

  emit('submit', form.value);

  open.value = false; //Fermer le dialog

  resetForm();
}

function cancel() {
  open.value = false;
  resetForm();
}
</script>

<template>
  <div>
    <q-btn 
      color="primary" 
      icon="add" 
      label="+ AJOUTER" 
      @click="open = true" 
    />

    <q-dialog v-model="open" persistent>
      <q-card style="min-width: 350px; max-width: 720px">
        <q-card-section class="q-pa-md">
          <div class="text-h5 text-weight-bold q-mb-xs">Nouvelle candidature</div>
          <div class="text-body2 text-grey-7">
            Remplis les infos et clique sur Enregistrer
          </div>
        </q-card-section>

        <q-card-section>
          <q-form 
            v-model="formIsValid"
            @submit.prevent="submit"
          >
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.company"
                  label="Entreprise *"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.job"
                  label="Poste *"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.status"
                  :options="statuses"
                  label="Statut"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.date"
                  label="Date postulée (YYYY-MM-DD)"
                  type="date"
                />
              </div>

              <div class="col-12">
                <q-input v-model="form.job_link" label="Lien de l'offre" />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.contactName" label="Nom du contact" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.contactEmail" label="Email du contact" />
              </div>

              <!-- <div class="col-12">
                <q-uploader
                  accept="application/pdf,image/*"
                  label="Pièces jointes (cv, LM, portfolio)"
                  @added="onFilesAdded"
                  :factory="uploaderFactory"
                />
              </div> -->
            </div>

            <q-card-actions 
              class="q-mt-md"
              align="right"
            >
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
