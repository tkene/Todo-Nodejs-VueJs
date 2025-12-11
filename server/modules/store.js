const { readDB, writeDB } = require('./db');

let todos = [];
let tags = [];
let jobs = [];
let comments = [];

function init() {
  const db = readDB();
  todos = db.todos || [];
  tags = db.tags || [];
  jobs = db.jobs || [];
  comments = db.comments || [];
}

function getTodos() {
  return todos;
}

function getTags() {
  return tags;
}

function setTodos(newTodos) {
  todos = newTodos;
  writeDB(todos, tags, jobs, comments);
}

function setTags(newTags) {
  tags = newTags;
  writeDB(todos, tags, jobs, comments);
}

function save() {
  writeDB(todos, tags, jobs, comments);
}

function getJobs() {
  return jobs;
}

function setJobs(newJobs) {
  jobs = newJobs;
  writeDB(todos, tags, jobs, comments);
}

function getComments() {
  return comments;
}

function setComments(newComments) {
  comments = newComments;
  writeDB(todos, tags, jobs, comments);
}

module.exports = {
  init,
  getTodos,
  getTags,
  setTodos,
  setTags,
  save,
  getJobs,
  setJobs,
  getComments,
  setComments
};

