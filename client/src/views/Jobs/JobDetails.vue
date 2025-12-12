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
/**
 * TODO : 
 * - mise en place du update pour la mise à jour du statut de la candidature
 * - modifier la modification du commentaire pour le commentaire principal du job
 */

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const job = ref(null);
const loading = ref(true);
const statusColors = STATUS_COLORS;
const pendingReview = ref(null);
const comments = ref([]);
const showDeleteDialog = ref(false);
const commentToDelete = ref(null);
const editingCommentId = ref(null);
const editingCommentText = ref('');

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
    await JobApiCreateComment(jobId, { comment: comment.comment });
    // Rafraîchir la liste des commentaires après l'ajout
    comments.value = await getJobCommentsApi();
  } catch (error) {
    console.error(error);
  }
}

async function getJobCommentsApi() {
  const jobId = Number(route.params.id);
  return await JobApiGetComments(jobId);
}

async function confirmDelete() {
  try {
  
    // Pour les autres commentaires, utiliser l'API de suppression
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

async function saveEdit() {
  try {
    const comment = comments.value.find(c => c.id === editingCommentId.value);
    if (comment) {
      // Si c'est le commentaire principal du job (id === job.id et pas de createdAt)
      if (comment.id === job.value.id && !comment.createdAt) {
        // Mettre à jour le job directement
        await updateJobApi(job.value.id, { ...job.value, comment: editingCommentText.value });
        job.value.comment = editingCommentText.value;
        comment.comment = editingCommentText.value;
      } else {
        // Pour les autres commentaires, on utilise l'API updateComment
        await JobApiUpdateComment(job.value.id, editingCommentId.value, { comment: editingCommentText.value });
        comment.comment = editingCommentText.value;
      }
      $q.notify({
        message: 'Commentaire modifié avec succès !',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 2000
      });
    }
  } catch (error) {
    $q.notify({
      message: 'Erreur lors de la modification du commentaire',
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

function deleteComment(comment) {
  commentToDelete.value = comment;
  showDeleteDialog.value = true;
}

function startEdit(comment) {
  editingCommentId.value = comment.id;
  editingCommentText.value = comment.comment;
}

function cancelEdit() {
  editingCommentId.value = null;
  editingCommentText.value = '';
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
                  <span v-if="pendingReview">  
                    - <q-badge 
                        class="q-ml-sm text-body1"
                        :color="pendingReview?.color"
                        :label="pendingReview?.label"
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

              <div class="q-mb-md" v-if="job.contactName">
                <div class="text-caption text-grey-7">Nom du contact</div>
                <div class="text-body1">{{ job.contactName }}</div>
              </div>

              <div class="q-mb-md" v-if="job.contactEmail">
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

              <div class="q-mb-md" v-if="job.contactPhone">
                <div class="text-caption text-grey-7">Numéro de téléphone</div>
                <div class="text-body1">{{ job.contactPhone }}</div>
              </div>

              <div class="q-mb-md" v-if="job.platform">
                <div class="text-caption text-grey-7">Plateforme</div>
                <div class="text-body1">{{ job.platform }}</div>
              </div>

              <div class="q-mb-md">
                <AddComment @submit="addComment" />
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
              <div class="comment-list">
                <div
                  v-for="(comment, index) in comments"
                  :key="comment.id"
                  class="comment-item"
                >
                  <!-- Séparateur -->
                  <q-separator v-if="index > 0" class="q-mb-md" />
                  
                  <!-- Contenu du commentaire -->
                  <div class="comment-content q-pa-md q-mb-md relative-position" style="background-color: rgba(0, 0, 0, 0.02); border-radius: 8px; border-left: 3px solid var(--accent);">
                    <div v-if="editingCommentId !== comment.id">
                      <p class="text-body1 q-ma-none q-pr-xl" style="white-space: pre-wrap; line-height: 1.6;">
                        {{ comment.comment }}
                      </p>
                    </div>
                    <div v-else>
                      <q-input
                        v-model="editingCommentText"
                        type="textarea"
                        autogrow
                        class="q-mb-sm"
                      />
                    </div>
                    <!-- Heure en bas à droite -->
                    <div class="absolute-bottom-right q-pa-sm">
                      <div class="row items-center q-gutter-xs">
                        <q-icon name="schedule" size="12px" color="grey-6" />
                        <span class="text-caption text-grey-6">
                          {{ formatCommentDate(comment.createdAt || comment.id) }}
                        </span>
                      </div>
                    </div>
                    <!-- Boutons d'action en haut à droite -->
                    <div class="absolute-top-right q-pa-sm">
                      <div class="row q-gutter-xs" v-if="editingCommentId !== comment.id">
                        <q-btn 
                          icon="edit"
                          color="warning"
                          size="sm"
                          flat
                          round
                          dense
                          @click="startEdit(comment)"
                        />
                        <q-btn 
                          icon="delete"
                          color="negative"
                          size="sm"
                          flat
                          round
                          dense
                          @click="deleteComment(comment)"
                        />
                      </div>
                      <div class="row q-gutter-xs" v-else>
                        <q-btn 
                          icon="check"
                          color="positive"
                          size="sm"
                          flat
                          round
                          dense
                          @click="saveEdit"
                        />
                        <q-btn 
                          icon="close"
                          color="negative"
                          size="sm"
                          flat
                          round
                          dense
                          @click="cancelEdit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
    title="Confirmer la suppression"
    message="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
    header-color="negative"
    @confirm="confirmDelete"
  />
</template>
