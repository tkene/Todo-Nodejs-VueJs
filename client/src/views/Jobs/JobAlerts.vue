<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import StatCard from '../../components/StatCard.vue';
import AddJobApplication from '../../components/AddJobApplication.vue';
import ListCard from '../../components/ListCard.vue';
import { 
  getJobs as getJobsApi,
  createJob as createJobApi,
} from '../../api/Job';
import { formatDate } from '../../utils/function';
import { STATUS_COLORS } from '../../constants/jobStatuses';

const $q = useQuasar();
const statusColors = STATUS_COLORS;

const jobs = ref([]);
const isLoading = ref(false);
const error = ref(null);

const activeJobs = computed(() => {
  return jobs.value.filter(job => job.status !== 'Refusée');
});

const rejectedJobs = computed(() => {
  return jobs.value.filter(job => job.status === 'Refusée');
});

const sortedActiveJobs = computed(() => {
  return [...activeJobs.value].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB; // Plus ancienne en premier
  });
});

const stats = computed(() => [
  { 
    label: 'Candidatures', 
    value: jobs.value.length,
    icon: 'description',
    iconColor: 'blue'
  },
  { 
    label: 'En cours', 
    value: activeJobs.value.length,
    icon: 'hourglass_empty',
    iconColor: 'amber'
  },
  { 
    label: 'Entretiens prévus', 
    value: jobs.value.filter(job => job.status === 'Entretien').length,
    icon: 'event',
    iconColor: 'purple'
  },
  { 
    label: 'Offres reçues', 
    value: jobs.value.filter(job => job.status === 'Offre').length,
    icon: 'description',
    iconColor: 'green'
  }
]);

async function handleSubmit(formData) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const newJob = await createJobApi(formData);
    
    jobs.value.unshift(newJob);
    
    $q.notify({
      message: 'Candidature ajoutée avec succès !',
      color: 'positive',
      icon: 'check',
      position: 'top-right',
      timeout: 2000
    });
  } catch (err) {
    error.value = err;
    const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'ajout de la candidature';
    
    $q.notify({
      message: errorMessage,
      color: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    });
  } finally {
    isLoading.value = false;
  }
}

async function loadJobs() {
  try {
    isLoading.value = true;
    error.value = null;
    
    const data = await getJobsApi();
    
    // Validation basique
    if (!Array.isArray(data)) {
      throw new Error('Les données reçues ne sont pas un tableau');
    }
    
    jobs.value = data;
  } catch (err) {
    error.value = err;
    const errorMessage = err?.response?.data?.message || 'Erreur lors du chargement des candidatures';
    
    $q.notify({
      message: errorMessage,
      color: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    });
    
    jobs.value = [];
  }
}

onMounted(() => {
  loadJobs()
})

</script>

<style scoped>
/* Transitions pour les listes - ne peut pas être fait avec Tailwind seul */
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.list-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.list-fade-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrollbar personnalisée */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>

