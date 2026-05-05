

import apiClient from "../../../services/apiClient";

const ProgressAPIService = {
  // Save/update topic + course progress
  saveProgress: async (progressData) => {
    try {
      const response = await apiClient.post('/api/progress', progressData);
      return response.data;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  },

  // Get all courses for user
  getApplicantProgress: async (applicantId) => {
    try {
      const response = await apiClient.get(`/api/progress/applicant/${applicantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applicant progress:', error);
      throw error;
    }
  },

  // Get topics for a course
  getCourseTopics: async (courseProgressId) => {
    try {
      const response = await apiClient.get(`/api/progress/topics/${courseProgressId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course topics:', error);
      throw error;
    }
  },

  // Reset course progress to zero
  resetCourseProgress: async (applicantId, courseId) => {
    try {
      const response = await apiClient.delete(`/api/progress/reset/${applicantId}/${courseId}`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist (404), return success for frontend reset
      if (error.response && error.response.status === 404) {
        console.log('Backend reset endpoint not found, frontend reset will handle it');
        return { message: 'Frontend reset only' };
      }
      console.error('Error resetting course progress:', error);
      throw error;
    }
  }
};

export default ProgressAPIService;
