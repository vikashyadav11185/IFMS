document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  preventBackNavigation();
  loadCandidates();
  loadInterviewers();
  setupEventListeners();
  setupLogoutHandler();
});

function setupLogoutHandler() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
  });
}

function checkAuthStatus() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "HR_MANAGER") {
    window.location.href = "index.html";
  }
}

function preventBackNavigation() {
  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", function () {
    window.history.pushState(null, "", window.location.href);
  });
}

function setupEventListeners() {
  // Add Candidate
  document.getElementById("addCandidateBtn").addEventListener("click", () => {
    const modal = new bootstrap.Modal(
      document.getElementById("addCandidateModal")
    );
    modal.show();
  });

  // Save Candidate
  document
    .getElementById("saveCandidateBtn")
    .addEventListener("click", saveCandidate);

  // Update Candidate
  document
    .getElementById("updateCandidateBtn")
    .addEventListener("click", updateCandidate);

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });

  document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });
}

async function loadCandidates() {
  try {
    showLoading("candidatesTable");

    const token = getAuthToken();
    const response = await fetchWithAuth(
      "http://localhost:9090/api/candidates",
      token
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const candidates = await response.json();
    renderCandidates(candidates);
  } catch (error) {
    console.error("Error loading candidates:", error);
    showAlert(`Failed to load candidates: ${error.message}`, "error");
    document.getElementById("candidatesTable").innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">Failed to load candidates</td>
            </tr>
        `;
  }
}

async function loadInterviewers() {
  try {
    showLoading("interviewersTable");

    const token = getAuthToken();
    const response = await fetchWithAuth(
      "http://localhost:9090/api/interviewers",
      token
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const interviewers = await response.json();
    renderInterviewers(interviewers);
  } catch (error) {
    console.error("Error loading interviewers:", error);
    showAlert(`Failed to load interviewers: ${error.message}`, "error");
    document.getElementById("interviewersTable").innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">Failed to load interviewers</td>
            </tr>
        `;
  }
}

function renderCandidates(candidates) {
  const tableBody = document.getElementById("candidatesTable");
  tableBody.innerHTML = "";

  if (!candidates || candidates.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No candidates found</td>
            </tr>
        `;
    return;
  }

  candidates.forEach((candidate) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${candidate.name || "-"}</td>
            <td>${candidate.email || "-"}</td>
            <td>${candidate.roleApplied || "-"}</td>
            <td><span class="badge ${getStatusBadgeClass(
              candidate.status
            )} status-badge">${candidate.status || "-"}</span></td>
            <td>${
              candidate.lastInterviewDate
                ? formatDate(candidate.lastInterviewDate)
                : "N/A"
            }</td>
            <td>
                <button class="btn btn-sm btn-primary action-btn view-candidate" data-id="${
                  candidate.id
                }" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-info action-btn edit-candidate" data-id="${
                  candidate.id
                }" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger action-btn delete-candidate" data-id="${
                  candidate.id
                }" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Add event listeners to buttons
  document.querySelectorAll(".view-candidate").forEach((btn) => {
    btn.addEventListener("click", () =>
      viewCandidate(btn.getAttribute("data-id"))
    );
  });

  document.querySelectorAll(".edit-candidate").forEach((btn) => {
    btn.addEventListener("click", () =>
      editCandidate(btn.getAttribute("data-id"))
    );
  });

  document.querySelectorAll(".delete-candidate").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteCandidate(btn.getAttribute("data-id"))
    );
  });
}

function renderInterviewers(interviewers) {
  const tableBody = document.getElementById("interviewersTable");
  tableBody.innerHTML = "";

  if (!interviewers || interviewers.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No interviewers found</td>
            </tr>
        `;
    return;
  }

  interviewers.forEach((interviewer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${interviewer.name || "-"}</td>
            <td>${interviewer.email || "-"}</td>
            <td>${"Interviewer" || "-"}</td>
            <td>${interviewer.position || "Development"}</td>
            <td>${interviewer.assignedInterviews || 0}</td>
            <td>
                <button class="btn btn-sm btn-primary action-btn view-interviewer" data-id="${
                  interviewer.id
                }" title="View">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Add event listeners to buttons
  document.querySelectorAll(".view-interviewer").forEach((btn) => {
    btn.addEventListener("click", () =>
      viewInterviewer(btn.getAttribute("data-id"))
    );
  });
}

async function saveCandidate() {
  const candidateForm = document.getElementById("candidateForm");
  if (!candidateForm.checkValidity()) {
    candidateForm.classList.add("was-validated");
    return;
  }

  try {
    // Show loading state
    const saveBtn = document.getElementById("saveCandidateBtn");
    const saveBtnText = document.getElementById("saveCandidateBtnText");
    const saveBtnSpinner = document.getElementById("saveCandidateBtnSpinner");

    saveBtn.disabled = true;
    saveBtnText.textContent = "Saving...";
    saveBtnSpinner.classList.remove("d-none");

    const token = getAuthToken();

    const candidateData = {
      name: document.getElementById("candidateName").value,
      email: document.getElementById("candidateEmail").value,
      roleApplied: document.getElementById("candidatePosition").value,
      experience: parseInt(
        document.getElementById("candidateExperience").value
      ),
      status: document.getElementById("candidateStatus").value,
    };

    const response = await fetch("http://localhost:9090/api/candidates", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidateData),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    // Handle resume upload separately if needed
    const resumeFile = document.getElementById("candidateResume").files[0];
    if (resumeFile) {
      await uploadResume((await response.json()).id, resumeFile, token);
    }

    // Close modal and refresh table
    bootstrap.Modal.getInstance(
      document.getElementById("addCandidateModal")
    ).hide();
    candidateForm.reset();
    candidateForm.classList.remove("was-validated");
    await loadCandidates();

    showAlert("Candidate added successfully!", "success");
  } catch (error) {
    console.error("Error saving candidate:", error);
    showAlert(`Failed to save candidate: ${error.message}`, "error");
  } finally {
    // Reset button state
    const saveBtn = document.getElementById("saveCandidateBtn");
    const saveBtnText = document.getElementById("saveCandidateBtnText");
    const saveBtnSpinner = document.getElementById("saveCandidateBtnSpinner");

    saveBtn.disabled = false;
    saveBtnText.textContent = "Save Candidate";
    saveBtnSpinner.classList.add("d-none");
  }
}

async function uploadResume(candidateId, file, token) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(
    `http://localhost:9090/api/candidates/${candidateId}/resume`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

async function viewCandidate(candidateId) {
  try {
    const token = getAuthToken();
    const response = await fetchWithAuth(
      `http://localhost:9090/api/candidates/${candidateId}`,
      token
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const candidate = await response.json();

    // Populate modal
    document.getElementById("viewCandidateName").textContent =
      candidate.name || "-";
    document.getElementById("viewCandidateEmail").textContent =
      candidate.email || "-";
    document.getElementById("viewCandidatePosition").textContent =
      candidate.roleApplied || "-";
    document.getElementById("viewCandidateExperience").textContent =
      candidate.experience ? `${candidate.experience} years` : "-";
    document.getElementById("viewCandidateLastInterview").textContent =
      candidate.lastInterviewDate ? formatDate(candidate.date) : "N/A";

    // Set status badge
    const statusBadge = document.getElementById("viewCandidateStatus");
    statusBadge.textContent = candidate.status || "-";
    statusBadge.className = `badge ${getStatusBadgeClass(
      candidate.status
    )} status-badge`;

    // Set resume link if available
    const resumeDiv = document.getElementById("viewCandidateResume");
    if (candidate.resumePath) {
      resumeDiv.innerHTML = `
                <a href="http://localhost:9090/${candidate.resumePath}" target="_blank" class="resume-link">
                    <i class="fas fa-file-pdf text-danger me-1"></i>
                    Download Resume
                </a>
            `;
    } else {
      resumeDiv.textContent = "No resume uploaded";
    }

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("viewCandidateModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error viewing candidate:", error);
    showAlert(`Failed to load candidate details: ${error.message}`, "error");
  }
}

async function editCandidate(candidateId) {
  try {
    const token = getAuthToken();
    const response = await fetchWithAuth(
      `http://localhost:9090/api/candidates/${candidateId}`,
      token
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const candidate = await response.json();

    // Populate form
    document.getElementById("editCandidateId").value = candidate.id;
    document.getElementById("editCandidateName").value = candidate.name || "";
    document.getElementById("editCandidateEmail").value = candidate.email || "";
    document.getElementById("editCandidatePosition").value =
      candidate.roleApplied || "";
    document.getElementById("editCandidateExperience").value =
      candidate.experience || "";
    document.getElementById("editCandidateStatus").value =
      candidate.status || "NEW";

    // Show current resume if available
    const currentResumeDiv = document.getElementById("currentResume");
    if (candidate.resumePath) {
      currentResumeDiv.innerHTML = `
                <a href="http://localhost:9090/${candidate.resumePath}" target="_blank" class="resume-link">
                    <i class="fas fa-file-pdf text-danger me-1"></i>
                    View Current Resume
                </a>
            `;
    } else {
      currentResumeDiv.textContent = "No resume uploaded";
    }

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("editCandidateModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error loading candidate for edit:", error);
    showAlert(
      `Failed to load candidate for editing: ${error.message}`,
      "error"
    );
  }
}

async function updateCandidate() {
  const editCandidateForm = document.getElementById("editCandidateForm");
  if (!editCandidateForm.checkValidity()) {
    editCandidateForm.classList.add("was-validated");
    return;
  }

  try {
    // Show loading state
    const updateBtn = document.getElementById("updateCandidateBtn");
    const updateBtnText = document.getElementById("updateCandidateBtnText");
    const updateBtnSpinner = document.getElementById(
      "updateCandidateBtnSpinner"
    );

    updateBtn.disabled = true;
    updateBtnText.textContent = "Updating...";
    updateBtnSpinner.classList.remove("d-none");

    const candidateId = document.getElementById("editCandidateId").value;
    const token = getAuthToken();

    const candidateData = {
      name: document.getElementById("editCandidateName").value,
      email: document.getElementById("editCandidateEmail").value,
      roleApplied: document.getElementById("editCandidatePosition").value,
      experience: parseInt(
        document.getElementById("editCandidateExperience").value
      ),
      status: document.getElementById("editCandidateStatus").value,
    };

    const response = await fetch(
      `http://localhost:9090/api/candidates/${candidateId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      }
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    // Handle resume upload if a new file was selected
    const resumeFile = document.getElementById("editCandidateResume").files[0];
    if (resumeFile) {
      await uploadResume(candidateId, resumeFile, token);
    }

    // Close modal and refresh table
    bootstrap.Modal.getInstance(
      document.getElementById("editCandidateModal")
    ).hide();
    editCandidateForm.reset();
    editCandidateForm.classList.remove("was-validated");
    await loadCandidates();

    showAlert("Candidate updated successfully!", "success");
  } catch (error) {
    console.error("Error updating candidate:", error);
    showAlert(`Failed to update candidate: ${error.message}`, "error");
  } finally {
    // Reset button state
    const updateBtn = document.getElementById("updateCandidateBtn");
    const updateBtnText = document.getElementById("updateCandidateBtnText");
    const updateBtnSpinner = document.getElementById(
      "updateCandidateBtnSpinner"
    );

    updateBtn.disabled = false;
    updateBtnText.textContent = "Update Candidate";
    updateBtnSpinner.classList.add("d-none");
  }
}

async function deleteCandidate(candidateId) {
  if (!confirm("Are you sure you want to delete this candidate?")) {
    return;
  }

  try {
    const token = getAuthToken();
    const response = await fetchWithAuth(
      `http://localhost:9090/api/candidates/${candidateId}`,
      token,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await loadCandidates();
    showAlert("Candidate deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting candidate:", error);
    showAlert(`Failed to delete candidate: ${error.message}`, "error");
  }
}

async function viewInterviewer(interviewerId) {
  try {
    const token = getAuthToken();
    const response = await fetchWithAuth(
      `http://localhost:9090/api/interviewers/${interviewerId}`,
      token
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const interviewer = await response.json();

    // Create and show a simple modal with interviewer details
    const modalContent = `
      <div class="modal-header">
        <h5 class="modal-title">Interviewer Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-bold">Full Name</label>
              <p>${interviewer.name || "-"}</p>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Email</label>
              <p>${interviewer.email || "-"}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-bold">Position</label>
              <p>${interviewer.position || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    `;

    // Create a temporary modal container
    const modalContainer = document.createElement("div");
    modalContainer.innerHTML = `
      <div class="modal fade" id="interviewerModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            ${modalContent}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalContainer);
    const modal = new bootstrap.Modal(
      document.getElementById("interviewerModal")
    );
    modal.show();

    // Clean up when modal is hidden
    modalContainer
      .querySelector(".modal")
      .addEventListener("hidden.bs.modal", () => {
        document.body.removeChild(modalContainer);
      });
  } catch (error) {
    console.error("Error viewing interviewer:", error);
    showAlert(`Failed to load interviewer details: ${error.message}`, "error");
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "HIRED":
      return "bg-success";
    case "REJECTED":
      return "bg-danger";
    case "INTERVIEWED":
      return "bg-info";
    case "SCHEDULED":
      return "bg-warning";
    default:
      return "bg-secondary";
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function showLoading(tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </td>
        </tr>
    `;
}

// Utility functions
function getAuthToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Authentication required");
  return token;
}

async function fetchWithAuth(url, token, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.append("Authorization", `Bearer ${token}`);

  // Only add Content-Type if we're not sending FormData
  if (!(options.body instanceof FormData)) {
    headers.append("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response;
}

async function getErrorMessage(response) {
  try {
    const errorData = await response.json();
    return (
      errorData.message ||
      errorData.error ||
      `HTTP error! status: ${response.status}`
    );
  } catch {
    return `HTTP error! status: ${response.status}`;
  }
}

function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type === "error" ? "danger" : "success"}`;
  alertDiv.textContent = message;

  Object.assign(alertDiv.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "10px 20px",
    borderRadius: "4px",
    zIndex: "1000",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    animation: "fadeIn 0.3s ease-in-out",
  });

  document.body.appendChild(alertDiv);
  setTimeout(() => {
    alertDiv.style.animation = "fadeOut 0.3s ease-in-out";
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}
