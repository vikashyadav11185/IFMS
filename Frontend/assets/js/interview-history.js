// Import API services from api.js
import {
  InterviewService,
  CandidateService,
  FeedbackService,
  InterviewerService,
} from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  // Initialize user information
  setupLogoutHandler();
  preventBackNavigation();
  checkAuthStatus();
  let currentUser = localStorage.getItem("userEmail") || "";
  // if (currentUser.name) {
  //   document.getElementById("userName").textContent = currentUser.name;
  // }

  // Setup sidebar toggle
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });

  // Initialize interview data variables
  let allInterviews = [];
  let candidatesCache = {};
  let currentPage = 1;
  let currentInterviewerId = null;
  const itemsPerPage = 5;

  // Main function to fetch interview data
  async function fetchInterviewData() {
    try {
      showLoader(true);

      // Check if currentUser has email
      if (!currentUser) {
        throw new Error("User email missing. Please log in again.");
      }

      // First, get the interviewer details by email
      const interviewer = await InterviewerService.getInterviewerByEmail(
        currentUser
      );

      if (!interviewer || !interviewer.id) {
        throw new Error(
          "Interviewer information not found. Please check your account."
        );
      }

      // Save the interviewer ID
      currentInterviewerId = interviewer.id;

      // Now use the interviewer ID to fetch relevant interviews
      const data = await InterviewService.getInterviewsByInterviewer(
        currentInterviewerId
      );
      allInterviews = data;
      await enrichInterviewsWithCandidateDetails();
      populateFilters();
      renderInterviewTable();
    } catch (error) {
      console.error("Error fetching interview data:", error);
      showError(`Failed to load interviews: ${error.message}`);
    } finally {
      showLoader(false);
    }
  }

  // Enrich interviews with candidate details
  async function enrichInterviewsWithCandidateDetails() {
    try {
      const candidatesToFetch = allInterviews
        .filter(
          (interview) =>
            interview.candidateId &&
            (!interview.rollApplied || interview.rollApplied === "N/A")
        )
        .map((interview) => interview.candidateId);

      const uniqueCandidateIds = [...new Set(candidatesToFetch)];

      await Promise.all(
        uniqueCandidateIds
          .filter((id) => !candidatesCache[id])
          .map(async (candidateId) => {
            try {
              candidatesCache[candidateId] =
                await CandidateService.getCandidateById(candidateId);
            } catch (error) {
              console.error(`Error fetching candidate ${candidateId}:`, error);
            }
          })
      );

      allInterviews = allInterviews.map((interview) => {
        if (interview.candidateId && candidatesCache[interview.candidateId]) {
          const candidate = candidatesCache[interview.candidateId];
          return {
            ...interview,
            candidateName: candidate.name || interview.candidateName,
            candidateEmail: candidate.email || interview.candidateEmail,
            rollApplied:
              candidate.roleApplied || interview.rollApplied || "N/A",
            candidate: {
              ...interview.candidate,
              name: candidate.name,
              email: candidate.email,
              roleApplied: candidate.roleApplied,
            },
          };
        }
        return interview;
      });
    } catch (error) {
      console.error("Error enriching interviews:", error);
    }
  }

  // Populate filter dropdowns
  function populateFilters() {
    const roles = new Set();
    allInterviews.forEach((interview) => {
      if (interview.rollApplied && interview.rollApplied !== "N/A") {
        roles.add(interview.rollApplied);
      } else if (interview.candidate?.roleApplied) {
        roles.add(interview.candidate.roleApplied);
      }
    });

    const roleFilter = document.getElementById("roleFilter");
    roleFilter.innerHTML = '<option value="all">All Roles</option>';
    roles.forEach((role) => {
      roleFilter.innerHTML += `<option value="${role}">${role}</option>`;
    });

    const statuses = new Set();
    allInterviews.forEach((interview) => {
      if (interview.status) statuses.add(interview.status);
    });

    const statusFilter = document.getElementById("statusFilter");
    statusFilter.innerHTML = '<option value="all">All Statuses</option>';
    statuses.forEach((status) => {
      statusFilter.innerHTML += `<option value="${status}">${formatStatus(
        status
      )}</option>`;
    });
  }

  // Render interview table
  function renderInterviewTable(filteredData = allInterviews) {
    const tableBody = document.getElementById("interviewHistoryBody");
    tableBody.innerHTML = "";

    if (!filteredData || filteredData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No interviews found</td>
        </tr>
      `;
      document.getElementById("pagination").innerHTML = "";
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    paginatedData.forEach((interview) => {
      const row = document.createElement("tr");
      const badgeClass = getBadgeClass(interview.status);

      row.innerHTML = `
        <td>${
          interview.candidate?.name || interview.candidateName || "N/A"
        }</td>
        <td>${
          interview.candidate?.email || interview.candidateEmail || "N/A"
        }</td>
        <td>${
          interview.candidate?.roleApplied || interview.rollApplied || "N/A"
        }</td>
        <td>${formatDate(interview.date || interview.interviewDate)}</td>
        <td>${interview.round || "N/A"}</td>
        <td><span class="badge ${badgeClass}">${formatStatus(
        interview.status
      )}</span></td>
        <td>
          <button class="btn btn-sm btn-primary view-feedback" data-id="${
            interview.id
          }" 
            ${
              ["SCHEDULED", "PENDING_FEEDBACK"].includes(interview.status)
                ? "disabled"
                : ""
            }>
            ${
              ["SCHEDULED", "PENDING_FEEDBACK"].includes(interview.status)
                ? "No Feedback"
                : "View Feedback"
            }
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    setupPagination(filteredData.length);
    setupFeedbackButtonListeners();
  }

  // Helper function for badge classes
  function getBadgeClass(status) {
    const statusClasses = {
      COMPLETED: "bg-success",
      REJECTED: "bg-danger",
      SCHEDULED: "bg-warning",
      PENDING_FEEDBACK: "bg-info",
      CANCELLED: "bg-secondary",
    };
    return statusClasses[status] || "bg-primary";
  }

  // Setup feedback button listeners
  function setupFeedbackButtonListeners() {
    document
      .querySelectorAll(".view-feedback:not([disabled])")
      .forEach((btn) => {
        btn.addEventListener("click", function () {
          const interviewId = parseInt(this.getAttribute("data-id"));
          fetchFeedbackData(interviewId);
        });
      });
  }

  // Fetch feedback data
  async function fetchFeedbackData(interviewId) {
    try {
      showLoader(true);
      const feedback = await FeedbackService.getFeedbackByInterviewId(
        interviewId
      );
      const interview = allInterviews.find((i) => i.id === interviewId);
      showFeedbackModal(interview, feedback);
    } catch (error) {
      if (error.message.includes("404")) {
        const interview = allInterviews.find((i) => i.id === interviewId);
        showFeedbackModal(interview, null);
      } else {
        console.error("Error fetching feedback:", error);
        showError(`Failed to load feedback: ${error.message}`);
      }
    } finally {
      showLoader(false);
    }
  }

  // Show feedback modal
  function showFeedbackModal(interview, feedback) {
    const modalBody = document.getElementById("feedbackModalBody");

    if (!feedback) {
      modalBody.innerHTML = "<p>No feedback available for this interview.</p>";
    } else {
      const skillsHtml = renderSkillsEvaluation(feedback);
      const candidateInfo = getCandidateInfo(interview);
      const decisionInfo = getDecisionInfo(feedback);

      modalBody.innerHTML = `
        <div class="candidate-info mb-3">
          ${candidateInfo}
        </div>
        <h4 class="mb-2">Skill Evaluation</h4>
        <div class="table-responsive mb-3">
          <table class="table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Rating</th>
                <th>Topics</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              ${
                skillsHtml ||
                '<tr><td colspan="4" class="text-center">No skill evaluations available</td></tr>'
              }
            </tbody>
          </table>
        </div>
        <div class="card mb-3">
          <div class="card-header">
            <h4 class="card-title">Final Comments</h4>
          </div>
          <div class="card-body">
            <p>${
              feedback.comments ||
              feedback.finalComments ||
              "No comments available"
            }</p>
          </div>
        </div>
        <div class="card">
          <div class="card-header ${decisionInfo.class} text-white">
            <h4 class="card-title">Decision</h4>
          </div>
          <div class="card-body">
            <p class="mb-0">${decisionInfo.text}</p>
          </div>
        </div>
      `;
    }

    const feedbackModal = document.getElementById("feedbackModal");
    feedbackModal.style.display = "block";
    feedbackModal.classList.add("active");
  }

  // Helper to render skills evaluation
  function renderSkillsEvaluation(feedback) {
    const evaluations = feedback.skillEvaluations || feedback.skills || [];
    return evaluations
      .map(
        (evalu) => `
      <tr>
        <td>${evalu.skillName || evalu.skill || "N/A"}</td>
        <td>${evalu.rating || "N/A"}</td>
        <td>${evalu.topics || "N/A"}</td>
        <td>${evalu.comments || "N/A"}</td>
      </tr>
    `
      )
      .join("");
  }

  // Helper to get candidate info
  function getCandidateInfo(interview) {
    return `
      <div class="d-flex flex-wrap gap-3">
        <div class="form-group">
          <label class="form-label">Candidate:</label>
          <p class="mb-1"><strong>${
            interview.candidate?.name || interview.candidateName || "N/A"
          }</strong></p>
        </div>
        <div class="form-group">
          <label class="form-label">Email:</label>
          <p class="mb-1"><strong>${
            interview.candidate?.email || interview.candidateEmail || "N/A"
          }</strong></p>
        </div>
        <div class="form-group">
          <label class="form-label">Role:</label>
          <p class="mb-1"><strong>${
            interview.candidate?.roleApplied || interview.rollApplied || "N/A"
          }</strong></p>
        </div>
        <div class="form-group">
          <label class="form-label">Interview Date:</label>
          <p class="mb-1"><strong>${formatDate(
            interview.date || interview.interviewDate
          )}</strong></p>
        </div>
        <div class="form-group">
          <label class="form-label">Round:</label>
          <p class="mb-1"><strong>${interview.round || "N/A"}</strong></p>
        </div>
      </div>
    `;
  }

  // Helper to get decision info
  function getDecisionInfo(feedback) {
    const decision = feedback.decision || "N/A";
    const isPositive = ["PASS", "passed"].includes(decision.toUpperCase());
    return {
      class: isPositive ? "bg-success" : "bg-danger",
      text: feedback.recommendationNotes || decision,
    };
  }

  // Setup pagination
  function setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    pagination.innerHTML += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" aria-label="Previous" id="prevPage">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pagination.innerHTML += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <a class="page-link page-number" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    pagination.innerHTML += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="#" aria-label="Next" id="nextPage">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;

    document.getElementById("prevPage")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderInterviewTable(getFilteredInterviews());
      }
    });

    document.getElementById("nextPage")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderInterviewTable(getFilteredInterviews());
      }
    });

    document.querySelectorAll(".page-number").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = parseInt(e.target.getAttribute("data-page"));
        renderInterviewTable(getFilteredInterviews());
      });
    });
  }

  // Apply filters to interviews
  function getFilteredInterviews() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const status = document.getElementById("statusFilter").value;
    const role = document.getElementById("roleFilter").value;

    return allInterviews.filter((interview) => {
      // Search filter
      if (searchTerm) {
        const nameMatch = (
          interview.candidate?.name ||
          interview.candidateName ||
          ""
        )
          .toLowerCase()
          .includes(searchTerm);
        const emailMatch = (
          interview.candidate?.email ||
          interview.candidateEmail ||
          ""
        )
          .toLowerCase()
          .includes(searchTerm);
        if (!nameMatch && !emailMatch) return false;
      }

      // Date filters
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        const interviewDate = new Date(
          interview.date || interview.interviewDate
        );
        if (interviewDate < fromDate) return false;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        const interviewDate = new Date(
          interview.date || interview.interviewDate
        );
        if (interviewDate > toDate) return false;
      }

      // Status filter
      if (status !== "all") {
        if (
          !interview.status ||
          interview.status.toUpperCase() !== status.toUpperCase()
        ) {
          return false;
        }
      }

      // Role filter
      if (role !== "all") {
        const interviewRole =
          interview.rollApplied || interview.candidate?.roleApplied || "";
        if (interviewRole.toLowerCase() !== role.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }

  // Apply filters and update display
  function applyFilters() {
    currentPage = 1;
    renderInterviewTable(getFilteredInterviews());
  }

  // Show error message
  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger alert-dismissible fade show";
    errorDiv.innerHTML = `
      <strong>Error!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector(".container").prepend(errorDiv);
  }

  // Show loader
  function showLoader(show) {
    const loader = document.getElementById("loader") || createLoader();
    loader.style.display = show ? "block" : "none";
  }

  function createLoader() {
    const loader = document.createElement("div");
    loader.id = "loader";
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: none;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    const spinner = document.createElement("div");
    spinner.style.cssText = `
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(styleSheet);
    loader.appendChild(spinner);
    document.body.appendChild(loader);
    return loader;
  }

  // Helper functions
  function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  }

  function formatStatus(status) {
    if (!status) return "N/A";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Event listeners
  document.getElementById("searchBtn").addEventListener("click", applyFilters);
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", applyFilters);
  document
    .getElementById("resetFiltersBtn")
    .addEventListener("click", function () {
      document.getElementById("searchFiltersForm").reset();
      applyFilters();
    });

  // Close modal
  document
    .querySelectorAll(".modal .close, .modal .close-btn")
    .forEach((el) => {
      el.addEventListener("click", function () {
        const modal = document.getElementById("feedbackModal");
        modal.style.display = "none";
        modal.classList.remove("active");
      });
    });

  // Initial data load
  fetchInterviewData();
});

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

function checkAuthStatus() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "INTERVIEWER") {
    window.location.href = "index.html";
  }
}
