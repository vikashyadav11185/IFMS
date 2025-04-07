// hr-workflow.js
const API_BASE_URL = "http://localhost:9090/api";
let currentPage = 0;
const pageSize = 5;
let totalInterviews = 0;
let filteredInterviews = [];
let interviewerCache = {}; // Cache to store interviewer data

// DOM elements
const interviewsTableBody = document.getElementById("interviewsTableBody");
const entriesInfo = document.getElementById("entriesInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageBtn = document.getElementById("pageBtn");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const searchBtn = document.getElementById("searchBtn");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const logoutBtn = document.getElementById("logoutBtn");

document.addEventListener("DOMContentLoaded", () => {
  // Initial data load
  loadInterviewData();

  // Event listeners
  searchBtn.addEventListener("click", handleSearch);
  prevBtn.addEventListener("click", () => navigatePage(-1));
  nextBtn.addEventListener("click", () => navigatePage(1));
  sidebarToggle.addEventListener("click", toggleSidebar);
  setupLogoutHandler();
  preventBackNavigation();
  checkAuthStatus();

  // Load user info from localStorage if available
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("userName").textContent = username;
  }
});
// Pre-fetch all interviewers data for use in display

function checkAuthStatus() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "HR_MANAGER") {
    window.location.href = "index.html";
  }
}

async function fetchAllInterviewers() {
  try {
    const response = await fetch(`${API_BASE_URL}/interviewers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const interviewers = await response.json();

    // Convert array to object with id as key for faster lookup
    interviewers.forEach((interviewer) => {
      interviewerCache[interviewer.id] = interviewer;
    });

    return interviewerCache;
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    return {};
  }
}

// Fetch interview data from backend
async function loadInterviewData() {
  try {
    // First load all interviewers for reference
    await fetchAllInterviewers();

    const response = await fetch(`${API_BASE_URL}/interviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        redirectToLogin();
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const interviews = await response.json();
    filteredInterviews = [...interviews]; // Store all interviews for filtering
    totalInterviews = interviews.length;
    updatePagination();
    displayInterviews(currentPage);
  } catch (error) {
    console.error("Error loading interview data:", error);
    showNotification("Error loading data. Please try again.", "error");
  }
}

// Get interviewer name by ID
function getInterviewerName(interviewerId) {
  if (!interviewerId) return "N/A";

  const interviewer = interviewerCache[interviewerId];
  return interviewer ? interviewer.name || "Unknown" : "Unknown";
}

// Display interviews for the current page
function displayInterviews(page) {
  const start = page * pageSize;
  const end = Math.min(start + pageSize, filteredInterviews.length);
  const displayedInterviews = filteredInterviews.slice(start, end);

  interviewsTableBody.innerHTML = "";

  if (displayedInterviews.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="9" class="text-center">No interviews found</td>`;
    interviewsTableBody.appendChild(emptyRow);
  } else {
    displayedInterviews.forEach((interview) => {
      const row = createInterviewRow(interview);
      interviewsTableBody.appendChild(row);
    });
  }

  entriesInfo.textContent = `Showing ${start + 1} to ${end} of ${
    filteredInterviews.length
  } entries`;
  pageBtn.textContent = page + 1;
}

// Create a table row for an interview
function createInterviewRow(interview) {
  const row = document.createElement("tr");

  // Determine the L1/L2 status and interviewers
  const isL1 = interview.round === "L1";
  const l1Status = isL1 ? interview.status : "";
  const l1Interviewer = isL1 ? getInterviewerName(interview.interviewerId) : "";

  const isL2 = interview.round === "L2";
  const l2Status = isL2 ? interview.status : "";
  const l2Interviewer = isL2
    ? getInterviewerName(interview.interviewerId)
    : "N/A";

  // Create the initial row HTML
  row.innerHTML = `
        <td>${interview.candidateName || "N/A"}</td>
        <td>${interview.candidateEmail || "N/A"}</td>
        <td>${interview.candidateRole || "N/A"}</td>
        <td>${formatStatus(l1Status)}</td>
        <td>${l1Interviewer}</td>
        <td>${formatStatus(l2Status)}</td>
        <td>${l2Interviewer}</td>
        <td>${interview.feedbackDecision || "Pending"}</td>
        <td class="actions">
            <button class="btn btn-sm btn-info view-btn" data-id="${
              interview.id
            }">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-primary edit-btn" data-id="${
              interview.id
            }">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${
              interview.id
            }">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

  // Add event listeners to action buttons
  row
    .querySelector(".view-btn")
    .addEventListener("click", () => viewInterview(interview.id));
  row
    .querySelector(".edit-btn")
    .addEventListener("click", () => editInterview(interview.id));
  row
    .querySelector(".delete-btn")
    .addEventListener("click", () => deleteInterview(interview.id));

  return row;
}

