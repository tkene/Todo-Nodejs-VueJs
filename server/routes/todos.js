const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const todosModule = require('../modules/todos');

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const todos = await todosModule.getTodos(userId);
    res.json(todos);
  } catch (error) {
    console.error('Erreur lors de la récupération des todos:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const todo = await todosModule.createTodo(req.body, userId);
    res.json(todo);
  } catch (error) {
    console.error('Erreur lors de la création du todo:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const todo = await todosModule.updateTodo(req.params.id, req.body, userId);
    if (!todo) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(todo);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du todo:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const success = await todosModule.deleteTodo(req.params.id, userId);
    if (!success) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du todo:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
