// Import API services from api.js
import {
  InterviewService,
  InterviewerService,
  CandidateService,
} from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  fetchDashboardStats();
  fetchTodaysInterviews();
  fetchUpcomingInterviews();
  fetchUserDetails();
  preventBackNavigation();
  setupLogoutHandler();
});

document.getElementById("sidebarToggle").addEventListener("click", function () {
  document.getElementById("sidebar").classList.toggle("active");
});

async function fetchDashboardStats() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) throw new Error("User email not found");

    // Get interviewer details first
    const interviewer = await InterviewerService.getInterviewerByEmail(
      userEmail
    );
    if (!interviewer || !interviewer.id)
      throw new Error("Interviewer not found");

    // Get interviews specific to this interviewer
    const allInterviews = await InterviewService.getInterviewsByInterviewer(
      interviewer.id
    );

    // Filter interviews by status
    const assigned = allInterviews.filter(
      (interview) =>
        interview.status === "CANCELLED" ||
        interview.status === "SCHEDULED" ||
        interview.status === "COMPLETED" ||
        interview.status === "PENDING" ||
        interview.status === "NEW"
    );
    const completed = allInterviews.filter(
      (interview) =>
        interview.status === "COMPLETED" || interview.status === "CANCELLED"
    );
    const pending = allInterviews.filter(
      (interview) => interview.status === "PENDING_FEEDBACK"
    );

    // Get today's interviews count for this interviewer
    const todaysInterviews = allInterviews.filter((interview) => {
      const today = new Date()
        .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        .split(",")[0]
        .split("/")
        .map((part) => part.trim().padStart(2, "0"))
        .reverse()
        .join("-");
      return interview.date && interview.date.split("T")[0] === today;
    });

    // Update DOM elements
    document.getElementById("assignedInterviews").textContent =
      assigned.length || 0;
    document.getElementById("completedInterviews").textContent =
      completed.length || 0;
    document.getElementById("pendingInterviews").textContent =
      assigned.length - completed.length || 0;
    document.getElementById("todaysInterviewsCount").textContent =
      todaysInterviews.length || 0;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    displayErrorMessage("Failed to load dashboard statistics");
  }
}

async function fetchTodaysInterviews() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) throw new Error("User email not found");

    const interviewer = await InterviewerService.getInterviewerByEmail(
      userEmail
    );
    if (!interviewer || !interviewer.id)
      throw new Error("Interviewer not found");

    // Get all interviews for this interviewer
    const allInterviews = await InterviewService.getInterviewsByInterviewer(
      interviewer.id
    );

    // Filter for today's interviews
    const today = new Date()
      .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      .split(",")[0]
      .split("/")
      .map((part) => part.trim().padStart(2, "0"))
      .reverse()
      .join("-");
    const todaysInterviews = allInterviews.filter(
      (interview) => interview.date && interview.date.split("T")[0] === today
    );

    // Enhance interviews with candidate details
    const enhancedInterviews = await enhanceInterviewsWithCandidateDetails(
      todaysInterviews
    );

    populateTable("todaysInterviews", enhancedInterviews, true);
  } catch (error) {
    console.error("Error fetching today's interviews:", error);
    displayErrorMessage("Failed to load today's interviews");
  }
}

async function fetchUpcomingInterviews() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) throw new Error("User email not found");

    const interviewer = await InterviewerService.getInterviewerByEmail(
      userEmail
    );
    if (!interviewer || !interviewer.id)
      throw new Error("Interviewer not found");

    // Get all interviews for this interviewer
    const allInterviews = await InterviewService.getInterviewsByInterviewer(
      interviewer.id
    );

    // Filter for upcoming interviews (after today)
    const today = new Date()
      .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      .split(",")[0]
      .split("/")
      .map((part) => part.trim().padStart(2, "0"))
      .reverse()
      .join("-");
    const upcomingInterviews = allInterviews.filter(
      (interview) => new Date(interview.date) > new Date(today)
    );

    // Enhance interviews with candidate details
    const enhancedInterviews = await enhanceInterviewsWithCandidateDetails(
      upcomingInterviews
    );

    populateTable("upcomingInterviews", enhancedInterviews, false);
  } catch (error) {
    console.error("Error fetching upcoming interviews:", error);
    displayErrorMessage("Failed to load upcoming interviews");
  }
}