// Fetch specific interviewer details if needed
async function fetchInterviewer(id) {
  // If already in cache, return it
  if (interviewerCache[id]) {
    return interviewerCache[id];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/interviewers/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error(`Error fetching interviewer: ${response.status}`);
    }

    const interviewer = await response.json();
    interviewerCache[id] = interviewer; // Store in cache
    return interviewer;
  } catch (error) {
    console.error(`Error fetching interviewer ${id}:`, error);
    return null;
  }
}

// View interview details
async function viewInterview(id) {
  try {
    const [interviewResponse, feedbackResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/interviews/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
      fetch(`${API_BASE_URL}/feedback/interview/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    ]);

    if (!interviewResponse.ok) {
      throw new Error(`Error fetching interview: ${interviewResponse.status}`);
    }

    const interview = await interviewResponse.json();
    let feedback = null;

    if (feedbackResponse.ok) {
      feedback = await feedbackResponse.json();
    }

    // Fetch interviewer details if not in cache
    if (interview.interviewerId && !interviewerCache[interview.interviewerId]) {
      await fetchInterviewer(interview.interviewerId);
    }

    // Display modal with interview and feedback details
    showInterviewDetailsModal(interview, feedback);
  } catch (error) {
    console.error("Error viewing interview:", error);
    showNotification("Error loading interview details", "error");
  }
}

// Show interview details modal
function showInterviewDetailsModal(interview, feedback) {
  // Get interviewer name
  const interviewerName = getInterviewerName(interview.interviewerId);

  // This function would create and display a modal with interview details
  // For now, we'll alert the information
  alert(`
        Interview Details:
        Candidate: ${interview.candidateName}
        Date: ${interview.date}
        Time: ${interview.time}
        Round: ${interview.round}
        Status: ${interview.status}
        Interviewer: ${interviewerName}
        
        ${
          feedback
            ? `Feedback: ${feedback.finalComments}\nDecision: ${feedback.decision}`
            : "No feedback available"
        }
    `);

  // In a real implementation, create a modal component with all details
}

// Edit interview
async function editInterview(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error(`Error fetching interview: ${response.status}`);
    }

    const interview = await response.json();
    // Redirect to edit page with interview ID
    window.location.href = `assign-interview.html?id=${id}`;
  } catch (error) {
    console.error("Error editing interview:", error);
    showNotification("Error loading interview for editing", "error");
  }
}

// Delete/cancel interview
async function deleteInterview(id) {
  if (!confirm("Are you sure you want to cancel this interview?")) {
    return;
  }

  try {
    // First check if there's any feedback for this interview
    const feedbackResponse = await fetch(
      `${API_BASE_URL}/feedback/interview/${id}`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );

    // If feedback exists, delete it first
    if (feedbackResponse.ok) {
      const feedback = await feedbackResponse.json();
      if (feedback && feedback.id) {
        const deleteFeedbackResponse = await fetch(
          `${API_BASE_URL}/feedback/${feedback.id}`,
          {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!deleteFeedbackResponse.ok) {
          throw new Error(
            `Error deleting associated feedback: ${deleteFeedbackResponse.status}`
          );
        }
      }
    }

    // Now cancel the interview
    const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error cancelling interview: ${response.status}`);
    }

    showNotification("Interview cancelled successfully", "success");
    loadInterviewData(); // Reload data
  } catch (error) {
    console.error("Error cancelling interview:", error);
    showNotification(`Error: ${error.message}`, "error");
  }
}

