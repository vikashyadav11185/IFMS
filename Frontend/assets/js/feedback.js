// Import API services from api.js
import {
  FeedbackService,
  CandidateService,
  InterviewService,
  InterviewerService,
} from "./api.js";

// Configuration
const DEFAULT_SKILLS = [
  { name: "Basic Algorithm" },
  { name: "Code and Syntax" },
  { name: "Design Patterns" },
  { name: "SQL" },
  { name: "Git" },
  { name: "Communication" },
  { name: "Overall Attitude" },
  { name: "Learning Ability" },
  { name: "Resume Explanation" },
];

// DOM Elements
const evaluationTbody = document.getElementById("evaluation-tbody");
const candidateInfoForm = document.getElementById("candidate-info-form");
const saveDraftBtn = document.getElementById("save-draft");
const submitFeedbackBtn = document.getElementById("submit-feedback");
const interviewSelect = document.getElementById("interview-select");
const refreshInterviewsBtn = document.getElementById("refresh-interviews");

// Global variables
let currentInterviewerId = null;
let currentInterviewerName = "Interviewer";

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  loadCurrentUser().then(() => {
    loadTodaysInterviews();
    renderSkills(DEFAULT_SKILLS);
    setupEventListeners();
    checkForDraft();
  });
  setupLogoutHandler();
  preventBackNavigation();
  checkAuthStatus();

  document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });
});

// Load current interviewer details
async function loadCurrentUser() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      console.warn("No user email found in localStorage");
      showAlert("error", "Please log in to access this page.");
      return;
    }

    const interviewer = await InterviewerService.getInterviewerByEmail(
      userEmail
    );
    if (interviewer) {
      currentInterviewerId = interviewer.id;
      currentInterviewerName = interviewer.name || "Interviewer";
      document.getElementById("userName").textContent = currentInterviewerName;
    } else {
      showAlert(
        "error",
        "Interviewer profile not found. Please contact admin."
      );
    }
  } catch (error) {
    console.error("Error loading interviewer:", error);
    showAlert("error", "Failed to load interviewer profile. Please refresh.");
  }
}

// Update decision options based on interview round
function updateDecisionOptions(round) {
  const decisionSelect = document.getElementById("decision");
  decisionSelect.innerHTML = '<option value="">Select Decision</option>';

  if (round === "L2") {
    decisionSelect.innerHTML += `
      <option value="L2_PASSED">L2 Passed</option>
      <option value="L2_REJECTED">L2 Rejected</option>
    `;
  } else {
    // Default to L1 options
    decisionSelect.innerHTML += `
      <option value="L1_PASSED">L1 Passed (No more evaluation needed)</option>
      <option value="L1_PASSED_WITH_COMMENT">L1 Passed with Comment (Needs further evaluation)</option>
      <option value="L1_REJECTED">L1 Rejected</option>
    `;
  }
}

// Load interviews for the current interviewer
async function loadTodaysInterviews() {
  try {
    showLoader(true);

    if (!currentInterviewerId) {
      console.warn("No interviewer ID available");
      showAlert(
        "error",
        "Unable to identify interviewer. Please refresh the page."
      );
      return;
    }

    const today = getCurrentDateString();
    let interviews = [];

    // Try to get interviews filtered by interviewer first
    try {
      interviews = await InterviewService.getInterviewsByDateAndInterviewer(
        today,
        currentInterviewerId
      );
    } catch (e) {
      console.log("Falling back to client-side filtering");
      const allInterviews = await InterviewService.getInterviewsByDate(today);
      interviews = allInterviews.filter(
        (i) => i.interviewerId === currentInterviewerId
      );
    }

    // If no interviews found, try upcoming interviews as fallback
    if (interviews.length === 0) {
      const allInterviews = await InterviewService.getUpcomingInterviews();
      interviews = allInterviews.filter(
        (i) =>
          i.interviewerId === currentInterviewerId &&
          getInterviewDateString(i) === today
      );
    }

    populateInterviewSelect(interviews);
  } catch (error) {
    console.error("Error loading interviews:", error);
    showAlert(
      "error",
      "We couldn't load today's interviews. Please try refreshing."
    );
  } finally {
    showLoader(false);
  }
}

