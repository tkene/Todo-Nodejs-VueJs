<script setup>
import { ref, onMounted, computed } from "vue";
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

    // Utiliser les commentaires déjà inclus dans jobData, sinon les récupérer séparément
    if (jobData.comments && jobData.comments.length > 0) {
      comments.value = jobData.comments.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return dateB - dateA;
      });
    } else {
      // Si pas de commentaires dans jobData, les récupérer séparément
      const commentsData = await getJobCommentsApi();
      comments.value = commentsData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return dateB - dateA;
      });
    }

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

    if (commentToEdit.value) {
      const commentId = commentToEdit.value.id;
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
      await JobApiCreateComment(jobId, { comment: comment.comment });
      $q.notify({
        message: 'Commentaire ajouté avec succès !',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 2000
      });
    }
    
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

function truncateLink(link, maxLength = 60) {
  if (!link || link.length <= maxLength) {
    return link;
  }
  const start = Math.floor(maxLength / 2) - 3;
  const end = link.length - (Math.floor(maxLength / 2) - 3);
  return link.substring(0, start) + '...' + link.substring(end);
}

const truncatedJobLink = computed(() => {
  return job.value?.job_link ? truncateLink(job.value.job_link) : null;
});
</script>

<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Bouton retour et édition -->
    <div class="mb-6 flex justify-between items-center flex-wrap gap-4">
      <q-btn
        icon="arrow_back"
        label="Retour"
        color="secondary"
        @click="goBack"
        class="transition-transform duration-200 hover:scale-105"
      />
      <addJobApplication 
        :job="job"
        @submit="updateJobApplication" 
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Job details -->
    <div v-else-if="job">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <q-icon name="business" size="56px" class="text-indigo-600" />
            <div>
              <h1 class="text-3xl md:text-4xl font-bold m-0 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {{ job.company }}
              </h1>
              <p class="text-gray-600 text-lg font-medium mt-1 mb-0">{{ job.job }}</p>
            </div>
          </div>
          <q-badge
            :color="statusColors[job.status] || 'gray'"
            :label="job.status"
            class="text-lg font-semibold px-4 py-2 rounded-xl"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Informations principales -->
        <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 md:p-6 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
            <div class="flex items-center gap-3 relative z-10">
              <q-icon name="info" class="text-2xl opacity-90" />
              <h2 class="text-xl font-semibold m-0">Informations principales</h2>
            </div>
          </div>
          <div class="flex-1 p-5 md:p-6 flex flex-col">
            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statut</div>
              <q-select 
                class="w-full md:w-1/2"
                v-model="job.status" 
                :options="JOB_STATUSES"
                @update:model-value="updateStatus"
                filled
              />
            </div>

            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date de candidature</div>
              <div class="text-base text-gray-800 font-medium flex items-center gap-2 flex-wrap">
                <q-icon name="event" size="18px" class="text-gray-400" />
                <span>{{ formatDate(job.date) }}</span>
                <span v-if="relanceInfo && job.status !== 'Refusée'">  
                  <q-badge 
                    class="ml-2 text-sm font-semibold px-3 py-1"
                    :color="relanceInfo?.color"
                    :label="relanceInfo?.label"
                  />
                </span>
              </div>
            </div>

            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lien de l'offre</div>
              <div class="flex items-center gap-2 flex-wrap">
                <a
                  :href="job.job_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800 text-base font-medium flex items-center gap-2 transition-colors duration-200"
                >
                  <q-icon name="link" size="18px" />
                  <span>{{ truncatedJobLink || 'Lien non renseigné' }}</span>
                </a>
                <CopyButton
                  :text="job.job_link"
                  tooltip="Copier le lien"
                  success-message="Lien copié dans le presse-papiers !"
                />
              </div>
            </div>

            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Langages de programmation</div>
              <div class="flex flex-wrap gap-2">
                <q-chip 
                  v-for="language in job.language"
                  :key="language"
                  :label="language"
                  color="primary"
                  text-color="white"
                  class="font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
          <div class="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-5 md:p-6 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
            <div class="flex items-center gap-3 relative z-10">
              <q-icon name="contact_mail" class="text-2xl opacity-90" />
              <h2 class="text-xl font-semibold m-0">Contact</h2>
            </div>
          </div>
          <div class="flex-1 p-5 md:p-6 flex flex-col">
            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nom du contact</div>
              <div class="text-base text-gray-800 font-medium flex items-center gap-2">
                <q-icon name="person" size="18px" class="text-gray-400" />
                <span>{{ job.contactName ?? "N/C" }}</span>
              </div>
            </div>

            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-base text-gray-800 font-medium flex items-center gap-2">
                  <q-icon name="email" size="18px" class="text-gray-400" />
                  <span>{{ job.contactEmail ?? "N/C" }}</span>
                </span>
                <CopyButton
                  :text="job.contactEmail"
                  tooltip="Copier l'email"
                  success-message="Email copié dans le presse-papiers !"
                />
              </div>
            </div>

            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Numéro de téléphone</div>
              <div class="text-base text-gray-800 font-medium flex items-center gap-2">
                <q-icon name="phone" size="18px" class="text-gray-400" />
                <span>{{ job.contactPhone ?? "N/C" }}</span>
              </div>
            </div>

            <div class="mb-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Plateforme</div>
              <div class="text-base text-gray-800 font-medium flex items-center gap-2">
                <q-icon name="web" size="18px" class="text-gray-400" />
                <span>{{ job.platform ?? "N/C" }}</span>
              </div>
            </div>

            <div class="mt-auto">
              <AddComment 
                :comment-to-edit="commentToEdit"
                @submit="addComment"
                @cancel="commentToEdit = null"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Commentaires -->
      <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 md:p-6 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
          <div class="flex items-center gap-3 relative z-10">
            <q-icon name="comment" class="text-2xl opacity-90" />
            <h2 class="text-xl font-semibold m-0">Commentaires ({{ comments.length }})</h2>
          </div>
        </div>
        <div class="p-5 md:p-6">
          <EditableTimeline
            v-if="comments.length > 0"
            :items="comments"
            :format-date-function="formatCommentDate"
            timeline-color="primary"
            timeline-icon="comment"
            timeline-side="right"
            @edit="editerCommentaire"
            @delete="supprimerCommentaire"
          />
          <div v-else class="flex flex-col items-center justify-center py-12 text-center">
            <q-icon name="comment_outline" size="48px" class="text-gray-300 mb-4" />
            <p class="text-gray-400 text-base font-medium m-0">Aucun commentaire ...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <q-icon name="error_outline" size="4em" color="negative" />
      <p class="text-2xl font-semibold mt-4 mb-4 text-gray-800">Candidature non trouvée</p>
      <q-btn
        label="Retour à la liste"
        color="primary"
        @click="router.push('/job-alerts')"
        class="transition-transform duration-200 hover:scale-105"
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
