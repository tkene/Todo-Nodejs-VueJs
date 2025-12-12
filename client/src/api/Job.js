import axios from 'axios'

const API = 'http://localhost:3000'

export const getJobs = async () => {
    const response = await axios.get(`${API}/jobs`)
    return response.data
}

export const getJob = async (jobId) => {
    const response = await axios.get(`${API}/jobs/${jobId}`)
    return response.data
}

export const createJob = async (job) => {
    const response = await axios.post(`${API}/jobs`, job)
    return response.data
}

export const deleteJob = async (jobId) => {
    const response = await axios.delete(`${API}/jobs/${jobId}`)
    return response.data
}

export const updateJob = async (jobId, job) => {
    const response = await axios.put(`${API}/jobs/${jobId}`, job)
    return response.data
}

export const createComment = async (jobId, comment) => {
    const response = await axios.put(`${API}/jobs/${jobId}/comment`, comment)
    return response.data
}

export const getJobComments = async (jobId) => {
    const response = await axios.get(`${API}/jobs/${jobId}/comment`)
    return response.data
}

export const updateJobComment = async (jobId, commentId, comment) => {
    const response = await axios.put(`${API}/jobs/${jobId}/comment/${commentId}`, comment)
    return response.data
}

export const deleteJobComment = async (jobId, commentId) => {
    const response = await axios.delete(`${API}/jobs/${jobId}/comment/${commentId}`)
    return response.data
}
