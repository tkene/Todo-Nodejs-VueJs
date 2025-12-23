const db = require('../models');

async function getTags(userId) {
  const tags = await db.Tag.findAll({
    where: { userId },
    order: [['name', 'ASC']]
  });
  
  return tags.map(tag => ({
    id: tag.id,
    name: tag.name
  }));
}

async function createTag(tagData, userId) {
  const { name } = tagData;
  
  const tag = await db.Tag.create({
    id: Date.now(),
    name,
    userId
  });
  
  return {
    id: tag.id,
    name: tag.name
  };
}

async function updateTag(id, tagData, userId) {
  const tagId = Number(id);
  const tag = await db.Tag.findOne({ where: { id: tagId, userId } });
  
  if (!tag) {
    return null;
  }
  
  if (tagData.name !== undefined) {
    tag.name = tagData.name;
  }
  
  await tag.save();
  
  return {
    id: tag.id,
    name: tag.name
  };
}

async function deleteTag(id, userId) {
  const tagId = Number(id);
  const tag = await db.Tag.findOne({ where: { id: tagId, userId } });
  
  if (!tag) {
    return null;
  }
  
  // Les relations avec les todos seront supprimées automatiquement grâce à CASCADE
  await tag.destroy();
  
  return {
    id: tag.id,
    name: tag.name
  };
}

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag
};
