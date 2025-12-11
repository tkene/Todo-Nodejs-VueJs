<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { STATUS_COLORS, JOB_STATUSES } from "../../constants/jobStatuses.js";
import { 
  getJob as getJobApi,
  updateJob as updateJobApi 
} from "../../api/Job";
import { formatDate, isPendingReview } from "../../utils/function";
import CopyButton from "../../components/CopyButton.vue";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const job = ref(null);
const loading = ref(true);
const statusColors = STATUS_COLORS;
const pendingReview = ref(null);

onMounted(async () => {
  try {
    const jobId = Number(route.params.id);

    if (!jobId) {
      throw new Error("ID de candidature invalide");
    }

    const jobData = await getJobApi(jobId);

    if (!jobData) {
      throw new Error("Candidature non trouvée");
    }

    job.value = jobData;
    pendingReview.value = (isPendingReview(job.value.date));
  } catch (error) {
    $q.notify({
      message:
        error?.response?.data?.error ||
        error?.message ||
        "Candidature non trouvée",
      color: "negative",
      icon: "error",
      position: "top-right",
      timeout: 3000,
    });
    router.push("/job-alerts");
  } finally {
    loading.value = false;
  }
});

function updateStatus(status) {
  job.value.status = status;
  updateJobApi(job.value.id, job.value);
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="q-pa-md">
    <!-- Bouton retour -->
    <div class="q-mb-md">
      <q-btn
        icon="arrow_back"
        label="Retour"
        color="secondary"
        @click="goBack"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Job details -->
    <div v-else-if="job">
      <!-- Header -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <h1 class="text-h4 q-ma-none">{{ job.company }}</h1>
              <p class="text-h6 text-grey-7 q-mt-sm q-mb-none">{{ job.job }}</p>
            </div>
            <q-badge
              :color="statusColors[job.status] || 'gray'"
              :label="job.status"
              class="text-h6 q-pa-md"
            />
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md items-stretch">
        <!-- Informations principales -->
        <div class="col-12 col-md-6 flex">
          <q-card class="full-height col flex column">
            <q-card-section
              class="text-h6"
              style="background-color: var(--info); color: white"
            >
              Informations principales
            </q-card-section>
            <q-card-section class="flex column col">
              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Statut</div>
                <div class="text-body1">
                  <q-select 
                    class="w-1/3"
                    v-model="job.status" 
                    :options="JOB_STATUSES"
                    @update:model-value="updateStatus"
                  />
                </div>
              </div>
              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Date de candidature</div>
                <div class="text-body1">
                  {{ formatDate(job.date) }}
                  <span v-if="pendingReview">  
                    - <q-badge 
                        class="q-ml-sm text-body1"
                        :color="pendingReview?.color"
                        :label="pendingReview?.label"
                      />
                  </span>
                </div>
              </div>
              <div v-if="job.job_link">
                <div class="text-caption text-grey-7">Lien de l'offre</div>
                <a
                  :href="job.job_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary text-body1"
                  style="text-decoration: none"
                >
                  {{ job.job_link }}
                  <q-icon name="open_in_new" size="sm" class="q-ml-xs" />
                </a>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contact -->
        <div class="col-12 col-md-6 flex">
          <q-card class="full-height col flex column">
            <q-card-section
              class="text-h6"
              style="background-color: var(--secondary); color: white"
            >
              Contact
            </q-card-section>
            <q-card-section class="flex column col">
              <div 
                class="q-mb-md"
                v-if="job.contactName"
              >
                <div class="text-caption text-grey-7">Nom du contact</div>
                <div class="text-body1">{{ job.contactName }}</div>
              </div>
              <div
                class="q-mb-md"
                v-if="job.contactEmail"
              >
                <div class="text-caption text-grey-7">Email</div>
                <div class="flex items-center q-gutter-sm">
                  <span class="text-body1">{{ job.contactEmail }}</span>
                  <CopyButton
                    :text="job.contactEmail"
                    tooltip="Copier l'email"
                    success-message="Email copié dans le presse-papiers !"
                  />
                </div>
              </div>
              <div class="q-mb-md">
                <q-btn 
                  icon="comment"
                  label="Ajouter un commentaire"
                  color="secondary"
                  @click="addComment"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Commentaire -->
        <div class="col-12" v-if="job.comment">
          <q-card>
            <q-card-section
              class="text-h6"
              style="background-color: var(--accent); color: white"
            >
              Commentaire / Résumé
            </q-card-section>
            <q-card-section>
              <p class="text-body1 q-ma-none" style="white-space: pre-wrap">
                {{ job.comment }}
              </p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Pièces jointes -->
        <div
          class="col-12"
          v-if="job.attachments && job.attachments.length > 0"
        >
          <q-card>
            <q-card-section
              class="text-h6"
              style="background-color: var(--primary); color: white"
            >
              Pièces jointes
            </q-card-section>
            <q-card-section>
              <q-list>
                <q-item
                  v-for="attachment in job.attachments"
                  :key="attachment.id"
                  class="q-pa-sm"
                >
                  <q-item-section avatar>
                    <q-icon name="attach_file" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ attachment.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn icon="download" flat round dense color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="4em" color="negative" />
      <p class="text-h6 q-mt-md">Candidature non trouvée</p>
      <q-btn
        label="Retour à la liste"
        color="primary"
        @click="router.push('/job-alerts')"
      />
    </div>
  </div>
</template>
