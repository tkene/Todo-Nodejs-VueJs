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
    icon: 'description'
  },
  { 
    label: 'En cours', 
    value: activeJobs.value.length,
    icon: 'hourglass_empty'
  },
  { 
    label: 'Entretiens prévus', 
    value: jobs.value.filter(job => job.status === 'Entretien').length,
    icon: 'event'
  },
  { 
    label: 'Offres reçues', 
    value: jobs.value.filter(job => job.status === 'Offre').length,
    icon: 'description'
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

<template>
  <div class="q-pa-md">
    <!-- Header avec titre et bouton -->
    <div class="row items-center justify-between q-mb-md">
      <h1 class="text-h4 q-ma-none">Candidatures</h1>
      <AddJobApplication 
        @submit="handleSubmit"
      />
    </div>

    <!-- Cartes de statistiques -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <StatCard
        v-for="card in stats"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
      />
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Liste des candidatures envoyées -->
      <div class="col-12 col-md-6">
        <ListCard 
          title="Candidatures envoyées"
          :items="sortedActiveJobs.length > 0 ? sortedActiveJobs : [{ id: 'empty' }]" 
          bg-color="info">
          <template #default="{ item }">
            <router-link 
              v-if="sortedActiveJobs.length > 0"
              :to="`/job-details/${item.id}`" 
              class="w-full text-decoration-none"
            >
              <div :key="item.id" class="row items-center w-full q-pa-sm">
                <q-item-section>
                  <div class="flex items-center q-gutter-sm">
                    <q-badge 
                      :color="statusColors[item.status] || 'grey'" 
                      :label="item.status || 'Non défini'" 
                      class="text-body2" 
                    />
                    <span class="text-body2">{{ item.company?.toUpperCase() }} / {{ item.job }}</span>
                  </div>
                </q-item-section>
                <q-item-section side class="text-body2">
                  {{ formatDate(item.date) }}
                </q-item-section>
              </div>
            </router-link>
            <div v-else class="w-full text-decoration-none q-pa-sm">
              <q-item-section class="text-body2 text-center">
                Aucune candidature envoyée
              </q-item-section>
            </div>
          </template>
        </ListCard>
      </div>

      <!-- Liste des candidatures cloturées -->
      <div class="col-12 col-md-6">
        <ListCard 
          title="Candidatures cloturées" 
          :items="rejectedJobs.length > 0 ? rejectedJobs : [{ id: 'empty' }]" 
          bg-color="negative">
          <template #default="{ item }">
            <router-link
              v-if="rejectedJobs.length > 0 && item.id !== 'empty'"
              :to="`/job-details/${item.id}`" 
              class="w-full text-decoration-none"
            >
              <div :key="item.id" class="row items-center w-full q-pa-sm">
                <q-item-section class="text-body2">
                  {{ item.company?.toUpperCase() }} / {{ item.job }}
                </q-item-section>
                <q-item-section side class="text-body2">
                  {{ formatDate(item.date) }}
                </q-item-section>
              </div>
            </router-link>
            <div v-else class="w-full text-decoration-none q-pa-sm">
              <q-item-section class="text-body2 text-center">
                Aucune candidature cloturée
              </q-item-section>
            </div>
          </template>
        </ListCard>
      </div>
    </div>
  </div>
</template>
