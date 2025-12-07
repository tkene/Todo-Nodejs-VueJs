const { readDB, writeDB } = require('./db');

let todos = [];
let tags = [];

function init() {
  const db = readDB();
  todos = db.todos || [];
  tags = db.tags || [];
}

function getTodos() {
  return todos;
}

function getTags() {
  return tags;
}

function setTodos(newTodos) {
  todos = newTodos;
  writeDB(todos, tags);
}

function setTags(newTags) {
  tags = newTags;
  writeDB(todos, tags);
}

function save() {
  writeDB(todos, tags);
}

module.exports = {
  init,
  getTodos,
  getTags,
  setTodos,
  setTags,
  save
};