// Render evaluation skills table
function renderSkills(skills) {
  evaluationTbody.innerHTML = "";
  skills.forEach((skill, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${skill.name}</td>
      <td>
        <select class="form-control" data-field="rating">
          <option value="">Select Rating</option>
          <option value="AVERAGE">Average</option>
          <option value="GOOD">Good</option>
          <option value="NOT_EVALUATED">Not Evaluated</option>
          <option value="POOR">Poor</option>
          <option value="VERY_GOOD">Very Good</option>
        </select>
      </td>
      <td>
        <input type="text" class="form-control" data-field="topics" 
          placeholder="Topics used for evaluation">
      </td>
      <td>
        <textarea class="form-control" data-field="comments" 
          placeholder="Add specific comments"></textarea>
      </td>
    `;
    evaluationTbody.appendChild(row);
  });
}

// Filter interviews to today's date
function filterTodaysInterviews(interviews) {
  if (!interviews) return [];
  const today = getCurrentDateString();
  return interviews.filter((interview) => {
    const interviewDate = getInterviewDateString(interview);
    return interviewDate === today;
  });
}

// Get formatted date string from interview object
function getInterviewDateString(interview) {
  const date = new Date(
    interview.time || interview.interviewDate || interview.date
  );
  return formatDateForApi(date);
}

// Get current date as formatted string
function getCurrentDateString() {
  return formatDateForApi(new Date());
}

// Format date for API (YYYY-MM-DD)
function formatDateForApi(date) {
  if (isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split("T")[0];
}

// Populate interview dropdown
async function populateInterviewSelect(interviews) {
  interviewSelect.innerHTML = '<option value="">Select Interview</option>';

  if (!interviews || interviews.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No interviews scheduled for today";
    option.disabled = true;
    interviewSelect.appendChild(option);
    showAlert("info", "You don't have any interviews scheduled for today.");
    return;
  }

  try {
    const interviewOptions = await Promise.all(
      interviews.map(async (interview) => {
        const option = document.createElement("option");
        option.value = interview.id;
        let candidateRole = "Unknown Role";

        if (interview.candidateId) {
          try {
            const candidate = await CandidateService.getCandidateById(
              interview.candidateId
            );
            candidateRole =
              candidate.role_applied ||
              candidate.roleApplied ||
              interview.position ||
              "Unknown Role";
          } catch (error) {
            console.error("Error fetching candidate details:", error);
            candidateRole = interview.position || "Unknown Role";
          }
        } else {
          candidateRole = interview.position || "Unknown Role";
        }

        option.textContent = `${interview.candidateName} - ${candidateRole} (${interview.date} at ${interview.time})`;
        option.dataset.candidateId = interview.candidateId;
        option.dataset.interviewDate =
          interview.interviewDate || interview.date;
        option.dataset.position = candidateRole;
        option.dataset.round = interview.round || "L1";

        return option;
      })
    );

    interviewOptions.forEach((option) => interviewSelect.appendChild(option));
  } catch (error) {
    console.error("Error processing interviews:", error);
    showAlert(
      "error",
      "There was a problem loading interview details. Please try again."
    );
  }
}

// Load details for selected interview
async function loadInterviewDetails(interviewId) {
  try {
    showLoader(true);
    const interview = await InterviewService.getInterviewById(interviewId);
    const selectedOption = document.querySelector(
      `#interview-select option[value="${interviewId}"]`
    );

    document.getElementById("candidate-name").value =
      interview.candidateName || "";
    document.getElementById("candidate-email").value =
      interview.candidateEmail || "";

    const round = selectedOption?.dataset.round || interview.round || "L1";
    document.getElementById("interview-round").value = round;
    updateDecisionOptions(round);

    const interviewDate =
      interview.interviewDate ||
      interview.date ||
      (selectedOption ? selectedOption.dataset.interviewDate : null);

    if (interviewDate) {
      document.getElementById("interview-date").value =
        formatDateForInput(interviewDate);
    }

    let role = "";
    if (interview.candidateId) {
      try {
        const candidate = await CandidateService.getCandidateById(
          interview.candidateId
        );
        role = candidate.role_applied || candidate.roleApplied || "";
      } catch (error) {
        console.error("Error loading candidate:", error);
      }
    }
    if (!role && interview.position) {
      role = interview.position;
    }
    if (!role && selectedOption?.dataset.position) {
      role = selectedOption.dataset.position;
    }

    document.getElementById("candidate-role").value = role || "Not specified";
    showLoader(false);
  } catch (error) {
    console.error("Error loading interview details:", error);
    showAlert(
      "error",
      "Failed to load interview details. Please try selecting again."
    );
    showLoader(false);
  }
}

