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