<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header avec titre et bouton -->
    <div class="mb-8">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h1 class="flex items-center gap-3 text-3xl md:text-4xl font-bold m-0 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          <q-icon name="work" class="text-indigo-600 text-4xl md:text-5xl" />
          <span>Candidatures</span>
        </h1>
        <AddJobApplication 
          @submit="handleSubmit"
        />
      </div>
    </div>

    <!-- Cartes de statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <StatCard
        v-for="card in stats"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :icon-color="card.iconColor"
      />
    </div>

    <!-- Tableaux des candidatures -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Liste des candidatures envoyées -->
      <div class="min-w-0">
        <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-out overflow-hidden flex flex-col h-full hover:-translate-y-0.5">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 md:p-6 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
            <div class="flex items-center gap-3 relative z-10">
              <q-icon name="send" class="text-2xl opacity-90" />
              <h2 class="text-xl font-semibold flex-1 m-0">Candidatures envoyées</h2>
              <q-badge 
                :label="activeJobs.length" 
                color="white" 
                text-color="primary"
                class="font-semibold px-3 py-1 rounded-xl text-sm"
              />
            </div>
          </div>
          <div class="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar">
            <transition-group name="list-fade" tag="div" class="flex flex-col gap-2">
              <router-link 
                v-for="item in sortedActiveJobs"
                :key="item.id"
                :to="`/job-details/${item.id}`" 
                class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 text-decoration-none transition-all duration-300 ease-out relative overflow-hidden group hover:from-blue-100 hover:to-blue-200 hover:border-blue-500 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-500/15"
              >
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-500 transition-all duration-300"></div>
                <div class="flex-1 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="flex-shrink-0">
                      <q-badge 
                        :color="statusColors[item.status] || 'grey'" 
                        :label="item.status || 'Non défini'" 
                        class="font-semibold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wide shadow-sm"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-sm text-gray-800 mb-1 tracking-wide">{{ item.company?.toUpperCase() }}</div>
                      <div class="text-xs text-gray-600 font-medium">{{ item.job }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 text-gray-400 text-xs font-medium whitespace-nowrap">
                    <q-icon name="event" size="16px" class="opacity-70" />
                    <span>{{ formatDate(item.date) }}</span>
                  </div>
                </div>
                <div class="text-gray-400 transition-all duration-300 ml-2 group-hover:text-indigo-600 group-hover:translate-x-1">
                  <q-icon name="chevron_right" size="20px" />
                </div>
              </router-link>
              <div v-if="sortedActiveJobs.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center">
                <q-icon name="inbox" size="48px" class="text-gray-300 mb-4" />
                <p class="text-gray-400 text-sm font-medium m-0">Aucune candidature envoyée</p>
              </div>
            </transition-group>
          </div>
        </div>
      </div>

      <!-- Liste des candidatures cloturées -->
      <div class="min-w-0">
        <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-out overflow-hidden flex flex-col h-full hover:-translate-y-0.5">
          <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-5 md:p-6 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
            <div class="flex items-center gap-3 relative z-10">
              <q-icon name="archive" class="text-2xl opacity-90" />
              <h2 class="text-xl font-semibold flex-1 m-0">Candidatures cloturées</h2>
              <q-badge 
                :label="rejectedJobs.length" 
                color="white" 
                text-color="negative"
                class="font-semibold px-3 py-1 rounded-xl text-sm"
              />
            </div>
          </div>
          <div class="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar">
            <transition-group name="list-fade" tag="div" class="flex flex-col gap-2">
              <router-link
                v-for="item in rejectedJobs"
                :key="item.id"
                :to="`/job-details/${item.id}`" 
                class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 text-decoration-none transition-all duration-300 ease-out relative overflow-hidden group hover:from-indigo-50 hover:to-purple-100 hover:border-indigo-500 hover:translate-x-1 hover:shadow-lg hover:shadow-indigo-500/15"
              >
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-indigo-600 transition-all duration-300"></div>
                <div class="flex-1 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-sm text-gray-800 mb-1 tracking-wide">{{ item.company?.toUpperCase() }}</div>
                      <div class="text-xs text-gray-600 font-medium">{{ item.job }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 text-gray-400 text-xs font-medium whitespace-nowrap">
                    <q-icon name="event" size="16px" class="opacity-70" />
                    <span>{{ formatDate(item.date) }}</span>
                  </div>
                </div>
                <div class="text-gray-400 transition-all duration-300 ml-2 group-hover:text-indigo-600 group-hover:translate-x-1">
                  <q-icon name="chevron_right" size="20px" />
                </div>
              </router-link>
              <div v-if="rejectedJobs.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center">
                <q-icon name="inbox" size="48px" class="text-gray-300 mb-4" />
                <p class="text-gray-400 text-sm font-medium m-0">Aucune candidature cloturée</p>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
