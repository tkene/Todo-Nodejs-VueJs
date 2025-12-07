const express = require('express');
const router = express.Router();
const todosModule = require('../modules/todos');

router.get("/", (req, res) => {
  const todos = todosModule.getTodos();
  res.json(todos);
});

router.post("/", (req, res) => {
  try {
    const todo = todosModule.createTodo(req.body);
    res.json(todo);
  } catch (error) {
    console.error('Erreur lors de la création du todo:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put("/:id", (req, res) => {
  try {
    const todo = todosModule.updateTodo(req.params.id, req.body);
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

router.delete("/:id", (req, res) => {
  const success = todosModule.deleteTodo(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "not found" });
  }
  res.json({ ok: true });
});

module.exports = router;
