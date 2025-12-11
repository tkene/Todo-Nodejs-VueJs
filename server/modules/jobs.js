const store = require('./store');

function getJobs() {
  return store.getJobs();
}

function getJob(id) {
  const jobId = Number(id);
  const job = store.getJobs().find(j => j.id === jobId);
  return job || null;
}

function createJob(jobData) {
  const { 
    company,
    job,
    status,
    date,
    job_link,
    contactName,
    contactEmail,
    comment
  } = jobData;
  const newJob = {
    id: Date.now(),
    company,
    job,
    status,
    date,
    job_link,
    contactName,
    contactEmail,
    comment
  };
  console.log("📦 Job à créer:", newJob);
  store.setJobs([...store.getJobs(), newJob]);
  console.log("✅ Job créé avec succès");
  return newJob;
}

function updateJob(id, jobData) {
  const jobId = Number(id);
  const { 
    company,
    job: jobTitle,
    status,
    date,
    job_link,
    contactName,
    contactEmail,
    comment
  } = jobData;
  const jobs = store.getJobs();
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  
  if (jobIndex === -1) {
    return null;
  }
  
  // Créer un nouvel objet job avec les données mises à jour
  const updatedJob = {
    ...jobs[jobIndex],
    company,
    job: jobTitle,
    status,
    date,
    job_link,
    contactName,
    contactEmail,
    comment
  };
  
  // Remplacer l'élément à l'index trouvé
  const updatedJobs = [...jobs];
  updatedJobs[jobIndex] = updatedJob;
  store.setJobs(updatedJobs);
  
  console.log("✅ Job mis à jour avec succès");
  return updatedJob;
}

function deleteJob(id) {
  const jobId = Number(id);
  const job = store.getJobs().find(j => j.id === jobId);
  if (!job) {
    return null;
  }
  store.setJobs(store.getJobs().filter(j => j.id !== jobId));
  console.log("✅ Job supprimé avec succès");
  return true;
}

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
};

