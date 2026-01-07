const db = require('../models');

async function getJobs(userId) {
  // 1. Assigner automatiquement tous les Jobs orphelins (sans userId) à l'utilisateur connecté
  const orphanJobs = await db.Job.findAll({
    where: { userId: null }
  });
  
  if (orphanJobs.length > 0) {
    console.log(`📝 Attribution automatique de ${orphanJobs.length} Job(s) orphelin(s) à l'utilisateur ${userId}`);
    for (const job of orphanJobs) {
      job.userId = userId;
      await job.save();
    }
  }
  
  // 2. Récupérer tous les Jobs de l'utilisateur (y compris ceux qui viennent d'être assignés)
  const jobs = await db.Job.findAll({
    where: { userId },
    order: [['date', 'DESC']]
  });
  
  return jobs.map(job => ({
    id: job.id,
    company: job.company,
    job: job.job,
    status: job.status,
    date: job.date,
    job_link: job.job_link,
    contactName: job.contactName,
    contactEmail: job.contactEmail,
    contactPhone: job.contactPhone,
    platform: job.platform,
    language: job.language,
    createdAt: job.createdAt
  }));
}

async function getJob(id, userId) {
  const jobId = Number(id);
  
  // Chercher d'abord le job avec le userId
  let job = await db.Job.findOne({
    where: { id: jobId, userId },
    include: [{
      model: db.Comment,
      as: 'comments',
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  });
  
  // Si le job n'est pas trouvé, chercher un job orphelin (sans userId) et l'assigner
  if (!job) {
    job = await db.Job.findOne({
      where: { id: jobId, userId: null },
      include: [{
        model: db.Comment,
        as: 'comments',
        separate: true,
        order: [['createdAt', 'DESC']]
      }]
    });
    
    if (job) {
      // Assigner automatiquement le job orphelin à l'utilisateur
      job.userId = userId;
      await job.save();
      console.log(`📝 Job ${jobId} assigné automatiquement à l'utilisateur ${userId}`);
    }
  }
  
  if (!job) {
    return null;
  }
  
  return {
    id: job.id,
    company: job.company,
    job: job.job,
    status: job.status,
    date: job.date,
    job_link: job.job_link,
    contactName: job.contactName,
    contactEmail: job.contactEmail,
    contactPhone: job.contactPhone,
    platform: job.platform,
    language: job.language,
    createdAt: job.createdAt,
    comments: job.comments || []
  };
}

async function createJob(jobData, userId) {
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
  
  const newJob = await db.Job.create({
    id: Date.now(),
    company,
    job,
    status,
    date: date ? new Date(date) : null,
    job_link,
    contactName,
    contactEmail,
    contactPhone,
    platform,
    language: Array.isArray(language) ? language : (language || []),
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    userId
  });
  
  return {
    id: newJob.id,
    company: newJob.company,
    job: newJob.job,
    status: newJob.status,
    date: newJob.date,
    job_link: newJob.job_link,
    contactName: newJob.contactName,
    contactEmail: newJob.contactEmail,
    contactPhone: newJob.contactPhone,
    platform: newJob.platform,
    language: newJob.language,
    createdAt: newJob.createdAt
  };
}

async function updateJob(id, jobData, userId) {
  const jobId = Number(id);
  const job = await db.Job.findOne({ where: { id: jobId, userId } });
  
  if (!job) {
    return null;
  }
  
  if (jobData.company !== undefined) job.company = jobData.company;
  if (jobData.job !== undefined) job.job = jobData.job;
  if (jobData.status !== undefined) job.status = jobData.status;
  if (jobData.date !== undefined) job.date = jobData.date ? new Date(jobData.date) : null;
  if (jobData.job_link !== undefined) job.job_link = jobData.job_link;
  if (jobData.contactName !== undefined) job.contactName = jobData.contactName;
  if (jobData.contactEmail !== undefined) job.contactEmail = jobData.contactEmail;
  if (jobData.contactPhone !== undefined) job.contactPhone = jobData.contactPhone;
  if (jobData.platform !== undefined) job.platform = jobData.platform;
  if (jobData.language !== undefined) {
    job.language = Array.isArray(jobData.language) ? jobData.language : (jobData.language || []);
  }
  
  await job.save();
  
  return {
    id: job.id,
    company: job.company,
    job: job.job,
    status: job.status,
    date: job.date,
    job_link: job.job_link,
    contactName: job.contactName,
    contactEmail: job.contactEmail,
    contactPhone: job.contactPhone,
    platform: job.platform,
    language: job.language,
    createdAt: job.createdAt
  };
}

async function deleteJob(id, userId) {
  const jobId = Number(id);
  const job = await db.Job.findOne({ where: { id: jobId, userId } });
  
  if (!job) {
    return null;
  }
  
  // Les commentaires seront supprimés automatiquement grâce à CASCADE
  await job.destroy();
  
  return true;
}

async function createComment(id, commentData, userId) {
  const jobId = Number(id);
  const commentText = commentData.comment || commentData;
  
  // Vérifier que le job existe et appartient à l'utilisateur
  const job = await db.Job.findOne({ where: { id: jobId, userId } });
  if (!job) {
    return null;
  }
  
  const newComment = await db.Comment.create({
    id: Date.now(),
    jobId,
    comment: commentText,
    createdAt: new Date()
  });
  
  return {
    id: newComment.id,
    jobId: newComment.jobId,
    comment: newComment.comment,
    createdAt: newComment.createdAt
  };
}

async function getComments(id, userId) {
  const jobId = Number(id);
  // Vérifier que le job appartient à l'utilisateur
  const job = await db.Job.findOne({ where: { id: jobId, userId } });
  if (!job) {
    return [];
  }
  
  const comments = await db.Comment.findAll({
    where: { jobId },
    order: [['createdAt', 'DESC']]
  });
  
  return comments.map(comment => ({
    id: comment.id,
    jobId: comment.jobId,
    comment: comment.comment,
    createdAt: comment.createdAt
  }));
}

async function updateJobComment(id, commentId, commentData, userId) {
  const jobId = Number(id);
  const commentIdNum = Number(commentId);
  const commentText = commentData.comment || commentData;
  
  // Vérifier que le job appartient à l'utilisateur
  const job = await db.Job.findOne({ where: { id: jobId, userId } });
  if (!job) {
    return null;
  }
  
  const comment = await db.Comment.findOne({
    where: {
      id: commentIdNum,
      jobId: jobId
    }
  });
  
  if (!comment) {
    return null;
  }
  
  comment.comment = commentText;
  await comment.save();
  
  return {
    id: comment.id,
    jobId: comment.jobId,
    comment: comment.comment,
    createdAt: comment.createdAt
  };
}

async function deleteJobComment(commentId, userId) {
  const commentIdNum = Number(commentId);
  const comment = await db.Comment.findByPk(commentIdNum);
  
  if (!comment) {
    return null;
  }
  
  // Vérifier que le job associé appartient à l'utilisateur
  const job = await db.Job.findOne({ where: { id: comment.jobId, userId } });
  if (!job) {
    return null;
  }
  
  await comment.destroy();
  
  return true;
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
