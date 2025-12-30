import axiosInstance from './axios'

export const getJobs = async () => {
    const response = await axiosInstance.get('/jobs')
    return response.data
}

export const getJob = async (jobId) => {
    const response = await axiosInstance.get(`/jobs/${jobId}`)
    return response.data
}

export const createJob = async (job) => {
    const response = await axiosInstance.post('/jobs', job)
    return response.data
}

export const deleteJob = async (jobId) => {
    const response = await axiosInstance.delete(`/jobs/${jobId}`)
    return response.data
}

export const updateJob = async (jobId, job) => {
    const response = await axiosInstance.put(`/jobs/${jobId}`, job)
    return response.data
}

export const getJobComments = async (jobId) => {
    const response = await axiosInstance.get(`/jobs/${jobId}/comments`)
    return response.data
}

export const createComment = async (jobId, comment) => {
    const response = await axiosInstance.post(`/jobs/${jobId}/comments`, comment)
    return response.data
}

export const updateJobComment = async (jobId, commentId, comment) => {
    const response = await axiosInstance.put(`/jobs/${jobId}/comments/${commentId}`, comment)
    return response.data
}

export const deleteJobComment = async (jobId, commentId) => {
    const response = await axiosInstance.delete(`/jobs/${jobId}/comments/${commentId}`)
    return response.data
}
