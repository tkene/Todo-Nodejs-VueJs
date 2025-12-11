<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const job = ref(null)
const loading = ref(true)

// Données mockées pour l'exemple (à remplacer par un appel API)
const mockJobs = {
  1: {
    id: 1,
    company: 'Google',
    job: 'Développeur Full Stack',
    status: 'Entretien',
    date: '2024-01-12',
    job_link: 'https://careers.google.com/jobs/123456',
    contactName: 'Jean Dupont',
    contactEmail: 'jean.dupont@google.com',
    comment: 'Premier entretien technique prévu le 15 janvier. Poste très intéressant avec une équipe dynamique.',
    attachments: [
      { id: 1, name: 'CV_Jean_Dupont.pdf' },
      { id: 2, name: 'Lettre_Motivation.pdf' }
    ]
  },
  2: {
    id: 2,
    company: 'Amazon',
    job: 'Software Engineer',
    status: 'Envoyée',
    date: '2024-01-14',
    job_link: 'https://www.amazon.jobs/en/jobs/789012',
    contactName: 'Marie Martin',
    contactEmail: 'marie.martin@amazon.com',
    comment: 'Candidature envoyée. En attente de réponse.',
    attachments: [
      { id: 1, name: 'CV_Marie_Martin.pdf' }
    ]
  }
}

const statusColors = {
  'À envoyer': 'gray',
  'Envoyée': 'blue',
  'Relance faite': 'orange',
  'Entretien': 'purple',
  'Offre': 'green',
  'Refusée': 'red'
}

onMounted(() => {
  const jobId = route.params.id
  // TODO: Remplacer par un appel API réel
  // const response = await axios.get(`${API}/applications/${jobId}`)
  // job.value = response.data
  
  // Simulation avec données mockées
  job.value = mockJobs[jobId] || null
  loading.value = false

  if (!job.value) {
    $q.notify({
      message: 'Candidature non trouvée',
      color: 'negative',
      icon: 'error',
      position: 'top-right'
    })
    router.push('/job-alerts')
  }
})

function goBack() {
  router.back()
}

function formatDate(dateString) {
  if (!dateString) return 'Non renseignée'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
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

      <div class="row q-col-gutter-md">
        <!-- Informations principales -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section class="text-h6" style="background-color: var(--info); color: white;">
              Informations principales
            </q-card-section>
            <q-card-section>
              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Statut</div>
                <div class="text-body1">{{ job.status }}</div>
              </div>
              <div class="q-mb-md">
                <div class="text-caption text-grey-7">Date de candidature</div>
                <div class="text-body1">{{ formatDate(job.date) }}</div>
              </div>
              <div v-if="job.job_link">
                <div class="text-caption text-grey-7">Lien de l'offre</div>
                <a 
                  :href="job.job_link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-primary text-body1"
                  style="text-decoration: none;"
                >
                  {{ job.job_link }}
                  <q-icon name="open_in_new" size="sm" class="q-ml-xs" />
                </a>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contact -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section class="text-h6" style="background-color: var(--secondary); color: white;">
              Contact
            </q-card-section>
            <q-card-section>
              <div class="q-mb-md" v-if="job.contactName">
                <div class="text-caption text-grey-7">Nom du contact</div>
                <div class="text-body1">{{ job.contactName }}</div>
              </div>
              <div v-if="job.contactEmail">
                <div class="text-caption text-grey-7">Email</div>
                <a 
                  :href="`mailto:${job.contactEmail}`"
                  class="text-primary text-body1"
                  style="text-decoration: none;"
                >
                  {{ job.contactEmail }}
                  <q-icon name="email" size="sm" class="q-ml-xs" />
                </a>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Commentaire -->
        <div class="col-12" v-if="job.comment">
          <q-card>
            <q-card-section class="text-h6" style="background-color: var(--accent); color: white;">
              Commentaire / Résumé
            </q-card-section>
            <q-card-section>
              <p class="text-body1 q-ma-none" style="white-space: pre-wrap;">{{ job.comment }}</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Pièces jointes -->
        <div class="col-12" v-if="job.attachments && job.attachments.length > 0">
          <q-card>
            <q-card-section class="text-h6" style="background-color: var(--primary); color: white;">
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
                    <q-btn 
                      icon="download" 
                      flat 
                      round 
                      dense
                      color="primary"
                    />
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
