const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const tagsModule = require('../modules/tags');

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const tags = await tagsModule.getTags(userId);
    res.json(tags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const tag = await tagsModule.getTag(req.params.id, userId);
    if (!tag) {
      return res.status(404).json({ error: "Tag not found", id: req.params.id });
    }
    res.json(tag);
  } catch (error) {
    console.error('Erreur lors de la récupération du tag:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const tag = await tagsModule.createTag(req.body, userId);
    res.json(tag);
  } catch (error) {
    console.error('Erreur lors de la création du tag:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const tag = await tagsModule.updateTag(req.params.id, req.body, userId);
    if (!tag) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(tag);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tag:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await tagsModule.deleteTag(req.params.id, userId);
    if (!result) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
