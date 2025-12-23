import axiosInstance from './axios'

export const getTodos = async () => {
  const response = await axiosInstance.get('/todos')
  return response.data
}

export const createTodo = async (todo) => {
  const response = await axiosInstance.post('/todos', todo)
  return response.data
}

export const updateTodo = async (id, todo) => {
  const response = await axiosInstance.put(`/todos/${id}`, todo)
  return response.data
}

export const deleteTodo = async (id) => {
  const response = await axiosInstance.delete(`/todos/${id}`)
  return response.data
}
