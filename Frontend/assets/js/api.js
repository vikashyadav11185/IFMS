// api.js - Core API service for IFMS application

const API_BASE_URL = "http://localhost:9090/api";

/**
 * Generic API request handler with error handling
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const headers = {
      "Content-Type": "application/json",
      // Add authorization if you have authentication in place
      // 'Authorization': `Bearer ${getToken()}`
    };

    const config = {
      method,
      headers,
      credentials: "include", // For handling cookies if using session-based auth
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle common HTTP errors
    if (!response.ok) {
      // Try to get a detailed error message from the server
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          `Error: ${response.status} ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error: ${response.status} ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    // If response is 204 No Content or doesn't have a body
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Interview API service
 */
const InterviewService = {
  // Get all interviews
  getAllInterviews: () => apiRequest("/interviews"),

  // Get a specific interview by ID
  getInterviewById: (id) => apiRequest(`/interviews/${id}`),

  // Get interviews for a specific interviewer
  getInterviewsByInterviewer: (interviewerId) =>
    apiRequest(`/interviews/interviewer/${interviewerId}`),

  // Get interviews for a specific candidate
  getInterviewsByCandidate: (candidateId) =>
    apiRequest(`/interviews/candidate/${candidateId}`),

  // Get interviews by date
  getInterviewsByDate: (date) => apiRequest(`/interviews/date/${date}`),

  // Get interviews by status
  getInterviewsByStatus: (status) => apiRequest(`/interviews/status/${status}`),

  // Get today's interviews
  getTodayInterviews: () => apiRequest("/interviews/today"),

  // Get upcoming interviews
  getUpcomingInterviews: () => apiRequest("/interviews/upcoming"),

  // Schedule a new interview
  scheduleInterview: (interviewData) =>
    apiRequest("/interviews", "POST", interviewData),

  // Update an existing interview
  updateInterview: (id, interviewData) =>
    apiRequest(`/interviews/${id}`, "PUT", interviewData),

  // Cancel an interview
  cancelInterview: (id) => apiRequest(`/interviews/${id}`, "DELETE"),
};

/**
 * Candidate API service
 */
const CandidateService = {
  // Get all candidates
  getAllCandidates: () => apiRequest("/candidates"),

  // Get a specific candidate by ID
  getCandidateById: (id) => apiRequest(`/candidates/${id}`),

  // Get candidates by status
  getCandidatesByStatus: (status) => apiRequest(`/candidates/status/${status}`),

  // Create a new candidate
  createCandidate: (candidateData) =>
    apiRequest("/candidates", "POST", candidateData),

  // Update an existing candidate
  updateCandidate: (id, candidateData) =>
    apiRequest(`/candidates/${id}`, "PUT", candidateData),

  // Delete a candidate
  deleteCandidate: (id) => apiRequest(`/candidates/${id}`, "DELETE"),
};

/**
 * Interviewer API service
 */
const InterviewerService = {
  // Get all interviewers
  getAllInterviewers: () => apiRequest("/interviewers"),

  // Get a specific interviewer by ID
  getInterviewerById: (id) => apiRequest(`/interviewers/${id}`),

  // Get an interviewer by email
  getInterviewerByEmail: (email) => apiRequest(`/interviewers/email/${email}`),

  // Get interviewers by department
  getInterviewersByDepartment: (department) =>
    apiRequest(`/interviewers/department/${department}`),
};

/**
 * Feedback API service
 */
const FeedbackService = {
  // Get all feedback
  getAllFeedback: () => apiRequest("/feedback"),

  // Get a specific feedback by ID
  getFeedbackById: (id) => apiRequest(`/feedback/${id}`),

  // Get feedback for a specific interview
  getFeedbackByInterviewId: (interviewId) =>
    apiRequest(`/feedback/interview/${interviewId}`),

  // Submit new feedback
  submitFeedback: (feedbackData) =>
    apiRequest("/feedback", "POST", feedbackData),

  // Update existing feedback
  updateFeedback: (id, feedbackData) =>
    apiRequest(`/feedback/${id}`, "PUT", feedbackData),

  // Delete feedback
  deleteFeedback: (id) => apiRequest(`/feedback/${id}`, "DELETE"),
};

// Export all services
export {
  InterviewService,
  CandidateService,
  InterviewerService,
  FeedbackService,
};
