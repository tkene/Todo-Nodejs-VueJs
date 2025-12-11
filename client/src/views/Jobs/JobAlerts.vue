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
    value: jobs.value.length 
  },
  { 
    label: 'En cours', 
    value: activeJobs.value.length 
  },
  { 
    label: 'Entretiens prévus', 
    value: jobs.value.filter(job => job.status === 'Entretien').length 
  },
  { 
    label: 'Offres reçues', 
    value: jobs.value.filter(job => job.status === 'Offre').length 
  }
]);

async function handleSubmit(formData) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const newJob = await createJobApi(formData);
    
    // Ajouter le nouveau job au début de la liste
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
    <div class="row q-col-gutter-lg">
      <StatCard
        v-for="card in stats"
        :key="card.label"
        :label="card.label"
        :value="card.value"
      />
    </div>
    
    <div class="q-mt-lg flex justify-end">
      <AddJobApplication 
        @submit="handleSubmit"
      />
    </div>

    <ListCard 
      title="Liste des candidatures" 
      :items="sortedActiveJobs" 
      bg-color="info">
      <template #default="{ item }">
        <router-link 
        :to="`/job-details/${item.id}`" 
        class="w-full"
        >
          <div :key="item.id" class="w-full">
            <q-item-section>
              <div class="flex items-center q-gutter-sm">
                <q-badge :color="statusColors[item.status] || 'grey'" :label="item.status || 'Non défini'" class="text-body1" />
                <span> - {{ item.company?.toUpperCase() }} / {{ item.job }}</span>
              </div>
            </q-item-section>
            <q-item-section side>{{ formatDate(item.date) }}</q-item-section>
          </div>
        </router-link>
      </template>
    </ListCard>

    <ListCard 
      title="Liste des candidatures refusées" 
      :items="rejectedJobs" 
      bg-color="negative">
      <template #default="{ item }">
        <router-link 
        :to="`/job-details/${item.id}`" 
        class="w-full"
        >
          <div :key="item.id" class="w-full">
          <q-item-section>{{ item.company?.toUpperCase() }} / {{ item.job }}</q-item-section>
            <q-item-section side>{{ formatDate(item.date) }}</q-item-section>
          </div>
        </router-link>
      </template>
    </ListCard>
  </div>
  
</template>
