const db = require('../models');

async function getTodos(userId) {
  const todos = await db.Todo.findAll({
    where: { userId },
    include: [{
      model: db.Tag,
      as: 'tags',
      through: { attributes: [] },
      where: { userId },
      required: false
    }],
    order: [['createdAt', 'DESC']]
  });
  
  return todos.map(todo => ({
    id: todo.id,
    text: todo.text,
    done: todo.done,
    tags: todo.tags ? todo.tags.map(tag => tag.name) : [],
    createdAt: todo.createdAt
  }));
}

async function createTodo(todoData, userId) {
  const { text, tags: todoTags } = todoData;
  
  const todo = await db.Todo.create({
    id: Date.now(),
    text: text || "",
    done: false,
    createdAt: new Date(),
    userId
  });
  
  // Gérer les tags (uniquement ceux de l'utilisateur)
  if (todoTags && Array.isArray(todoTags) && todoTags.length > 0) {
    const tagIds = [];
    
    for (const tag of todoTags) {
      if (typeof tag === 'number') {
        // Vérifier que le tag appartient à l'utilisateur
        const tagRecord = await db.Tag.findOne({ where: { id: tag, userId } });
        if (tagRecord) {
          tagIds.push(tag);
        }
      } else if (typeof tag === 'string') {
        // Chercher le tag par nom et userId
        const tagRecord = await db.Tag.findOne({ where: { name: tag, userId } });
        if (tagRecord) {
          tagIds.push(tagRecord.id);
        }
      }
    }
    
    if (tagIds.length > 0) {
      await todo.setTags(tagIds);
    }
  }
  
  // Récupérer le todo avec ses tags
  const todoWithTags = await db.Todo.findByPk(todo.id, {
    include: [{
      model: db.Tag,
      as: 'tags',
      through: { attributes: [] }
    }]
  });
  
  return {
    id: todoWithTags.id,
    text: todoWithTags.text,
    done: todoWithTags.done,
    tags: todoWithTags.tags ? todoWithTags.tags.map(tag => tag.name) : [],
    createdAt: todoWithTags.createdAt
  };
}

async function updateTodo(id, todoData, userId) {
  const todoId = Number(id);
  const todo = await db.Todo.findOne({ where: { id: todoId, userId } });
  
  if (!todo) {
    return null;
  }
  
  // Mettre à jour les champs de base
  if (todoData.text !== undefined) {
    todo.text = todoData.text;
  }
  if (todoData.done !== undefined) {
    todo.done = todoData.done;
  }
  await todo.save();
  
  // Gérer les tags si fournis (uniquement ceux de l'utilisateur)
  if (todoData.tags !== undefined) {
    const tagIds = [];
    
    for (const tag of todoData.tags) {
      if (typeof tag === 'number') {
        // Vérifier que le tag appartient à l'utilisateur
        const tagRecord = await db.Tag.findOne({ where: { id: tag, userId } });
        if (tagRecord) {
          tagIds.push(tag);
        }
      } else if (typeof tag === 'string') {
        const tagRecord = await db.Tag.findOne({ where: { name: tag, userId } });
        if (tagRecord) {
          tagIds.push(tagRecord.id);
        }
      }
    }
    
    await todo.setTags(tagIds);
  }
  
  // Récupérer le todo mis à jour avec ses tags
  const updatedTodo = await db.Todo.findByPk(todoId, {
    include: [{
      model: db.Tag,
      as: 'tags',
      through: { attributes: [] }
    }]
  });
  
  return {
    id: updatedTodo.id,
    text: updatedTodo.text,
    done: updatedTodo.done,
    tags: updatedTodo.tags ? updatedTodo.tags.map(tag => tag.name) : [],
    createdAt: updatedTodo.createdAt
  };
}

async function deleteTodo(id, userId) {
  const todoId = Number(id);
  const todo = await db.Todo.findOne({ where: { id: todoId, userId } });
  
  if (!todo) {
    return false;
  }
  
  await todo.destroy();
  return true;
}

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
};
