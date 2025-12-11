const express = require('express');
const router = express.Router();
const jobsModule = require('../modules/jobs');

router.get("/", (req, res) => {
  const jobs = jobsModule.getJobs();
  res.json(jobs);
});

router.get("/:id", (req, res) => {
  const jobId = req.params.id;
  console.log("🔍 Recherche du job avec ID:", jobId, "Type:", typeof jobId);
  const job = jobsModule.getJob(jobId);
  if (!job) {
    console.log("❌ Job non trouvé avec ID:", jobId);
    return res.status(404).json({ error: "Job not found", id: jobId });
  }
  console.log("✅ Job trouvé:", job.id);
  res.json(job);
});

router.post("/", (req, res) => {
  try {
    const job = jobsModule.createJob(req.body);
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", (req, res) => {
  console.log("🔴 Route PUT /jobs/:id appelée avec ID:", req.params.id);
  console.log("🔴 Body:", req.body);
  const job = jobsModule.updateJob(req.params.id, req.body);
  if (!job) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(job);
});

router.delete("/:id", (req, res) => {
  console.log("🔴 Route DELETE /jobs/:id appelée avec ID:", req.params.id);
  const result = jobsModule.deleteJob(req.params.id);
  if (!result) {
    console.log("❌ Résultat null, job non trouvé");
    return res.status(404).json({ error: "not found" });
  }
  console.log("✅ Route DELETE terminée avec succès");
  res.json({ ok: true });
});

router.put("/:id/comment", (req, res) => {
  console.log("🔴 Route PUT /jobs/:id/comment appelée avec ID:", req.params.id);
  console.log("🔴 Body:", req.body);
  const comment = jobsModule.createComment(req.params.id, req.body);
  if (!comment) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(comment);
});

router.get("/:id/comment", (req, res) => {
  const comments = jobsModule.getComments(req.params.id);
  res.json(comments);
});

module.exports = router;