async function enhanceInterviewsWithCandidateDetails(interviews) {
  try {
    // Create an array of promises to fetch candidate details
    const candidatePromises = interviews.map(async (interview) => {
      if (!interview.candidateId) {
        return { ...interview };
      }

      try {
        const candidate = await CandidateService.getCandidateById(
          interview.candidateId
        );

        // Debug log to check the candidate structure
        console.log(
          "Candidate data for ID " + interview.candidateId + ":",
          candidate
        );

        // Find position field by checking various possible field names
        const positionField = determinePositionField(candidate);

        return {
          ...interview,
          candidateName: candidate.name || candidate.fullName || "N/A",
          position: positionField,
          status: candidate.status || "N/A",
        };
      } catch (error) {
        console.error(
          `Error fetching candidate ${interview.candidateId}:`,
          error
        );
        return { ...interview };
      }
    });

    // Wait for all candidate fetch operations to complete
    return await Promise.all(candidatePromises);
  } catch (error) {
    console.error("Error enhancing interviews with candidate details:", error);
    return interviews; // Return original interviews if enhancement fails
  }
}

// Helper function to determine which field contains the position information
function determinePositionField(candidate) {
  // Check for various possible field names that might contain position info
  if (candidate.roleApplied) return candidate.roleApplied;
  if (candidate.role_applied) return candidate.role_applied;
  if (candidate.position) return candidate.position;
  if (candidate.jobPosition) return candidate.jobPosition;
  if (candidate.job_position) return candidate.job_position;
  if (candidate.role) return candidate.role;
  if (candidate.appliedPosition) return candidate.appliedPosition;
  if (candidate.applied_position) return candidate.applied_position;

  // If none of the above fields exist, log the entire candidate object to help debugging
  console.warn("Could not determine position field for candidate:", candidate);

  return "N/A";
}

async function fetchUserDetails() {
  try {
    // Get the current user's email from localStorage or other auth storage
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      throw new Error("User email not found");
    }

    // Get interviewer details by email
    const interviewer = await InterviewerService.getInterviewerByEmail(
      userEmail
    );

    // Update DOM with user name
    document.getElementById("userName").textContent =
      interviewer.name || "Interviewer";
  } catch (error) {
    console.error("Error fetching user details:", error);
    document.getElementById("userName").textContent = "Interviewer";
  }
}

function populateTable(tableId, interviews, isToday) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";

  if (!interviews || interviews.length === 0) {
    const noDataRow = document.createElement("tr");
    noDataRow.innerHTML = `<td colspan="${
      isToday ? 5 : 5
    }" class="text-center">No interviews scheduled</td>`;
    tableBody.appendChild(noDataRow);
    return;
  }

  interviews.forEach((interview) => {
    const row = document.createElement("tr");

    if (isToday) {
      // For today's interviews
      row.innerHTML = `
        <td>${interview.candidateName || "N/A"}</td>
        <td>${interview.position || "N/A"}</td>
        <td>${interview.status || "N/A"}</td>
        <td>${formatTime(interview.time || interview.date)}</td>
        <td><a href="interviewer-feedback.html?interviewId=${
          interview.id
        }" class="btn btn-sm btn-primary">Give Feedback</a></td>
      `;
    } else {
      // For upcoming interviews - split date and time into separate columns
      // const { dateStr, timeStr } = formatTime(interview.time || interview.date);
      row.innerHTML = `
        <td>${interview.candidateName || "N/A"}</td>
        <td>${interview.position || "N/A"}</td>
        <td>${interview.status || "N/A"}</td>
        <td>${interview.date || "undefined"}</td>
        <td>${interview.time || "undefined"}</td>
      `;
    }

    tableBody.appendChild(row);
  });
}

function formatTime(dateTimeStr) {
  if (!dateTimeStr) return "N/A";

  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr; // Return original if invalid date

  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function splitDateTime(dateTimeStr) {
  if (!dateTimeStr) return { dateStr: "N/A", timeStr: "N/A" };

  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return { dateStr: "N/A", timeStr: "N/A" };

  const dateStr = date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return { dateStr, timeStr };
}

function setupLogoutHandler() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    // Clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    // Redirect to login page
    window.location.href = "index.html";
  });
}

function checkAuthStatus() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token || !role || role !== "INTERVIEWER") {
    window.location.href = "index.html";
  }
}

function preventBackNavigation() {
  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", function () {
    window.history.pushState(null, "", window.location.href);
  });
}

function displayErrorMessage(message) {
  // Create or update an error message element
  let errorEl = document.getElementById("error-message");
  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.id = "error-message";
    errorEl.className = "alert alert-danger alert-dismissible fade show mt-3";
    errorEl.innerHTML = `
      <span id="error-text">${message}</span>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector("main").prepend(errorEl);
  } else {
    document.getElementById("error-text").textContent = message;
    errorEl.style.display = "block";
  }

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorEl.style.display = "none";
  }, 5000);
}
