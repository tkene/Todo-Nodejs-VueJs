const store = require('./store');

function getTags() {
  return store.getTags();
}

function createTag(tagData) {
  const { name } = tagData;
  const tags = [...store.getTags()];
  const newTag = {
    id: Date.now(),
    name
  };
  console.log("📦 Tag à créer:", newTag);
  tags.push(newTag);
  store.setTags(tags);
  console.log("✅ Tag créé avec succès");
  return newTag;
}

function updateTag(id, tagData) {
  const tagId = Number(id);
  const tags = [...store.getTags()];
  const idx = tags.findIndex(t => t.id === tagId);
  if (idx === -1) {
    console.log("❌ Tag non trouvé");
    return null;
  }
  tags[idx] = { ...tags[idx], ...tagData };
  store.setTags(tags);
  console.log("✅ Tag mis à jour avec succès");
  return tags[idx];
}

function deleteTag(id) {
  console.log("🗑️ deleteTag - ID:", id);
  
  const tagId = Number(id);
  const tags = store.getTags();
  const tagToDelete = tags.find(t => t.id === tagId);
  
  if (!tagToDelete) {
    console.log("❌ Tag non trouvé");
    return null;
  }

  console.log("📦 Tag à supprimer:", tagToDelete);

  const filteredTags = tags.filter(t => t.id !== tagId);
  store.setTags(filteredTags);

  const todos = store.getTodos();
  todos.forEach(todo => {
    if(todo.tags && Array.isArray(todo.tags)){
      todo.tags = todo.tags.filter(t => {
        if (typeof t === 'number') {
          console.log("🔍 Tag ID à supprimer:", t);
          return t !== tagId;
        }
        console.log("🔍 Tag Name à supprimer:", t);
        return t !== tagToDelete.name;
      });
    }
  });
  store.setTodos(todos);
  
  console.log("✅ Tag supprimé avec succès");
  return tagToDelete;
}

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag
};