// Set up event listeners
function setupEventListeners() {
  saveDraftBtn.addEventListener("click", saveAsDraft);
  submitFeedbackBtn.addEventListener("click", submitFeedback);
  refreshInterviewsBtn?.addEventListener("click", loadTodaysInterviews);

  interviewSelect.addEventListener("change", function () {
    if (this.value) {
      loadInterviewDetails(this.value);
    } else {
      resetForm();
    }
  });
}

// Check for saved draft in localStorage
function checkForDraft() {
  const draft = localStorage.getItem("feedbackDraft");
  if (draft) {
    if (confirm("You have a saved draft. Would you like to load it?")) {
      loadDraft(JSON.parse(draft));
    }
  }
}

// Load draft data into form
function loadDraft(draft) {
  document.getElementById("candidate-name").value = draft.candidateName || "";
  document.getElementById("candidate-email").value = draft.candidateEmail || "";
  document.getElementById("interview-date").value = draft.interviewDate || "";
  document.getElementById("interview-round").value =
    draft.interviewRound || "L1";
  document.getElementById("candidate-role").value = draft.candidateRole || "";

  if (draft.interviewId) {
    const selectOption = document.querySelector(
      `#interview-select option[value="${draft.interviewId}"]`
    );
    if (selectOption) {
      document.getElementById("interview-select").value = draft.interviewId;
    }
  }

  updateDecisionOptions(draft.interviewRound || "L1");
  document.getElementById("decision").value = draft.decision || "";
  document.getElementById("final-comments").value = draft.finalComments || "";

  if (draft.skillEvaluations) {
    const rows = document.querySelectorAll("#evaluation-tbody tr");
    draft.skillEvaluations.forEach((evalu, index) => {
      if (index < rows.length) {
        const row = rows[index];
        row.querySelector('select[data-field="rating"]').value =
          evalu.rating || "";
        row.querySelector('input[data-field="topics"]').value =
          evalu.topics || "";
        row.querySelector('textarea[data-field="comments"]').value =
          evalu.comments || "";
      }
    });
  }
}

// Save form data as draft
function saveAsDraft() {
  try {
    const formData = collectFormData();
    localStorage.setItem("feedbackDraft", JSON.stringify(formData));
    showAlert("success", "Draft saved successfully! You can continue later.");
  } catch (error) {
    showAlert("error", error.message);
  }
}

// Collect all form data
function collectFormData() {
  const skillEvaluations = [];

  document.querySelectorAll("#evaluation-tbody tr").forEach((row) => {
    const rating = row.querySelector('select[data-field="rating"]').value;
    const topics = row.querySelector('input[data-field="topics"]').value;
    const comments = row.querySelector('textarea[data-field="comments"]').value;
    const skill = row.querySelector("td:nth-child(2)").textContent;

    if (rating && rating !== "NOT_EVALUATED") {
      skillEvaluations.push({
        skill: skill,
        rating: rating,
        topics: topics || "",
        comments: comments || "",
      });
    }
  });

  if (skillEvaluations.length === 0) {
    throw new Error("Please evaluate at least one skill before saving.");
  }

  return {
    interviewId: document.getElementById("interview-select").value,
    interviewerId: currentInterviewerId,
    interviewerName: currentInterviewerName,
    candidateName: document.getElementById("candidate-name").value,
    candidateEmail: document.getElementById("candidate-email").value,
    candidateRole: document.getElementById("candidate-role").value,
    interviewDate: document.getElementById("interview-date").value,
    interviewRound: document.getElementById("interview-round").value,
    decision: document.getElementById("decision").value,
    finalComments: document.getElementById("final-comments").value,
    skillEvaluations: skillEvaluations,
  };
}

