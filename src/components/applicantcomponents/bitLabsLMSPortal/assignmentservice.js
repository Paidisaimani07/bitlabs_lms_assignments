import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api/assignments';

/**
 * Submits a new assignment or updates an existing one if the backend handles upserts.
 * @param {Object} payload - { applicantId, assignmentNumber, assignmentCode, status }
 */
export const submitAssignment = async (payload) => {
    try {
        console.log('API Request Payload (submit):', payload);
        const response = await axios.post(`${BASE_URL}/submit`, payload);
        console.log('API Response (submit):', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error (submit):', error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Fetches previously submitted code for a specific applicant and assignment.
 * @param {number|string} applicantId 
 * @param {number|string} assignmentNumber 
 */
export const getAssignmentByApplicantAndAssignmentNumber = async (applicantId, assignmentNumber) => {
    try {
        console.log(`Fetching assignment for applicant ${applicantId}, assignment ${assignmentNumber}`);
        const response = await axios.get(`${BASE_URL}/fetch`, {
            params: { applicantId, assignmentNumber }
        });
        console.log('Assignment Fetch Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error (fetch):', error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Fetches all assignments submitted by a specific applicant.
 * @param {number|string} applicantId 
 */
export const getAllAssignmentsByApplicant = async (applicantId) => {
    try {
        console.log(`Fetching all assignments for applicant ${applicantId}`);
        const response = await axios.get(`${BASE_URL}/applicant/${applicantId}`);
        console.log('All Assignments Fetch Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error (fetchAll):', error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Updates the assignment code. 
 * @param {number|string} id - The database ID of the assignment record
 * @param {Object} payload - The updated data
 */
export const updateAssignmentCode = async (id, payload) => {
    try {
        console.log(`API Request Payload (update ID: ${id}):`, payload);
        const response = await axios.put(`${BASE_URL}/update/${id}`, payload);
        console.log('API Response (update):', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error (update):', error.response ? error.response.data : error.message);
        throw error;
    }
};
