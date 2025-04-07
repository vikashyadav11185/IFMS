// assign-interview.js

document.addEventListener("DOMContentLoaded", function () {
  // Load current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
    name: "HR Manager",
  };
  document.getElementById("userName").textContent = currentUser.name;

  setupLogoutHandler();
  preventBackNavigation();
  checkAuthStatus();

  // Sidebar toggle
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    window.location.href = "index.html";
  });

  // Initialize form
  initializeForm();

  // Form submission
  document
    .getElementById("assign-interview-form")
    .addEventListener("submit", handleFormSubmit);

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", function () {
    if (confirm("Are you sure you want to cancel?")) {
      window.location.href = "hr-workflow.html";
    }
  });
});

async function initializeForm() {
  try {
    // Set default date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById("interview-date").valueAsDate = tomorrow;
    document.getElementById("interview-time").value = "10:00";

    // Load data
    await Promise.all([loadCandidates(), loadInterviewers()]);

    // Initialize interview type visibility
    updateMeetingLinkVisibility();
    document
      .getElementById("interview-type")
      .addEventListener("change", updateMeetingLinkVisibility);

    // Check if editing existing interview
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("id")) {
      await loadInterviewData(urlParams.get("id"));
      document.querySelector(".card-title").textContent =
        "Edit Interview Assignment";
    }
  } catch (error) {
    console.error("Initialization error:", error);
    showAlert("Failed to initialize form. Please refresh the page.", "error");
  }
}

function updateMeetingLinkVisibility() {
  const isOnline = document.getElementById("interview-type").value === "online";
  document.getElementById("meeting-link-group").style.display = isOnline
    ? "block"
    : "none";
  document.getElementById("meeting-link").required = isOnline;
}

