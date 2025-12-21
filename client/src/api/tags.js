import axios from 'axios'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')

export const getTags = async () => {
    const response = await axios.get(`${API}/tags`)
    return response.data
}

export const createTag = async (tag) => {
    const response = await axios.post(`${API}/tags`, tag)
    return response.data
}

export const deleteTag = async (tagId) => {
    const response = await axios.delete(`${API}/tags/${tagId}`)
    return response.data
}

export const updateTag = async (tagId, tag) => {
    const response = await axios.put(`${API}/tags/${tagId}`, tag)
    return response.data
}
