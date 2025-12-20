import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const getTodos = async () => {
  const response = await axios.get(`${API}/todos`)
  return response.data
}

export const createTodo = async (todo) => {
  const response = await axios.post(`${API}/todos`, todo)
  return response.data
}

export const updateTodo = async (id, todo) => {
  const response = await axios.put(`${API}/todos/${id}`, todo)
  return response.data
}

export const deleteTodo = async (id) => {
  const response = await axios.delete(`${API}/todos/${id}`)
  return response.data
}
