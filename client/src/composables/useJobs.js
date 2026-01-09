/**
 * Composable pour la gestion des jobs
 */
import { ref, computed } from 'vue'
import { 
  getJobs as getJobsApi,
  getJob as getJobApi,
  createJob as createJobApi,
  updateJob as updateJobApi,
  deleteJob as deleteJobApi
} from '../api/Job'
import { useNotifications } from './useNotifications'

export function useJobs() {
  const jobs = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const { success, error: showError } = useNotifications()

  // Computed properties
  const activeJobs = computed(() => {
    return jobs.value.filter(job => job.status !== 'Refusée')
  })

  const rejectedJobs = computed(() => {
    return jobs.value.filter(job => job.status === 'Refusée')
  })

  const jobsByStatus = computed(() => {
    return jobs.value.reduce((acc, job) => {
      const status = job.status || 'Non défini'
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(job)
      return acc
    }, {})
  })

  // Methods
  const loadJobs = async () => {
    try {
      isLoading.value = true
      error.value = null
      const data = await getJobsApi()
      jobs.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err
      showError('Erreur lors du chargement des candidatures')
      jobs.value = []
    } finally {
      isLoading.value = false
    }
  }

  const loadJob = async (jobId) => {
    try {
      isLoading.value = true
      error.value = null
      const data = await getJobApi(jobId)
      return data
    } catch (err) {
      error.value = err
      showError('Erreur lors du chargement de la candidature')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addJob = async (jobData) => {
    try {
      isLoading.value = true
      error.value = null
      const newJob = await createJobApi(jobData)
      jobs.value.unshift(newJob)
      success('Candidature ajoutée avec succès !')
      return newJob
    } catch (err) {
      error.value = err
      showError('Erreur lors de l\'ajout de la candidature')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateJob = async (jobId, jobData) => {
    try {
      isLoading.value = true
      error.value = null
      const updatedJob = await updateJobApi(jobId, jobData)
      const index = jobs.value.findIndex(j => j.id === jobId)
      if (index !== -1) {
        jobs.value[index] = updatedJob
      }
      success('Candidature modifiée avec succès !')
      return updatedJob
    } catch (err) {
      error.value = err
      showError('Erreur lors de la modification de la candidature')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeJob = async (jobId) => {
    try {
      isLoading.value = true
      error.value = null
      await deleteJobApi(jobId)
      jobs.value = jobs.value.filter(j => j.id !== jobId)
      success('Candidature supprimée avec succès !')
    } catch (err) {
      error.value = err
      showError('Erreur lors de la suppression de la candidature')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    jobs,
    isLoading,
    error,
    
    // Computed
    activeJobs,
    rejectedJobs,
    jobsByStatus,
    
    // Methods
    loadJobs,
    loadJob,
    addJob,
    updateJob,
    removeJob
  }
}

export default useJobs

