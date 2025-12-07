const express = require('express');
const router = express.Router();
const tagsModule = require('../modules/tags');

router.get("/", (req, res) => {
  const tags = tagsModule.getTags();
  res.json(tags);
});

router.post("/", (req, res) => {
  try {
    const tag = tagsModule.createTag(req.body);
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", (req, res) => {
  const tag = tagsModule.updateTag(req.params.id, req.body);
  if (!tag) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(tag);
});

router.delete("/:id", (req, res) => {
  console.log("🔴 Route DELETE /tags/:id appelée avec ID:", req.params.id);
  const result = tagsModule.deleteTag(req.params.id);
  if (!result) {
    console.log("❌ Résultat null, tag non trouvé");
    return res.status(404).json({ error: "not found" });
  }
  console.log("✅ Route DELETE terminée avec succès");
  res.json({ ok: true });
});

module.exports = router;

