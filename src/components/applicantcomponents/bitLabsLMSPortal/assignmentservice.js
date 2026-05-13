import apiClient from '../../../services/apiClient';

const API_ROOT = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8081';
const BASE_URL = `${API_ROOT}/api/assignments`;

// ─── DEBUG: Verify env var on module load ────────────────────────────────────
console.log('[AssignmentService] REACT_APP_API_URL =', process.env.REACT_APP_API_URL);
console.log('[AssignmentService] Resolved API_ROOT =', API_ROOT);
console.log('[AssignmentService] BASE_URL =', BASE_URL);


/**
 * Helper to extract a user-friendly error message
 */
const getErrorMessage = (error) => {
    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your connection and try again.';
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
        return `Network error: Unable to reach the server at ${API_ROOT}. Make sure the backend is running.`;
    }
    if (error.response) {
        return error.response.data?.message || error.response.data || `Server error (${error.response.status})`;
    }
    return error.message;
};

/**
 * Submits a new assignment or updates an existing one if the backend handles upserts.
 * @param {Object} payload - { applicantId, assignmentNumber, assignmentCode, status }
 */
export const submitAssignment = async (payload) => {
    try {
        const url = `${BASE_URL}/submit`;
        console.log('[AssignmentService] POST URL:', url);
        console.log('[AssignmentService] Payload:', JSON.stringify(payload, null, 2));
        const response = await apiClient.post(url, payload);
        console.log('[AssignmentService] Response status:', response.status);
        console.log('[AssignmentService] Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('[AssignmentService] Submit FAILED:');
        console.error('  - Error code:', error.code);
        console.error('  - Error message:', error.message);
        if (error.response) {
            console.error('  - Response status:', error.response.status);
            console.error('  - Response data:', error.response.data);
        } else {
            console.error('  - No response received (network/CORS issue)');
        }
        // Re-throw the original error so the caller can access error.response
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
        const url = `${BASE_URL}/fetch`;
        console.log(`[AssignmentService] GET ${url}?applicantId=${applicantId}&assignmentNumber=${assignmentNumber}`);
        const response = await apiClient.get(url, {
            params: { applicantId, assignmentNumber }
        });
        console.log('[AssignmentService] Fetch response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[AssignmentService] Fetch FAILED:', error.message);
        if (error.response) {
            console.error('  - Response status:', error.response.status);
        }
        // Return null on 404 (no saved code yet) instead of crashing
        if (error.response && error.response.status === 404) {
            return null;
        }
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
        const response = await apiClient.get(`${BASE_URL}/applicant/${applicantId}`);
        console.log('All Assignments Fetch Response:', response.data);
        return response.data;
    } catch (error) {
        const msg = getErrorMessage(error);
        console.error('API Error (fetchAll):', msg);
        throw new Error(msg);
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
        const response = await apiClient.put(`${BASE_URL}/update/${id}`, payload);
        console.log('API Response (update):', response.data);
        return response.data;
    } catch (error) {
        const msg = getErrorMessage(error);
        console.error('API Error (update):', msg);
        throw new Error(msg);
    }
};
