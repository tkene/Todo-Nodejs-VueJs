<script setup>
import { ref } from "vue";
import { uid } from "quasar";

const emit = defineEmits(['submit']);

const open = ref(false);
const formRef = ref(null);
const form = ref({
  company: "",
  job: "",
  status: "Envoyée",
  date: "",
  job_link: "",
  contactName: "",
  contactEmail: "",
  comment: "",
  attachments: [],
});

const statuses = [
  "À envoyer",
  "Envoyée",
  "Relance faite",
  "Entretien",
  "Offre",
  "Refusée",
];

function onFilesAdded(files) {
  form.value.attachments.push(
    ...files.map((f) => ({ id: uid(), name: f.name, file: f }))
  );
}

function uploaderFactory(file) {
  // si tu veux upload direct vers backend, retourne un Promise et fais fetch/axios
  return {
    abort: () => {},
    send: () => Promise.resolve(),
  };
}

async function submit() {
  // validation simple
  if (!form.value.company || !form.value.job) {
    return;
  }

  // Émettre l'événement avec les données du formulaire
  emit('submit', form.value);

  // Fermer le dialog
  open.value = false;

  // Reset du formulaire
  form.value = {
    company: "",
    job: "",
    status: "Envoyée",
    date: "",
    job_link: "",
    contactName: "",
    contactEmail: "",
    comment: "",
    attachments: [],
  };
}

function cancel() {
  open.value = false;
  // Reset du formulaire
  form.value = {
    company: "",
    job: "",
    status: "Envoyée",
    date: "",
    job_link: "",
    contactName: "",
    contactEmail: "",
    comment: "",
    attachments: [],
  };
}
</script>

<template>
  <div>
    <q-btn 
      color="primary" 
      icon="add" 
      label="Ajouter" 
      @click="open = true" 
    />

    <q-dialog v-model="open" persistent>
      <q-card style="min-width: 350px; max-width: 720px">
        <q-card-section class="row items-center q-pa-sm">
          <div class="text-h6">Nouvelle candidature</div>
          <div class="q-mt-sm q-ml-md text-caption">
            Remplis les infos et clique sur Enregistrer
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" @submit.prevent="submit">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.company"
                  label="Entreprise"
                  :rules="[(v) => !!v || 'Requis']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.job"
                  label="Poste"
                  :rules="[(v) => !!v || 'Requis']"
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
                  label="Date (YYYY-MM-DD)"
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

              <div class="col-12">
                <q-input
                  v-model="form.comment"
                  label="Commentaire / résumé"
                  type="textarea"
                  autogrow
                />
              </div>

              <div class="col-12">
                <q-uploader
                  accept="application/pdf,image/*"
                  label="Pièces jointes (cv, LM, portfolio)"
                  @added="onFilesAdded"
                  :factory="uploaderFactory"
                />
              </div>
            </div>

            <q-card-actions align="right">
              <q-btn
                flat
                label="Annuler"
                color="secondary"
                @click="cancel"
              />
              <q-btn color="primary" label="Enregistrer" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

