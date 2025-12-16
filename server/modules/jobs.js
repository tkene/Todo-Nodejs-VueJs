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
    contactPhone,
    platform,
    language,
    createdAt
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
    contactPhone,
    platform,
    language: language || [],
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
    contactPhone,
    platform,
    language
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
    contactPhone,
    platform,
    language: language !== undefined ? language : jobs[jobIndex].language || []
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

function createComment(id, commentData) {
  const jobId = Number(id);
  const commentText = commentData.comment || commentData;
  const now = Date.now();
  const newComment = {
    id: now,
    jobId,
    comment: commentText,
    createdAt: new Date(now).toISOString()
  };
  store.setComments([...store.getComments(), newComment]);
  console.log("✅ Commentaire créé avec succès");
  return newComment;
}

function getComments(id) {
  console.log("getComments module", id);
  const jobId = Number(id);
  console.log("jobId", jobId);
  const comments = store.getComments().filter(c => c.jobId === jobId);
  console.log("comments", comments);
  return comments;
}

function updateJobComment(id, commentId, commentData) {
  const jobId = Number(id);
  const commentIdNum = Number(commentId);
  const commentText = commentData.comment || commentData;
  const comments = store.getComments();
  const commentIndex = comments.findIndex(c => c.id === commentIdNum && c.jobId === jobId);
  
  if (commentIndex === -1) {
    return null;
  }
  
  const updatedComment = {
    ...comments[commentIndex],
    comment: commentText
  };
  
  const updatedComments = [...comments];
  updatedComments[commentIndex] = updatedComment;
  store.setComments(updatedComments);
  
  console.log("✅ Commentaire mis à jour avec succès");
  return updatedComment;
}

function deleteJobComment(commentId) {
  const commentIdNum = Number(commentId);
  const comments = store.getComments();
  if (!comments.length) {
    return null;
  }
  const filteredComments = comments.filter(c => c.id !== commentIdNum); // Supprime le commentaire avec l'id spécifié
  store.setComments(filteredComments);
  console.log("✅ Commentaire supprimé avec succès");
  return filteredComments;
}

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  createComment,
  getComments,
  updateJobComment,
  deleteJobComment
};
