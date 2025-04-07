import {
  InterviewService,
  CandidateService,
  InterviewerService,
  FeedbackService,
} from "./api.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Get current user information from local storage or fetch from API
  let currentUser;

  setupLogoutHandler();
  preventBackNavigation();
  checkAuthStatus();

  try {
    // Try to get user from localStorage first (for demo/development)
    const storedUser = localStorage.getItem("currentInterviewer");
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    } else {
      // If not available in localStorage, attempt to get from API
      // This assumes you have a current user endpoint or session management
      // You might need to adjust this based on your auth implementation
      const userEmail =
        sessionStorage.getItem("userEmail") ||
        localStorage.getItem("userEmail");
      if (userEmail) {
        currentUser = await InterviewerService.getInterviewerByEmail(userEmail);
        localStorage.setItem("currentInterviewer", JSON.stringify(currentUser));
      } else {
        // Fallback for development
        currentUser = { id: 1, name: "Default Interviewer" };
      }
    }

    // Update UI with user information
    document.getElementById("userName").textContent = currentUser.name;
  } catch (error) {
    console.error("Error fetching user information:", error);
    // Fallback to default name
    document.getElementById("userName").textContent = "Interviewer";
  }

  // Set up sidebar toggle
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });

  // Set up logout button
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("currentInterviewer");
    sessionStorage.removeItem("userEmail");
    localStorage.removeItem("userEmail");
    // You may also want to call an API logout endpoint here
    window.location.href = "index.html";
  });

  // Initialize calendar with API data
  await initializeCalendar(currentUser?.id);
});

async function initializeCalendar(interviewerId) {
  const calendarEl = document.getElementById("calendar");

  try {
    // Fetch interviews for the current interviewer from API
    let interviews = [];

    if (interviewerId) {
      interviews = await InterviewService.getInterviewsByInterviewer(
        interviewerId
      );
    } else {
      // Fallback to all interviews if interviewer ID is not available
      interviews = await InterviewService.getAllInterviews();
    }

    // Check if interviews data is valid
    if (!Array.isArray(interviews)) {
      console.error("Expected array of interviews but got:", interviews);
      interviews = [];
    }

    // Format events for FullCalendar
    const events = await Promise.all(
      interviews.map(async (interview) => {
        try {
          // Fetch additional data needed for the event
          const candidate = await CandidateService.getCandidateById(
            interview.candidateId
          );

          // Validate date and time format
          if (!interview.date || !interview.time) {
            console.error("Invalid interview data:", interview);
            return null;
          }

          const startDateTime = `${interview.date}T${interview.time}`;
          const endTime = calculateEndTime(
            interview.time,
            interview.duration || 60
          );

          return {
            id: interview.id,
            title: candidate
              ? `${candidate.name} - ${candidate.roleApplied}`
              : `Interview #${interview.id}`,
            start: startDateTime,
            end: `${interview.date}T${endTime}`,
            extendedProps: {
              interview: interview,
              candidate: candidate || { name: "Unknown", role: "Unknown" },
              status: interview.status || "SCHEDULED",
            },
            backgroundColor: getEventColor(interview.status || "SCHEDULED"),
            borderColor: getEventColor(interview.status || "SCHEDULED"),
            textColor: "#ffffff",
          };
        } catch (error) {
          console.error("Error processing interview:", error, interview);
          return null;
        }
      })
    );

    // Filter out any null events that failed to process
    const validEvents = events.filter((event) => event !== null);

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      events: validEvents,
      eventClick: function (info) {
        showInterviewDetails(info.event);
      },
      eventDisplay: "block",
      eventTimeFormat: {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
      height: "auto",
      nowIndicator: true,
      editable: false, // Interviewers can't reschedule directly
      eventDidMount: function (info) {
        // Add status badge to event
        const statusEl = document.createElement("div");
        statusEl.className = "fc-event-status";
        statusEl.innerHTML = `<span class="badge">${info.event.extendedProps.status}</span>`;
        const mainEl = info.el.querySelector(".fc-event-main");
        if (mainEl) {
          mainEl.prepend(statusEl);
        }
      },
    });

    calendar.render();
  } catch (error) {
    console.error("Error initializing calendar:", error);
    document.getElementById("calendar").innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle"></i> 
        Failed to load calendar data: ${error.message}
      </div>
    `;
  }
}

function showInterviewDetails(event) {
  const interview = event.extendedProps.interview;
  const candidate = event.extendedProps.candidate;

  // Set candidate information
  document.getElementById("modalCandidateName").textContent =
    candidate?.name || "N/A";
  document.getElementById("modalCandidateRole").textContent =
    candidate?.roleApplied || "N/A";
  document.getElementById("modalCandidateExperience").textContent =
    candidate?.experience ? `${candidate.experience} years` : "N/A";

  // Set interview details
  document.getElementById("modalInterviewDate").textContent = formatDate(
    interview.date
  );
  document.getElementById("modalInterviewTime").textContent = formatTime(
    interview.time
  );
  document.getElementById("modalInterviewDuration").textContent =
    interview.duration ? `${interview.duration} minutes` : "N/A";

  // Set status with appropriate color
  const statusBadge = document.getElementById("modalInterviewStatus");
  statusBadge.textContent = interview.status || "SCHEDULED";
  statusBadge.className = "badge";
  statusBadge.style.backgroundColor = getEventColor(
    interview.status || "SCHEDULED"
  );

  // Set additional information
  document.getElementById("modalInterviewType").textContent =
    interview.type || "N/A";
  document.getElementById("modalInterviewNotes").textContent =
    interview.notes || "No additional notes";

  // Show/hide action buttons based on status
  const viewFeedbackBtn = document.getElementById("viewFeedbackBtn");
  const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");

  viewFeedbackBtn.style.display =
    interview.status === "COMPLETED" ? "block" : "none";
  submitFeedbackBtn.style.display =
    interview.status === "COMPLETED" ? "block" : "none";

  // Set up button click handlers
  viewFeedbackBtn.onclick = () => {
    window.location.href = `interviewer-feedback.html?interviewId=${interview.id}`;
  };

  submitFeedbackBtn.onclick = () => {
    window.location.href = `feedback-form.html?interviewId=${interview.id}`;
  };

  // Show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("interviewDetailsModal")
  );
  modal.show();
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return "N/A";

  try {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return dateString || "N/A";
  }
}

function formatTime(timeString) {
  if (!timeString) return "N/A";

  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    if (isNaN(hour)) {
      return timeString;
    }
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  } catch (error) {
    console.error("Error formatting time:", error, timeString);
    return timeString || "N/A";
  }
}

function calculateEndTime(startTime, duration) {
  if (!startTime) return "00:00";

  try {
    const [hours, minutes] = startTime.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid time format:", startTime);
      return "00:00";
    }

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + (duration || 60) * 60000);
    return `${String(endDate.getHours()).padStart(2, "0")}:${String(
      endDate.getMinutes()
    ).padStart(2, "0")}`;
  } catch (error) {
    console.error("Error calculating end time:", error);
    return "00:00";
  }
}

function getEventColor(status) {
  const colors = {
    SCHEDULED: "#3498db", // Blue
    COMPLETED: "#2ecc71", // Green
    PENDING_FEEDBACK: "#f39c12", // Orange
    CANCELLED: "#e74c3c", // Red
    RESCHEDULED: "#9b59b6", // Purple
    RESCHEDULE_REQUESTED: "#ff7f50", // Coral
  };
  return colors[status] || "#3498db";
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
