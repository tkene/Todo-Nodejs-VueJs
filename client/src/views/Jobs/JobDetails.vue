<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { STATUS_COLORS, JOB_STATUSES } from "../../constants/jobStatuses.js";
import { 
  getJob as getJobApi,
  updateJob as updateJobApi,
  createComment as JobApiCreateComment,
  getJobComments as JobApiGetComments,
  updateJobComment as JobApiUpdateComment,
  deleteJobComment as JobApiDeleteComment
} from "../../api/Job";
import { formatDate, isPendingReview, formatCommentDate } from "../../utils/function";
import CopyButton from "../../components/CopyButton.vue";
import AddComment from "../../components/AddComment.vue";
import ConfirmDialog from "../../components/ConfirmDialog.vue";
import addJobApplication from "../../components/AddJobApplication.vue";
import EditableTimeline from "../../components/EditableTimeline.vue";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const job = ref(null);
const loading = ref(true);
const statusColors = STATUS_COLORS;
const relanceInfo = ref(null);
const comments = ref([]);
const showDeleteDialog = ref(false);
const commentToDelete = ref(null);
const commentToEdit = ref(null);

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
    relanceInfo.value = isPendingReview(job.value.date);

    const commentsData = await getJobCommentsApi();
    comments.value = commentsData.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
      return dateB - dateA;
    });

    loading.value = false;
  } catch (error) {
    
    loading.value = false;
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
  }
});

async function addComment(comment) {
  try {
    const jobId = Number(route.params.id);
    
    // Si on est en mode édition
    if (commentToEdit.value) {
      const commentId = commentToEdit.value.id;
      // Si c'est le commentaire principal du job
      if (commentId === job.value.id && !commentToEdit.value.createdAt) {
        await updateJobApi(job.value.id, { ...job.value, comment: comment.comment });
        job.value.comment = comment.comment;
      } else {
        // Pour les autres commentaires, on utilise l'API updateComment
        await JobApiUpdateComment(job.value.id, commentId, { comment: comment.comment });
      }
      $q.notify({
        message: 'Commentaire modifié avec succès !',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 2000
      });
      commentToEdit.value = null;
    } else {
      // Mode ajout
      await JobApiCreateComment(jobId, { comment: comment.comment });
      $q.notify({
        message: 'Commentaire ajouté avec succès !',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 2000
      });
    }
    
    // Rafraîchir la liste des commentaires
    comments.value = await getJobCommentsApi();
  } catch (error) {
    $q.notify({
      message: 'Erreur lors de l\'opération',
      color: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    });
    console.error(error);
  }
}

function editerCommentaire(comment) {
  commentToEdit.value = comment;
}

async function getJobCommentsApi() {
  const jobId = Number(route.params.id);
  return await JobApiGetComments(jobId);
}

async function confirmDelete() {
  try {
    await JobApiDeleteComment(job.value.id, commentToDelete.value.id);
    comments.value = comments.value.filter(c => c.id !== commentToDelete.value.id);
    
    $q.notify({
      message: 'Commentaire supprimé avec succès !',
      color: 'positive',
      icon: 'check',
      position: 'top-right',
      timeout: 2000
    });
  } catch (error) {
    $q.notify({
      message: 'Erreur lors de la suppression du commentaire',
      color: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    });
  }
}


async function updateJobApplication(formData) {
  try {
    await updateJobApi(job.value.id, formData);
    job.value = await getJobApi(job.value.id);
  } catch (error) {
    console.error(error);
  }
}

function updateStatus(status) {
  job.value.status = status;
  updateJobApi(job.value.id, job.value);
}

function goBack() {
  router.back();
}

function supprimerCommentaire(comment) {
  commentToDelete.value = comment;
  showDeleteDialog.value = true;
}
</script>

<template>
  <div class="q-pa-md">
    <!-- Bouton retour -->
    <div class="q-mb-md flex justify-between">
      <q-btn
        icon="arrow_back"
        label="Retour"
        color="secondary"
        @click="goBack"
      />
      <addJobApplication 
        :job="job"
        @submit="updateJobApplication" 
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
                  <span v-if="relanceInfo && job.status !== 'Refusée'">  
                    - <q-badge 
                        class="q-ml-sm text-body1"
                        :color="relanceInfo?.color"
                        :label="relanceInfo?.label"
                      />
                  </span>
                </div>
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Lien de l'offre</div>
                <a
                  :href="job.job_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary text-body1"
                  style="text-decoration: none"
                >
                  {{ job.job_link ? job.job_link : 'Lien non renseigné' }}
                  <q-icon name="open_in_new" size="sm" class="q-ml-xs" />
                </a>
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Langages de programmation</div>
                <div class="text-body1">
                  <q-chip 
                    v-for="language in job.language"
                    :key="language"
                    :label="language"
                    color="primary"
                    text-color="white"
                  />
                </div>
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

              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Nom du contact</div>
                <div class="text-body1">{{ job.contactName  ?? "N/C"}}</div>
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Email</div>
                <div class="flex items-center q-gutter-sm">
                  <span class="text-body1">{{ job.contactEmail  ?? "N/C"}}</span>
                  <CopyButton
                    :text="job.contactEmail"
                    tooltip="Copier l'email"
                    success-message="Email copié dans le presse-papiers !"
                  />
                </div>
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Numéro de téléphone</div>
                <div class="text-body1">{{ job.contactPhone  ?? "N/C"}}</div>
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Plateforme</div>
                <div class="text-body1">{{ job.platform  ?? "N/C"}}</div>
              </div>

              <div class="q-mb-md">
                <AddComment 
                  :comment-to-edit="commentToEdit"
                  @submit="addComment"
                  @cancel="commentToEdit = null"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Commentaire -->
        <div class="col-12" v-if="comments.length > 0">
          <q-card>
            <q-card-section
              class="text-h6"
              style="background-color: var(--accent); color: white"
            >
              Commentaire / Résumé ({{ comments.length }})
            </q-card-section>
            <q-card-section>
              <EditableTimeline
                :items="comments"
                :format-date-function="formatCommentDate"
                timeline-color="primary"
                timeline-icon="comment"
                timeline-side="right"
                @edit="editerCommentaire"
                @delete="supprimerCommentaire"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Pièces jointes -->
        <!-- <div
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
        </div> -->
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

  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Confirmer la suppression du commentaire"
    message="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
    header-color="negative"
    @confirm="confirmDelete"
  />
</template>