// Handle search and filtering
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;

  // Get all interviews from the backend again to ensure fresh data
  fetch(`${API_BASE_URL}/interviews`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((interviews) => {
      // Apply filters
      filteredInterviews = interviews.filter((interview) => {
        const matchesSearch =
          searchTerm === "" ||
          (interview.candidateName &&
            interview.candidateName.toLowerCase().includes(searchTerm)) ||
          (interview.candidateEmail &&
            interview.candidateEmail.toLowerCase().includes(searchTerm));

        let matchesStatus = true;
        if (statusValue) {
          // Map the status filter values to actual status combinations
          switch (statusValue) {
            case "l1-scheduled":
              matchesStatus =
                interview.round === "L1" && interview.status === "SCHEDULED";
              break;
            case "l1-completed":
              matchesStatus =
                interview.round === "L1" && interview.status === "COMPLETED";
              break;
            case "l2-scheduled":
              matchesStatus =
                interview.round === "L2" && interview.status === "SCHEDULED";
              break;
            case "l2-completed":
              matchesStatus =
                interview.round === "L2" && interview.status === "COMPLETED";
              break;
            case "hired":
              matchesStatus = interview.finalDecision === "HIRED";
              break;
            case "rejected":
              matchesStatus = interview.finalDecision === "REJECTED";
              break;
          }
        }

        return matchesSearch && matchesStatus;
      });

      // Reset to first page and update the display
      currentPage = 0;
      totalInterviews = filteredInterviews.length;
      updatePagination();
      displayInterviews(currentPage);
    })
    .catch((error) => {
      console.error("Error during search:", error);
      showNotification("Error searching interviews", "error");
    });
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredInterviews.length / pageSize);

  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage >= totalPages - 1 || totalPages === 0;

  pageBtn.textContent = totalPages > 0 ? currentPage + 1 : 1;
}

// Navigate between pages
function navigatePage(direction) {
  const newPage = currentPage + direction;
  const totalPages = Math.ceil(filteredInterviews.length / pageSize);

  if (newPage >= 0 && newPage < totalPages) {
    currentPage = newPage;
    displayInterviews(currentPage);
    updatePagination();
  }
}

// Format status for display
function formatStatus(status) {
  if (!status) return "N/A";

  const statusMap = {
    SCHEDULED: '<span class="badge bg-primary">Scheduled</span>',
    COMPLETED: '<span class="badge bg-success">Completed</span>',
    CANCELLED: '<span class="badge bg-danger">Cancelled</span>',
    PENDING_FEEDBACK: '<span class="badge bg-warning">Pending Feedback</span>',
  };

  return statusMap[status] || status;
}

// Toggle sidebar for mobile view
function toggleSidebar() {
  sidebar.classList.toggle("active");
}

// Get authentication token from local storage
function getToken() {
  return localStorage.getItem("token") || "";
}

// Redirect to login page
function redirectToLogin() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// Show notification
function showNotification(message, type = "info") {
  // In a real implementation, use a toast or notification component
  // For now, we'll just log to console and alert
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(message);
}

// Check if the user is authorized (has a valid token)
function checkAuth() {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    return false;
  }
  return true;
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function setupLogoutHandler() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
  });
}

function preventBackNavigation() {
  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", function () {
    window.history.pushState(null, "", window.location.href);
  });
}

// Export for module usage if needed
export { loadInterviewData, handleSearch, navigatePage, preventBackNavigation };
