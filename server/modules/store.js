const { readDB, writeDB } = require('./db');

let todos = [];
let tags = [];
let jobs = [];

function init() {
  const db = readDB();
  todos = db.todos || [];
  tags = db.tags || [];
  jobs = db.jobs || [];
}

function getTodos() {
  return todos;
}

function getTags() {
  return tags;
}

function setTodos(newTodos) {
  todos = newTodos;
  writeDB(todos, tags, jobs);
}

function setTags(newTags) {
  tags = newTags;
  writeDB(todos, tags, jobs);
}

function save() {
  writeDB(todos, tags, jobs);
}

function getJobs() {
  return jobs;
}

function setJobs(newJobs) {
  jobs = newJobs;
  writeDB(todos, tags, jobs);
}

module.exports = {
  init,
  getTodos,
  getTags,
  setTodos,
  setTags,
  save,
  getJobs,
  setJobs
};

