
<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import { JOB_STATUSES, DEFAULT_STATUS, LANGUAGES } from "../constants/jobStatuses.js";

/**
 * TODO : 
 * - Mettre en place le upload des fichiers
 */
const emit = defineEmits(['submit']);
const $q = useQuasar();

const open = ref(false);
const props = defineProps({
  job: {
    type: Object,
    required: false,
    default: null,
  },
});

const form = ref({
  company: props.job?.company || "",
  job: props.job?.job || "",
  status: props.job?.status || DEFAULT_STATUS,
  date: props.job?.date || "",
  job_link: props.job?.job_link || "",
  contactName: props.job?.contactName || "",
  contactEmail: props.job?.contactEmail || "",
  contactPhone: props.job?.contactPhone || "",
  platform: props.job?.platform || "",
  language: props.job?.language || [],
});

const statuses = JOB_STATUSES;
const formIsValid = ref(false);

const initializeForm = () => {
  form.value = {
    company: props.job?.company || "",
    job: props.job?.job || "",
    status: props.job?.status || DEFAULT_STATUS,
    date: props.job?.date || "",
    job_link: props.job?.job_link || "",
    contactName: props.job?.contactName || "",
    contactEmail: props.job?.contactEmail || "",
    contactPhone: props.job?.contactPhone || "",
    platform: props.job?.platform || "",
    language: props.job?.language || [],
  };
  formIsValid.value = false;
};

const resetForm = () => {
  initializeForm();
};

// Mettre à jour le formulaire quand la modal s'ouvre ou quand props.job change
watch([open, () => props.job], () => {
  if (open.value) {
    initializeForm();
  }
}, { deep: true });

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
  if (!form.value.company || !form.value.job || !form.value.language || form.value.language.length === 0) {
    $q.notify({
      message: 'Veuillez remplir tous les champs obligatoires : Entreprise, Poste, Langages de programmation',
      color: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 5000
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
      :label="props.job ? 'Modifier' : 'Ajouter'"  
      @click="open = true" 
    />

    <q-dialog v-model="open" persistent>
      <q-card style="min-width: 350px; max-width: 720px">
        <q-card-section class="q-pa-md">
          <div class="text-h5 text-weight-bold q-mb-xs">
            {{ props.job ? 'Modifier la candidature' : 'Nouvelle candidature' }}
          </div>
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
                  v-model="form.language"
                  label="Langages de programmation *"
                  :options="LANGUAGES"
                  multiple
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

              <div class="col-12 col-md-6">
                <q-input 
                  v-model="form.platform"
                  label="Platforme" 
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
              <div class="col-12 col-md-6">
                <q-input 
                  v-model="form.contactPhone"
                  label="Numéro de téléphone du contact" 
                  type="tel"
                />
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
