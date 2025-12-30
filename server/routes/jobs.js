const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const jobsModule = require('../modules/jobs');

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const jobs = await jobsModule.getJobs(userId);
    res.json(jobs);
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const jobId = req.params.id;
    const job = await jobsModule.getJob(jobId, userId);
    if (!job) {
      return res.status(404).json({ error: "Job not found", id: jobId });
    }
    res.json(job);
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const job = await jobsModule.createJob(req.body, userId);
    res.json(job);
  } catch (error) {
    console.error('Erreur lors de la création du job:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const job = await jobsModule.updateJob(req.params.id, req.body, userId);
    if (!job) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(job);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du job:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await jobsModule.deleteJob(req.params.id, userId);
    if (!result) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du job:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get("/:id/comments", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const comments = await jobsModule.getComments(req.params.id, userId);
    res.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const comment = await jobsModule.createComment(req.params.id, req.body, userId);
    if (!comment) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(comment);
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put("/:id/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const comment = await jobsModule.updateJobComment(req.params.id, req.params.commentId, req.body, userId);
    if (!comment) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(comment);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete("/:id/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await jobsModule.deleteJobComment(req.params.commentId, userId);
    if (!result) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