// Validate form before submission
function validateForm() {
  if (!document.getElementById("interview-select").value) {
    showAlert("error", "Please select an interview from the list.");
    document.getElementById("interview-select").focus();
    return false;
  }

  if (!document.getElementById("decision").value) {
    showAlert("error", "Please select a decision for this candidate.");
    document.getElementById("decision").focus();
    return false;
  }

  if (!document.getElementById("final-comments").value.trim()) {
    showAlert(
      "error",
      "Please provide your final comments about the candidate."
    );
    document.getElementById("final-comments").focus();
    return false;
  }

  let evaluatedSkillsCount = 0;
  document.querySelectorAll('select[data-field="rating"]').forEach((select) => {
    if (select.value && select.value !== "NOT_EVALUATED") {
      evaluatedSkillsCount++;
    }
  });

  if (evaluatedSkillsCount === 0) {
    showAlert("error", "Please evaluate at least one skill before submitting.");
    document.getElementById("evaluation-tbody").scrollIntoView({
      behavior: "smooth",
    });
    return false;
  }

  return true;
}

// Submit feedback to server
async function submitFeedback() {
  if (!validateForm()) {
    return;
  }

  try {
    showLoader(true);
    const formData = collectFormData();

    if (!currentInterviewerId) {
      throw new Error(
        "Unable to identify interviewer. Please refresh the page."
      );
    }

    const response = await FeedbackService.submitFeedback(formData);

    if (response) {
      localStorage.removeItem("feedbackDraft");
      showAlert(
        "success",
        "Feedback submitted successfully! Thank you for your evaluation."
      );
      resetForm();
    } else {
      throw new Error("Failed to submit feedback");
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    showAlert(
      "error",
      error.message ||
        "We couldn't submit your feedback. Please check your connection and try again."
    );
  } finally {
    showLoader(false);
  }
}

// Show alert message
function showAlert(type, message) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "20px";
  alertDiv.style.right = "20px";
  alertDiv.style.zIndex = "1100";
  alertDiv.style.minWidth = "300px";
  alertDiv.style.maxWidth = "500px";

  let icon = "";
  switch (type) {
    case "success":
      icon = '<i class="fas fa-check-circle me-2"></i>';
      break;
    case "error":
      icon = '<i class="fas fa-exclamation-circle me-2"></i>';
      break;
    case "warning":
      icon = '<i class="fas fa-exclamation-triangle me-2"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle me-2"></i>';
  }

  alertDiv.innerHTML = `
    ${icon}
    <strong>${
      type === "error" ? "Error" : type === "success" ? "Success" : "Notice"
    }</strong>
    <span class="ms-2">${message}</span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 150);
  }, 5000);
}

// Show/hide loader
function showLoader(show) {
  const loader = document.getElementById("loader") || createLoader();
  loader.style.display = show ? "block" : "none";
}

// Create loader element
function createLoader() {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.style.position = "fixed";
  loader.style.top = "0";
  loader.style.left = "0";
  loader.style.width = "100%";
  loader.style.height = "100%";
  loader.style.backgroundColor = "rgba(0,0,0,0.5)";
  loader.style.display = "none";
  loader.style.zIndex = "1000";
  loader.style.display = "flex";
  loader.style.justifyContent = "center";
  loader.style.alignItems = "center";

  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.border = "5px solid #f3f3f3";
  spinner.style.borderTop = "5px solid #3498db";
  spinner.style.borderRadius = "50%";
  spinner.style.width = "50px";
  spinner.style.height = "50px";
  spinner.style.animation = "spin 1s linear infinite";

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
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

// Reset form to initial state
function resetForm() {
  document.getElementById("candidate-info-form").reset();
  document.getElementById("interview-select").value = "";
  document.getElementById("decision").value = "";
  document.getElementById("final-comments").value = "";

  document.querySelectorAll("#evaluation-tbody select").forEach((select) => {
    select.value = "";
  });

  document.querySelectorAll("#evaluation-tbody input").forEach((input) => {
    input.value = "";
  });

  document
    .querySelectorAll("#evaluation-tbody textarea")
    .forEach((textarea) => {
      textarea.value = "";
    });

  // Reset decision options to default (L1)
  updateDecisionOptions("L1");
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "";
    }
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
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

function checkAuthStatus() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "INTERVIEWER") {
    window.location.href = "index.html";
  }
}
