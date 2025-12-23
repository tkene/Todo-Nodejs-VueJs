import axiosInstance from './axios'

export const getTags = async () => {
    const response = await axiosInstance.get('/tags')
    return response.data
}

export const createTag = async (tag) => {
    const response = await axiosInstance.post('/tags', tag)
    return response.data
}

export const deleteTag = async (tagId) => {
    const response = await axiosInstance.delete(`/tags/${tagId}`)
    return response.data
}

export const updateTag = async (tagId, tag) => {
    const response = await axiosInstance.put(`/tags/${tagId}`, tag)
    return response.data
}