async function loadCandidates() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch("http://localhost:9090/api/candidates", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to fetch candidates: ${response.status}`
      );
    }

    const candidates = await response.json();
    const select = document.getElementById("candidate-select");

    // Clear existing options
    select.innerHTML = '<option value="">Select Candidate</option>';

    // Add candidate options
    candidates.forEach((candidate) => {
      const option = document.createElement("option");
      option.value = candidate.id;
      option.textContent = `${candidate.name} - ${candidate.email} - ${candidate.roleApplied}`;
      option.dataset.name = candidate.name;
      option.dataset.email = candidate.email;
      option.dataset.role = candidate.roleApplied || "";
      option.dataset.experience = candidate.experience || "";
      select.appendChild(option);
    });

    // Auto-fill candidate details when selected
    select.addEventListener("change", function () {
      const selected = this.options[this.selectedIndex];
      document.getElementById("candidate-name").value =
        selected.dataset.name || "";
      document.getElementById("candidate-email").value =
        selected.dataset.email || "";
      document.getElementById("role-applied").value =
        selected.dataset.role || "";
      document.getElementById("experience").value =
        selected.dataset.experience || "";
    });
  } catch (error) {
    console.error("Error loading candidates:", error);
    showAlert(`Failed to load candidates: ${error.message}`, "error");
  }
}

async function loadInterviewers() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Authentication required. Please login again.");
    }

    // Use the correct endpoint - changed from /api/user/interviewers to /api/interviewers
    const response = await fetch("http://localhost:9090/api/interviewers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to fetch interviewers: ${response.status}`
      );
    }

    const interviewers = await response.json();
    const select = document.getElementById("interviewer-select");

    // Clear existing options
    select.innerHTML = '<option value="">Select Interviewer</option>';

    // Add interviewer options
    interviewers.forEach((interviewer) => {
      const option = document.createElement("option");
      option.value = interviewer.id;

      // Use the correct property names based on your InterviewerDto
      const name = interviewer.name || interviewer.fullName || "Interviewer";
      const position = interviewer.position || "General";

      option.textContent = `${name} (${position})`;
      option.dataset.email = interviewer.email || "";
      option.dataset.position = position;
      select.appendChild(option);
    });

    if (select.options.length === 1) {
      // Only default option exists
      const option = document.createElement("option");
      option.textContent = "No interviewers available";
      option.disabled = true;
      select.appendChild(option);
      showAlert("No interviewers found in the system", "warning");
    }
  } catch (error) {
    console.error("Error loading interviewers:", error);
    const select = document.getElementById("interviewer-select");
    select.innerHTML = '<option value="">Select Interviewer</option>';
    const option = document.createElement("option");
    option.textContent = "Error loading interviewers";
    option.disabled = true;
    select.appendChild(option);
    showAlert(`Failed to load interviewers: ${error.message}`, "error");
  }
}
async function loadInterviewData(interviewId) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(
      `http://localhost:9090/api/interviews/${interviewId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to fetch interview: ${response.status}`
      );
    }

    const interview = await response.json();

    // Set candidate
    document.getElementById("candidate-select").value = interview.candidateId;
    document.getElementById("candidate-name").value =
      interview.candidateName || "";
    document.getElementById("candidate-email").value =
      interview.candidateEmail || "";
    document.getElementById("role-applied").value =
      interview.candidateRole || "";
    document.getElementById("experience").value =
      interview.candidateExperience || "";

    // Set interview details
    document.getElementById("interviewer-select").value =
      interview.interviewerId;
    document.getElementById("interview-round").value = interview.round;
    document.getElementById("interview-date").value = interview.date;
    document.getElementById("interview-time").value = interview.time;
    document.getElementById("duration").value = interview.duration;
    document.getElementById("interview-type").value =
      interview.type.toLowerCase();
    document.getElementById("meeting-link").value = interview.meetingLink || "";
    document.getElementById("notes").value = interview.notes || "";
    document.getElementById("send-email").checked =
      interview.sendEmail || false;

    // Update visibility
    updateMeetingLinkVisibility();
  } catch (error) {
    console.error("Error loading interview data:", error);
    showAlert(`Failed to load interview data: ${error.message}`, "error");
    window.location.href = "hr-workflow.html";
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  try {
    // Get form elements
    const form = event.target;
    const candidateId = document.getElementById("candidate-select").value;
    const interviewerId = document.getElementById("interviewer-select").value;

    // Validate required fields
    if (!candidateId || !interviewerId) {
      showAlert("Please select both a candidate and an interviewer", "error");
      return;
    }

    if (!form.checkValidity()) {
      showAlert("Please fill all required fields correctly", "error");
      return;
    }

    // Prepare request data
    const interviewData = {
      candidateId: candidateId,
      interviewerId: interviewerId,
      round: document.getElementById("interview-round").value,
      date: document.getElementById("interview-date").value,
      time: document.getElementById("interview-time").value,
      duration: parseInt(document.getElementById("duration").value),
      type: document.getElementById("interview-type").value.toUpperCase(),
      meetingLink:
        document.getElementById("interview-type").value === "online"
          ? document.getElementById("meeting-link").value
          : null,
      notes: document.getElementById("notes").value,
      sendEmail: document.getElementById("send-email").checked,
      status: "SCHEDULED",
    };

    // Get JWT token
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Authentication required. Please login again.");
    }

    // Check if editing existing interview
    const urlParams = new URLSearchParams(window.location.search);
    const interviewId = urlParams.get("id");
    const method = interviewId ? "PUT" : "POST";
    const endpoint = interviewId
      ? `http://localhost:9090/api/interviews/${interviewId}`
      : "http://localhost:9090/api/interviews";

    // Submit to backend
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(interviewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save interview");
    }

    // Success
    showAlert(
      interviewId
        ? "Interview updated successfully!"
        : "Interview scheduled successfully!",
      "success"
    );
    setTimeout(() => {
      window.location.href = "hr-workflow.html";
    }, 1500);
  } catch (error) {
    console.error("Error submitting form:", error);
    showAlert(`Error: ${error.message}`, "error");
  }
}

function showAlert(message, type = "info") {
  const alertBox = document.createElement("div");
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.position = "fixed";
  alertBox.style.top = "20px";
  alertBox.style.right = "20px";
  alertBox.style.zIndex = "1000";
  alertBox.style.padding = "10px 20px";
  alertBox.style.borderRadius = "4px";
  alertBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";

  document.body.appendChild(alertBox);
  setTimeout(() => {
    alertBox.remove();
  }, 3000);
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

  if (!token || role !== "HR_MANAGER") {
    window.location.href = "index.html";
  }
}
