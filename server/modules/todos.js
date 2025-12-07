const store = require('./store');

function getTodos() {
  const todos = store.getTodos();
  const tags = store.getTags() || [];
  const tagMap = new Map(tags.map(t => [t.id, t.name]));
  
  return todos.map(todo => ({
    ...todo,
    tags: (todo.tags || []).map(tagId => {
      // Si c'est déjà un nom (ancien format), le garder
      if (typeof tagId === 'string') {
        return tagId;
      }
      // Sinon, convertir l'ID en nom
      return tagMap.get(tagId) || tagId;
    })
  }));
}

function createTodo(todoData) {
  const { text, tags: todoTags } = todoData;
  const todos = [...store.getTodos()];
  const tags = (store.getTags() || []).filter(t => t && t.name && t.id);
  const tagMap = new Map(tags.map(t => [t.name.toLowerCase(), t.id]));
  
  const tagIds = (todoTags || []).map(tag => {
    if (typeof tag === 'number') {
      console.log("🔍 Tag ID à créer:", tag);
      return tag;
    }
    if (typeof tag === 'string') {
      console.log("🔍 Tag Name à créer:", tag);
      return tagMap.get(tag.toLowerCase()) || tag;
    }
    console.log("🔍 Tag à créer:", tag);
    return tag;
  });
  
  const todo = {
    id: Date.now(),
    text: text || "",
    done: false,
    tags: tagIds,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  store.setTodos(todos);
  console.log("✅ Todo créé avec succès");
  const tagNameMap = new Map(tags.map(t => [t.id, t.name]));
  return {
    ...todo,
    tags: tagIds.map(id => tagNameMap.get(id) || id)
  };
}

function updateTodo(id, todoData) {
  const todoId = Number(id);
  const todos = [...store.getTodos()];
  const tags = store.getTags() || [];
  const tagMap = new Map(tags.map(t => [t.name.toLowerCase(), t.id]));
  
  const idx = todos.findIndex(t => t.id === todoId);
  if (idx === -1) {
    console.log("❌ Todo non trouvé");
    return null;
  }
  
  // Convertir les noms de tags en IDs si nécessaire
  if (todoData.tags) {
    todoData.tags = todoData.tags.map(tag => {
      if (typeof tag === 'number') {
        console.log("🔍 Tag ID à convertir:", tag);
        return tag;
      }
      console.log("🔍 Tag Name à convertir:", tag);
      return tagMap.get(tag.toLowerCase()) || tag;
    });
  }
  console.log("🔍 Todo à mettre à jour:", todoData);
  todos[idx] = { ...todos[idx], ...todoData };
  store.setTodos(todos);
  console.log("✅ Todo mis à jour avec succès");
  const tagNameMap = new Map(tags.map(t => [t.id, t.name]));
  console.log("✅ Todo retourné avec succès:", todos[idx]);
  return {
    ...todos[idx],
    tags: (todos[idx].tags || []).map(tagId => {
      if (typeof tagId === 'string') {
        return tagId;
      }
      return tagNameMap.get(tagId) || tagId;
    })
  };
}

function deleteTodo(id) {
  const todoId = Number(id);
  const todos = store.getTodos();
  console.log("🔍 Todos à supprimer:", todos);
  const filteredTodos = todos.filter(t => t.id !== todoId);
  console.log("🔍 Todos filtrés:", filteredTodos);
  store.setTodos(filteredTodos);
  console.log("✅ Todo supprimé avec succès");
  return true;
}

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
};

